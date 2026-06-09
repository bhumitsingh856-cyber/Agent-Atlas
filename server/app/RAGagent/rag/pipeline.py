import os
from dotenv import load_dotenv
from pinecone import Pinecone
from app.agent.LLM.llm import embedding_model
from langchain_pinecone import PineconeVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("agent-atlas")
splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=300)


def vector_store(namespace: str) -> PineconeVectorStore:
    return PineconeVectorStore(
        index=index,
        embedding=embedding_model,
        namespace=namespace,
        text_key="text",
    )


def store_exists(namespace: str) -> bool:
    return namespace in index.describe_index_stats().namespaces


def create_chunks(report: str):
    texts = splitter.split_text(report)
    docs = [
        Document(page_content=text, metadata={"chunk_index": i})
        for i, text in enumerate(texts)
    ]
    return docs


async def store_chunks(docs: list[Document], namespace: str):
    store = vector_store(namespace)
    await store.aadd_documents(docs)


async def retrieve_chunks(query: str, namespace: str):
    store = vector_store(namespace)
    return await store.asimilarity_search(query)
