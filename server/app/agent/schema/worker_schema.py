from pydantic import BaseModel,Field

class ResearchSource(BaseModel):
    title: str = Field(..., description="Title of the article, paper, or webpage")
    url: str = Field(..., description="The direct, valid HTTP URL to the source")
    relevant_snippet: str = Field(..., description="The exact sentence or quote extracted from this URL that proves your findings.")

class WorkerSchema(BaseModel):
    content: str = Field(
        ..., 
        description="The raw, deep, detailed research findings. Use comprehensive Markdown, include tables if data was found, and use inline citations like [1], [2]."
    )
    
    summary: str = Field(
        ..., 
        description="A deep, dense executive paragraph compiling technical details, metrics, and contextual data gathered."
    )
    
    sources: list[ResearchSource] = Field(
        ..., 
        description="A structured list of every single source used to back up the facts in the content and summary."
    )