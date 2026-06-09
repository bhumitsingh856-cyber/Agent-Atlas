from langgraph.graph import StateGraph, START, END
from langchain_core.messages import (
    SystemMessage,
    HumanMessage,
    BaseMessage,
    ToolMessage,
    AIMessage,
)
from langgraph.types import Send
from typing import TypedDict, Annotated
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.graph.message import add_messages
import operator

from .LLM.llm import (
    prompt_enhancer_llm,
    planner_llm,
    researcher_llm,
    worker_llm,
    citation_llm,
    summary_llm,
)
from .prompts.planner import planner_prompt
from .prompts.worker import worker_prompt
from .prompts.promptEnhancer import prompt_enhancer_prompt
from .prompts.researcher import researcher_prompt
from .prompts.citation import citation_prompt
from .prompts.summary import summary_prompt

from .schema.prompt_enhancer import PromptEnhancerSchema
from .schema.planner_schema import PlannerSchema
from .schema.worker_schema import WorkerSchema
from .tools.web_search import web_search


# Graph State
class ResearchState(TypedDict):
    topic: str
    plan: list[PlannerSchema]
    plan_error: bool
    max_plan_retry: int
    sources: Annotated[list[dict], operator.add]
    sections: Annotated[list[str], operator.add]
    summary: Annotated[list[str], operator.add]
    final_sections: str
    final_summary: str
    final_sources: str
    report: str


# Subgraph State
class ResearcherState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    sources: Annotated[list[dict], operator.add]
    sections: Annotated[list[str], operator.add]
    summary: Annotated[list[str], operator.add]


# Prompt Enhancer Node
async def prompt_enhancer(state: ResearchState):
    try:
        prompt_enhancer = await prompt_enhancer_llm.with_structured_output(
            PromptEnhancerSchema
        ).ainvoke(
            [
                SystemMessage(content=prompt_enhancer_prompt),
                HumanMessage(content=state["topic"]),
            ]
        )
        return {"topic": prompt_enhancer.topic}
    except Exception as e:
        return {"topic": state["topic"]}


# Planner Node
async def planner_agent(state: ResearchState):
    print("Agent - planning research")
    try:
        plan = await planner_llm.with_structured_output(PlannerSchema).ainvoke(
            [
                SystemMessage(content=planner_prompt),
                HumanMessage(content=state["topic"]),
            ]
        )

        return {"plan": plan.tasks, "plan_error": False}

    except Exception as e:
        return {"plan_error": True, "max_plan_retry": state["max_plan_retry"] + 1}


# Spawning parallel Subgraph
def fan_out(state: ResearchState):
    if state["plan_error"] or len(state["plan"]) == 0:
        if state["max_plan_retry"] >= 3:
            return [Send("plan_generation_failed", state)]
        else:
            return [
                Send(
                    "planner",
                    {
                        **state,
                    },
                )
            ]
    tasks = state["plan"]
    return [
        Send(
            "researcher",
            {
                "messages": [
                    HumanMessage(
                        content=f"""Topic of the Research : {state["topic"]}\n
                                    Section : {task.section_title}\n
                                    Research Questions : {task.research_questions}\n
                                    Key Topics : {task.key_topics}\n
                                    Brief : {task.brief}\n
                                """
                    )
                ],
            },
        )
        for task in tasks
    ]


# Planner error handling
def plan_generation_failed(state: ResearchState):
    return {
        "report": "Research Failed due to failed plan generation , please try again."
    }


# Subgraph research node
async def researcher(state: ResearcherState):
    messages = state["messages"]

    formatted = []
    for msg in messages:
        # truncate huge tool outputs
        if isinstance(msg, ToolMessage):
            content = str(msg.content)
            formatted.append(
                ToolMessage(
                    content=content[:100] + "...",  # truncate
                    tool_call_id=msg.tool_call_id,
                )
            )
        elif isinstance(msg, HumanMessage):
            formatted.append(msg)
        # optionally trim long ai reasoning
        elif isinstance(msg, AIMessage):
            formatted.append(
                AIMessage(content=str(msg.content), tool_calls=msg.tool_calls)
            )
    try:
        researcher = await researcher_llm.bind_tools([web_search]).ainvoke(
            [SystemMessage(content=researcher_prompt), *formatted]
        )
        return {"messages": [researcher]}
    except Exception as e:
        return {"messages": [ToolMessage(content="Research failed")]}


# Subgraph writer node
async def worker(state: dict):
    messages = state["messages"]
    research = []
    for i in messages:
        if isinstance(i, HumanMessage):
            research.append(HumanMessage(content=i.content))
        elif isinstance(i, ToolMessage):
            research.append(
                HumanMessage(content=f"Research findings : \n{str(i.content)}")
            )
    try:
        worker = await worker_llm.with_structured_output(WorkerSchema).ainvoke(
            [SystemMessage(content=worker_prompt), *research]
        )
        return {
            "sections": [worker.content],
            "summary": [worker.summary],
            "sources": worker.sources,
        }
    except Exception as e:
        return {
            "sections": ["Failed generation for this section "],
        }


# Graph research stiching
async def aggregator(state: ResearchState):
    report = "\n\n".join(state["sections"])
    try:
        summary = await summary_llm.ainvoke(
            [
                SystemMessage(content=summary_prompt),
                HumanMessage(
                    content=f"Topic : {state['topic']} , section summaries : {str(state['summary'])}"
                ),
            ]
        )
        sources = await citation_llm.ainvoke(
            [
                SystemMessage(content=citation_prompt),
                HumanMessage(content=f"All Refrences : {str(state['sources'])}"),
            ]
        )
        return {
            "final_sections": report,
            "final_summary": summary.content,
            "final_sources": sources.content,
        }
    except Exception as e:
        return {
            "final_sections": report,
            "final_summary": " ",
            "final_sources": " ",
        }


# Generating final research
def final_result(state: ResearchState):
    report = state["final_summary"] + state["final_sections"] + state["final_sources"]
    return {"report": report}


# Tools
tools = [web_search]
toolnode = ToolNode(tools)

# Subgraph
subgraph = StateGraph(ResearcherState)

subgraph.add_node("researcher", researcher)
subgraph.add_node("tools", toolnode)
subgraph.add_node("worker", worker)

subgraph.add_edge(START, "researcher")
subgraph.add_conditional_edges(
    "researcher", tools_condition, {"tools": "tools", "__end__": "worker"}
)
subgraph.add_edge("tools", "researcher")
subgraph.add_edge("worker", END)

researcher_subgraph = subgraph.compile()

# Graph
graph = StateGraph(ResearchState)

graph.add_node("prompt_enhancer", prompt_enhancer)
graph.add_node("planner", planner_agent)
graph.add_node("aggregator", aggregator)
graph.add_node("researcher", researcher_subgraph)
graph.add_node("final_result", final_result)
graph.add_node("plan_generation_failed", plan_generation_failed)

graph.add_edge(START, "prompt_enhancer")
graph.add_edge("prompt_enhancer", "planner")
graph.add_conditional_edges(
    "planner", fan_out, ["researcher", "planner", "plan_generation_failed"]
)
graph.add_edge("researcher", "aggregator")
graph.add_edge("aggregator", "final_result")
graph.add_edge("plan_generation_failed", END)
graph.add_edge("final_result", END)
