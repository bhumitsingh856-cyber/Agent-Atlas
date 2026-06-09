from pydantic import BaseModel, Field

class TaskSchema(BaseModel):
    task_id: str = Field(
        ..., 
        description="Unique sequential identifier, e.g., 'TASK-001', 'TASK-002'"
    )
    section_title: str = Field(
        ..., 
        description="Title of the specific report or paper section this research feeds into."
    )
    research_questions: list[str] = Field(
        ..., 
        description="Granular, sharp, verifiable questions that the research phase must explicitly answer."
    )
    key_topics: list[str] = Field(
        ..., 
        description="Targeted keywords, technical terms, and entities to focus search queries on."
    )
    brief:str=Field(
        ...,
        description="Brief description of the task"
    )

class PlannerSchema(BaseModel):
    tasks: list[TaskSchema]