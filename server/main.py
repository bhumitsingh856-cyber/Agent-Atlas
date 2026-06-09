from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.RAGagent.agent.rag_workflow import rag_graph
from app.agent.workflow import graph

# from dummy_graph import graph
from contextlib import asynccontextmanager
from app.agent.checkpointer import pool
from app.db.db import engine
from app.models.schema import Base
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.db import get_db
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from app.models.schema import User, Research
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
import json
from datetime import datetime
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage

from app.RAGagent.rag.pipeline import (
    store_exists,
    create_chunks,
    store_chunks,
)


@asynccontextmanager
async def lifespan(app):
    await pool.open()

    checkpointer = AsyncPostgresSaver(pool)
    await checkpointer.setup()

    app.state.graph = graph.compile(checkpointer=checkpointer)
    app.state.rag_graph = rag_graph.compile(checkpointer=checkpointer)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    await engine.dispose()
    await pool.close()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/webhook/clerk")
async def clerk_webhook(req: Request, db: AsyncSession = Depends(get_db)):
    try:
        event = await req.json()
        if event["type"] == "user.created":
            data = event["data"]
            newuser = User(
                name=f"{data['first_name']} {data['last_name']}",
                email=data["email_addresses"][0]["email_address"],
                clerk_id=data["id"],
            )
            db.add(newuser)
            await db.commit()
        return 200
    except Exception as e:
        return 500


@app.post("/generate-research")
async def generateResearch(req: Request, db: AsyncSession = Depends(get_db)):

    data = await req.json()
    workflow = req.app.state.graph

    async def generate():
        report: str = ""
        async for event in workflow.astream_events(
            {"topic": data["topic"]}, {"configurable": {"thread_id": data["id"]}}
        ):
            kind = event["event"]
            timestamp = datetime.now().strftime("%H:%M:%S")
            node_name = event["name"]
            yield f"{json.dumps({'operation': 'log', 'type': kind, 'node': node_name, 'timestamp': timestamp})}\n"

            if kind == "on_chain_start":
                yield f"{json.dumps({'operation': 'node', 'type': 'node_start', 'node': node_name, 'timestamp': timestamp})}\n"

            elif kind == "on_chain_end":
                node_name = event["name"]
                yield f"{json.dumps({'operation': 'node', 'type': 'node_end', 'node': node_name, 'timestamp': timestamp})}\n"
            if kind == "on_chain_stream" and event["name"] == "final_result":
                report += event["data"]["chunk"]["report"]
                yield f"{json.dumps({'operation': 'result', 'result': event['data']['chunk']['report']})}\n"

        yield f"{json.dumps({'type': 'done'})}\n"

        for i in range(3):
            try:
                row = await db.get(Research, int(data["id"]))
                if row:
                    row.topic = data["topic"]
                    row.report = report
                    await db.commit()
                break
            except Exception as e:
                print(f"[ERROR] Failed to save research: {e}")

    return StreamingResponse(generate(), media_type="text/event-stream")


@app.post("/get-research")
async def getResearch(req: Request, db: AsyncSession = Depends(get_db)):
    try:
        data = await req.json()
        research = await db.execute(
            select(Research).where(Research.id == data["research_id"])
        )
        return {"success": True, "research": research.scalar_one_or_none()}
    except Exception as e:
        return {
            "success": False,
            "message": "Internal server error in getting research",
        }


@app.post("/get-researches")
async def researches(req: Request, db: AsyncSession = Depends(get_db)):
    try:
        data = await req.json()
        user_researches = await db.execute(
            select(User)
            .options(
                selectinload(User.researches).load_only(
                    Research.id, Research.topic, Research.createdAt, Research.report
                )
            )
            .where(User.clerk_id == data["clerk_id"])
        )
        return {
            "success": True,
            "researches": user_researches.scalar_one_or_none().researches,
        }
    except Exception as e:
        print(e)
        return {
            "success": False,
            "message": "Internal server error in getting researches",
        }


@app.post("/new-research")
async def newResearch(req: Request, db: AsyncSession = Depends(get_db)):
    try:
        data = await req.json()
        new_research = Research(
            user_id=data["clerk_id"],
            topic="",
            report="",
        )
        db.add(new_research)
        await db.commit()
        await db.refresh(new_research)
        return {
            "success": True,
            "research": new_research,
            "message": "Research created successfully",
        }
    except Exception as e:
        return {"success": False, "message": "Internal server error"}


@app.post("/delete-research")
async def deleteReseach(req: Request, db: AsyncSession = Depends(get_db)):
    try:
        data = await req.json()
        await db.execute(delete(Research).where(Research.id == data["research_id"]))
        await db.commit()
        return {"success": True, "message": "Research deleted successfully"}
    except Exception as e:
        return {
            "success": False,
            "message": "Internal server error in deleting research",
        }


@app.post("/research-QA")
async def researchQA(req: Request):
    data = await req.json()
    agent = req.app.state.rag_graph
    namespace = f"research-{data['research_id']}"

    async def generator():
        async for msg, meta in agent.astream(
            {
                "messages": [
                    HumanMessage(
                        content=f"query : {data['query']} \n namespace:{namespace}"
                    )
                ]
            },
            {"configurable": {"thread_id": data["research_id"]}},
            stream_mode="messages",
        ):
            if meta.get("langgraph_node") == "chat":
                if msg.content:
                    yield f"{msg.content}"

    return StreamingResponse(generator(), media_type="text/event-stream")


@app.post("/create-namespace")
async def createNamespace(req: Request):
    data = await req.json()
    namespace: str = f"research-{data['research_id']}"
    report: str = data["report"]
    try:
        if not store_exists(namespace):
            await store_chunks(create_chunks(report), namespace)
        return {
            "success": True,
            "message": "Namespace created successfully",
        }
    except Exception as e:
        return {
            "success": False,
            "message": "Internal server error in creating namespace",
        }


# @app.post("/create-user")
# async def create(req: Request, db: AsyncSession = Depends(get_db)):
#     data=await req.json()
#     try:
#         user=await db.execute(select(User).where(User.clerk_id==data["clerk_id"]))
#         isUser=user.scalar_one_or_none()
#         if not isUser:
#             newuser=User(name=data["name"],email=data["email"],clerk_id=data["clerk_id"])
#             db.add(newuser)
#             await db.commit()
#             return {"success":True,"message": "User created successfully"}
#     except Exception as e:
#         print("--------------------------------------------------------------------------",e)
#         return {"success":False,"message": "Internal server error"}
