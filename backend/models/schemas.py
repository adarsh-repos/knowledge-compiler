from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class PipelineStage(str, Enum):
    PENDING_OCR = "pending_ocr"
    OCR_COMPLETE = "ocr_complete"
    CHAPTERS_FOUND = "chapters_found"
    AI_IN_PROGRESS = "ai_in_progress"
    AI_COMPLETED = "ai_completed"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    PUBLISHED = "published"
    FAILED = "failed"


class BookCreate(BaseModel):
    title: str = "NCERT Class 6 History"
    subject: str = "History"
    class_level: str = "6"


class Book(BaseModel):
    id: str
    title: str
    subject: str
    class_level: str
    filename: str
    stage: PipelineStage = PipelineStage.PENDING_OCR
    created_at: str
    updated_at: str
    chapter_count: int = 0
    error: Optional[str] = None


class TokenUsage(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class PassTokenUsage(TokenUsage):
    pass_name: str


class Chapter(BaseModel):
    id: str
    book_id: str
    number: int
    title: str
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    stage: PipelineStage = PipelineStage.PENDING_OCR
    json_path: Optional[str] = None
    token_usage: Optional[Dict[str, Any]] = None
    section: Optional[str] = None
    roman_numeral: Optional[str] = None
    printed_page_start: Optional[int] = None
    printed_page_end: Optional[int] = None
    extraction_level: Optional[str] = None
    extraction_progress: Optional[Dict[str, Any]] = None


class ExamMetadata(BaseModel):
    importance: str = "medium"
    difficulty: str = "medium"
    mcq_patterns: List[str] = Field(default_factory=list)
    common_misconceptions: List[str] = Field(default_factory=list)
    pyq_themes: List[str] = Field(default_factory=list)


class Concept(BaseModel):
    id: str
    title: str
    definition: str = ""
    facts: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    related: List[str] = Field(default_factory=list)
    learning_objectives: List[str] = Field(default_factory=list)
    exam_metadata: Optional[ExamMetadata] = None


class Subtopic(BaseModel):
    id: str
    title: str
    concepts: List[Concept] = Field(default_factory=list)


class Topic(BaseModel):
    id: str
    title: str
    subtopics: List[Subtopic] = Field(default_factory=list)


class ChapterJson(BaseModel):
    book: Dict[str, str]
    chapter: Dict[str, Any]
    topics: List[Topic]


class ChapterUpdate(BaseModel):
    data: Dict[str, Any]
