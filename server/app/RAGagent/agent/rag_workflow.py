from langchain_core.tools import tool
from app.RAGagent.rag.pipeline import vector_store
from app.agent.LLM.llm import react_llm
from langgraph.graph import START, END, StateGraph
from langchain_core.messages.utils import trim_messages, count_tokens_approximately
from langgraph.graph.message import add_messages
from langchain_core.messages import HumanMessage, BaseMessage, AIMessage
from typing import TypedDict, Annotated
from langgraph.prebuilt import ToolNode, tools_condition
from .system_prompt import PROMPT
from pydantic import BaseModel, Field
@tool
async def retrieve_information(query: str, namespace: str):
    """
    This tool is used to retrieve relevant chunks of information from the vector store based on the query.
    """
    try:
        store = vector_store(namespace)
        relevant_chunks =await store.asimilarity_search_with_score(query, k=10)
        result = [doc.page_content for doc, score in relevant_chunks if score >= 0.1]
        if not result:
            return "No relevant information found "
        return "\n".join(result)
    except Exception as e:
        return "Error while retreving chunks"


tools = [retrieve_information]
toolnode = ToolNode(tools)


class MessagesState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


async def chat(state: MessagesState):
    stm = trim_messages(
        state["messages"],
        strategy="last",
        token_counter=count_tokens_approximately,
        max_tokens=4000,
        start_on=HumanMessage,
        include_system=True,
    )
    response =await react_llm.bind_tools(tools).ainvoke([PROMPT, *stm])
    return {"messages": [response]}


rag_graph = StateGraph(MessagesState)
rag_graph.add_node("chat", chat)
rag_graph.add_node("tools", toolnode)

rag_graph.add_edge(START, "chat")
rag_graph.add_edge("tools", "chat")
rag_graph.add_conditional_edges("chat", tools_condition)
