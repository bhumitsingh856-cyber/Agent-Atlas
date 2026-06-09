from langchain_groq import ChatGroq
from langchain_fireworks import ChatFireworks
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
from dotenv import load_dotenv

load_dotenv()
# Research LLM
prompt_enhancer_llm = ChatGroq(model="llama-3.1-8b-instant")
planner_llm = ChatGroq(model="llama-3.3-70b-versatile")
researcher_llm = ChatGroq(model="meta-llama/llama-4-scout-17b-16e-instruct")
worker_llm = ChatFireworks(model="accounts/fireworks/models/deepseek-v4-flash")
citation_llm = ChatGroq(model="llama-3.3-70b-versatile")
summary_llm = ChatGroq(model="openai/gpt-oss-120b")

# Rag LLM
react_llm= ChatGroq(model="openai/gpt-oss-120b",streaming=True)
embedding_model = NVIDIAEmbeddings(model="nvidia/nv-embed-v1")
