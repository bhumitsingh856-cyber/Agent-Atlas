from pydantic import BaseModel,Field

class PromptEnhancerSchema(BaseModel):
    topic:str=Field(...,description="Prompt to be enhanced for the given topic")

    
    