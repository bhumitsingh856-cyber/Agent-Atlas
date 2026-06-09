from langchain_tavily import TavilySearch
from langchain_core.tools import tool
from typing import Literal
import dotenv
dotenv.load_dotenv()

@tool
async def web_search(
    query: str, 
    # search_depth: Literal["basic"], max_results: str
):
    """Search the live internet for recent news, up-to-date metrics, and real-time facts."""
    tavily = TavilySearch(
        max_results=2,
        # include_raw_content=True,
        include_images=True,
        include_image_descriptions=True,
        search_depth="basic",
        include_usage=False,
    )
    try:
        search=await tavily.ainvoke({"query": query})
        result = [{"images": search["images"]}]
        for i in search["results"]:
            result.append({"title": i["title"], "content": i["content"], "url": i["url"]})
        return result
    except Exception as e:
        return f"Error during web search : {str(e)}"
