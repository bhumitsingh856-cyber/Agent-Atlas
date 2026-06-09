from sqlalchemy.ext.asyncio import create_async_engine , AsyncSession,async_sessionmaker
from dotenv import load_dotenv
import os
load_dotenv()

engine = create_async_engine(os.getenv("DATABASE_URL"), echo=False)
session_factory=async_sessionmaker(bind=engine,class_=AsyncSession,expire_on_commit=False) 

async def get_db():
    async with session_factory() as session:
        yield session