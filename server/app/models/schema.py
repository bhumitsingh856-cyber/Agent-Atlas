from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, relationship
from sqlalchemy import String, Text, DateTime, ForeignKey, func  # add func
from datetime import datetime

class Base(DeclarativeBase):
    pass

class Research(Base):
    __tablename__ = "research"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("user.clerk_id", ondelete="CASCADE"))
    topic: Mapped[str] = mapped_column(String(255))
    report: Mapped[str] = mapped_column(Text)
    createdAt: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())  
    user: Mapped["User"] = relationship(back_populates="researches")

class User(Base):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    clerk_id: Mapped[str] = mapped_column(String(100), unique=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(100), unique=True)
    researches: Mapped[list["Research"]] = relationship(back_populates="user")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())   