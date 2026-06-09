from langchain_tavily import TavilyExtract
from langchain_core.tools import tool
from typing import Literal
import dotenv

dotenv.load_dotenv()

client = TavilyExtract(extract_depth="basic" )
open("text.md", "w", encoding="utf-8").write(
    str(
        client.invoke(
            {
                "urls": [
                   "https://en.wikipedia.org/wiki/Generative_AI"
                ]
            }
        )
    )
)
