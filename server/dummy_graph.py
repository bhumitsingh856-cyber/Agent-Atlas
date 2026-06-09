from langgraph.graph import StateGraph, START, END
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage
from langgraph.types import Send
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages
import operator
from pydantic import BaseModel


# ── Schemas (same as original) ──────────────────────────────────────────────

class TaskSchema(BaseModel):
    section_title: str
    research_questions: list[str]
    key_topics: list[str]
    brief: str
class WorkerOutput(BaseModel):  # ✅ Also Pydantic
    content: str = "## Dummy Section\nThis is a hardcoded research section body."
    summary: str = "Short summary of this section."
    sources: list[dict] = [{"title": "Dummy Source", "url": "https://example.com"}]

# ── States ───────────────────────────────────────────────────────────────────

class ResearchState(TypedDict):
    topic: str
    plan: list[TaskSchema]
    plan_error: bool
    max_plan_retry: int
    sources: Annotated[list[dict], operator.add]
    sections: Annotated[list[str], operator.add]
    summary: Annotated[list[str], operator.add]
    final_sections: str
    final_summary: str
    final_sources: str
    report: str

class ResearcherState(TypedDict):
    messages: Annotated[list, add_messages]
    sources: Annotated[list[dict], operator.add]
    sections: Annotated[list[str], operator.add]
    summary: Annotated[list[str], operator.add]

# ── Dummy Nodes ───────────────────────────────────────────────────────────────

def prompt_enhancer(state: ResearchState):
    # print("Agent - Prompt enhanced")
    # Fake: just append " [enhanced]" instead of calling LLM
    return {"topic": state["topic"] + " [enhanced]"}


def planner_agent(state: ResearchState):
    # print("Agent - Planning research")
    # Fake: return a hardcoded 3-task plan
    dummy_plan = [
        TaskSchema(
            section_title="Introduction",
            research_questions=["What is this topic about?"],
            key_topics=["overview", "history"],
            brief="Introduce the topic broadly."
        ),
        TaskSchema(
            section_title="Core Concepts",
            research_questions=["What are the key ideas?"],
            key_topics=["concepts", "mechanisms"],
            brief="Explain the core concepts."
        ),
        TaskSchema(
            section_title="Conclusion",
            research_questions=["What are the implications?"],
            key_topics=["future", "impact"],
            brief="Summarise findings and implications."
        ),
    ]
    return {"plan": dummy_plan, "plan_error": False}


def fan_out(state: ResearchState):
    if state["plan_error"] or len(state["plan"]) == 0:
        if state["max_plan_retry"] >= 3:
            return [Send("plan_generation_failed", state)]
        else:
            return [Send("planner", {**state})]

    return [
        Send(
            "researcher",
            {
                "messages": [
                    HumanMessage(
                        content=f"""Topic: {state["topic"]}
Section: {task.section_title}
Research Questions: {task.research_questions}
Key Topics: {task.key_topics}
Brief: {task.brief}"""
                    )
                ],
            },
        )
        for task in state["plan"]
    ]


def plan_generation_failed(state: ResearchState):
    return {"report": "Research failed due to repeated plan errors. Please try again."}


# ── Dummy Subgraph Nodes ──────────────────────────────────────────────────────

def researcher(state: ResearcherState):
    # print("Subgraph - Researching")
    # Fake: return a dummy AI message, skip tool calling entirely
    fake_response = AIMessage(
        content="I found some relevant information about this topic.",
        tool_calls=[]   # no tools called
    )
    return {"messages": [fake_response]}


def worker(state: ResearcherState):
    # print("Subgraph - Writing section")
    # Fake: return hardcoded section content
    out = WorkerOutput()
    return {
        "sections": [out.content],
        "summary": [out.summary],
        "sources": out.sources,
    }


# ── Dummy Main Graph Nodes ────────────────────────────────────────────────────

def aggregator(state: ResearchState):
    # print("Agent - Aggregating")
    # Fake: join sections, build dummy summary and sources
    report = "\n\n".join(state["sections"])
    summary = f"## Executive Summary\nThis report covers: {state['topic']}.\n\n"
    sources = "\n## References\n- Dummy Source: https://example.com\n"
    return {
        "final_sections": report,
        "final_summary": summary,
        "final_sources": sources,
    }


def final_result(state: ResearchState):
    # print("Agent - Formatting final result")
    r=open('test.md','r').read()
    report = r+"\n"+ state["final_summary"] + state["final_sections"] + state["final_sources"]
    # print("Agent - Done")
    return {"report": report}


# ── Subgraph (no ToolNode since researcher never calls tools) ─────────────────

from langgraph.graph import StateGraph, START, END

subgraph = StateGraph(ResearcherState)
subgraph.add_node("researcher", researcher)
subgraph.add_node("worker", worker)
subgraph.add_edge(START, "researcher")
subgraph.add_edge("researcher", "worker")   # skip tools_condition
subgraph.add_edge("worker", END)

researcher_subgraph = subgraph.compile()

# ── Main Graph ────────────────────────────────────────────────────────────────

graph = StateGraph(ResearchState)

graph.add_node("prompt_enhancer", prompt_enhancer)
graph.add_node("planner", planner_agent)
graph.add_node("aggregator", aggregator)
graph.add_node("researcher", researcher_subgraph)
graph.add_node("final_result", final_result)
graph.add_node("plan_generation_failed", plan_generation_failed)

graph.add_edge(START, "prompt_enhancer")
graph.add_edge("prompt_enhancer", "planner")
graph.add_conditional_edges("planner", fan_out, ["researcher", "planner", "plan_generation_failed"])
graph.add_edge("researcher", "aggregator")
graph.add_edge("aggregator", "final_result")
graph.add_edge("plan_generation_failed", END)
graph.add_edge("final_result", END)

