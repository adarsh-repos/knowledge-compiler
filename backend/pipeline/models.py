from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class PdfPageInfo(BaseModel):
    page: int
    width: float
    height: float
    rotation: int = 0


class StepValidation(BaseModel):
    every_page_detected: bool
    page_count_matches: bool
    errors: List[str] = Field(default_factory=list)


class Step01PdfReaderResult(BaseModel):
    step: int = 1
    step_name: str = "pdf_reader"
    source: str
    total_pages: int
    pages: List[PdfPageInfo]
    validation: StepValidation


class Coordinates(BaseModel):
    x0: float
    y0: float
    x1: float
    y1: float


BlockType = Literal["text", "image", "table", "line", "shape", "colored_box"]


class LayoutBlock(BaseModel):
    type: BlockType
    reading_position: int
    coordinates: Coordinates
    text: Optional[str] = None
    font: Optional[str] = None
    font_size: Optional[float] = None
    bold: Optional[bool] = None
    italic: Optional[bool] = None
    color: Optional[str] = None


class PageLayout(BaseModel):
    page: int
    blocks: List[LayoutBlock]


class Step02Validation(BaseModel):
    no_missing_blocks: bool
    coordinates_valid: bool
    errors: List[str] = Field(default_factory=list)


class Step02LayoutResult(BaseModel):
    step: int = 2
    step_name: str = "layout_extraction"
    source: str
    total_pages: int
    total_blocks: int
    block_counts: dict[str, int]
    pages: List[PageLayout]
    validation: Step02Validation


ContentBlockType = Literal[
    "paragraph",
    "heading",
    "image",
    "caption",
    "table",
    "activity",
    "exercise",
    "glossary",
    "sidebar",
    "timeline",
    "quote",
]


class ContentBlock(BaseModel):
    block_id: str
    page: int
    type: ContentBlockType
    text: Optional[str] = None
    reading_position: int = 0
    coordinates: Optional[Coordinates] = None
    font: Optional[str] = None
    font_size: Optional[float] = None
    bold: Optional[bool] = None
    italic: Optional[bool] = None
    color: Optional[str] = None
    layout_source: Optional[str] = None


class Step03Validation(BaseModel):
    all_blocks_mapped: bool
    unique_block_ids: bool
    errors: List[str] = Field(default_factory=list)


class Step03ContentBlockResult(BaseModel):
    step: int = 3
    step_name: str = "content_block_builder"
    source: str
    total_pages: int
    total_blocks: int
    block_counts: dict[str, int]
    blocks: List[ContentBlock]
    validation: Step03Validation


class OrderedContentBlock(ContentBlock):
    reading_order: int
    page_reading_order: int


class Step04Validation(BaseModel):
    reading_sequence_correct: bool
    no_skipped_blocks: bool
    errors: List[str] = Field(default_factory=list)


class Step04ReadingOrderResult(BaseModel):
    step: int = 4
    step_name: str = "reading_order_builder"
    source: str
    total_pages: int
    total_blocks: int
    blocks: List[OrderedContentBlock]
    validation: Step04Validation


BlockRole = Literal[
    "chapter",
    "chapter_title",
    "section",
    "subsection",
    "paragraph",
    "activity",
    "exercise",
    "figure",
    "caption",
    "glossary",
    "quote",
    "poem",
    "table",
    "sidebar",
    "timeline",
    "front_matter",
    "cover",
    "map_embedded",
    "fragment",
]


class ClassifiedBlock(OrderedContentBlock):
    role: BlockRole


class Step05Validation(BaseModel):
    all_blocks_classified: bool
    errors: List[str] = Field(default_factory=list)


class Step05ClassificationResult(BaseModel):
    step: int = 5
    step_name: str = "block_classification"
    source: str
    total_pages: int
    total_blocks: int
    role_counts: dict[str, int]
    blocks: List[ClassifiedBlock]
    validation: Step05Validation


class HierarchyBlockRef(BaseModel):
    block_id: str
    role: str
    text: Optional[str] = None


class HierarchySubsection(BaseModel):
    subsection_id: str = ""
    number: str
    title: str
    blocks: List[HierarchyBlockRef] = Field(default_factory=list)


class HierarchySection(BaseModel):
    section_id: str = ""
    number: str
    title: str
    is_overview: bool = False
    subsections: List[HierarchySubsection] = Field(default_factory=list)
    blocks: List[HierarchyBlockRef] = Field(default_factory=list)


class HierarchyChapter(BaseModel):
    number: int
    roman: str
    title: str
    printed_start: int
    printed_end: int
    sections: List[HierarchySection] = Field(default_factory=list)
    blocks: List[HierarchyBlockRef] = Field(default_factory=list)


class Step06Validation(BaseModel):
    every_block_placed: bool
    errors: List[str] = Field(default_factory=list)


class PlacedBlockRecord(BaseModel):
    """Atomic block with full hierarchy placement (database-ready)."""
    block_id: str
    chapter_id: str
    chapter_roman: str
    chapter_title: str
    section_id: Optional[str] = None
    topic_number: Optional[str] = None
    topic_title: Optional[str] = None
    subsection_id: Optional[str] = None
    subsection_number: Optional[str] = None
    subsection_title: Optional[str] = None
    placement_path: str
    role: str
    content_type: str
    page: int
    reading_order: int
    text: Optional[str] = None


class Step06HierarchyResult(BaseModel):
    step: int = 6
    step_name: str = "hierarchy_builder"
    source: str
    book_title: str
    chapters: List[HierarchyChapter]
    block_placements: dict[str, str]
    block_index: List[PlacedBlockRecord] = Field(default_factory=list)
    skipped_block_ids: List[str] = Field(default_factory=list)
    cover_page_numbers: List[int] = Field(default_factory=list)
    total_blocks: int
    validation: Step06Validation


class ParagraphBlock(BaseModel):
    paragraph_id: str
    page: int
    text: str
    source_block_ids: List[str]
    font: Optional[str] = None
    font_size: Optional[float] = None


class Step07Validation(BaseModel):
    no_incorrect_splits: bool
    no_incorrect_merges: bool
    errors: List[str] = Field(default_factory=list)


class Step07ParagraphResult(BaseModel):
    step: int = 7
    step_name: str = "paragraph_builder"
    source: str
    total_paragraphs: int
    source_paragraph_blocks: int
    paragraphs: List[ParagraphBlock]
    validation: Step07Validation


class BlockPosition(BaseModel):
    page: int
    reading_order: int
    coordinates: Coordinates


class ExtractedImage(BaseModel):
    image_id: str
    block_id: str
    page: int
    file_path: str
    width: int
    height: int
    position: BlockPosition


class FigureRecord(BaseModel):
    figure_id: str
    image_id: str
    block_id: str
    caption_block_id: Optional[str] = None
    caption: Optional[str] = None
    page: int
    position: BlockPosition


class TableCell(BaseModel):
    row: int
    col: int
    text: str


class ExtractedTable(BaseModel):
    table_id: str
    block_id: str
    page: int
    rows: int
    columns: int
    cells: List[TableCell]
    position: BlockPosition


class ActivityRecord(BaseModel):
    activity_id: str
    block_id: str
    page: int
    title: str
    body: str
    activity_type: str = "activity"
    source_block_ids: List[str] = Field(default_factory=list)
    position: BlockPosition


class GlossaryEntry(BaseModel):
    word: str
    meaning: str


class GlossaryRecord(BaseModel):
    glossary_id: str
    block_id: str
    page: int
    entries: List[GlossaryEntry]
    position: BlockPosition


class Step08Validation(BaseModel):
    caption_linked: bool
    images_detected: bool
    tables_preserved: bool
    errors: List[str] = Field(default_factory=list)


class Step08ImageTableResult(BaseModel):
    step: int = 8
    step_name: str = "image_table_builder"
    source: str
    images: List[ExtractedImage]
    figures: List[FigureRecord]
    tables: List[ExtractedTable]
    activities: List[ActivityRecord]
    glossaries: List[GlossaryRecord]
    validation: Step08Validation


class ValidationCheck(BaseModel):
    name: str
    passed: bool
    errors: List[str] = Field(default_factory=list)


class Step09Validation(BaseModel):
    passed: bool
    checks: List[ValidationCheck]
    errors: List[str] = Field(default_factory=list)


class Step09ValidationResult(BaseModel):
    step: int = 9
    step_name: str = "validation_engine"
    source: str
    total_checks: int
    passed_checks: int
    validation: Step09Validation


class CanonicalBook(BaseModel):
    book_id: str
    title: str
    subject: str
    class_level: str
    filename: str
    total_pages: int


class CanonicalSection(BaseModel):
    section_id: str
    chapter_id: str
    number: str
    title: str
    is_overview: bool = False
    paragraph_ids: List[str] = Field(default_factory=list)
    subsection_ids: List[str] = Field(default_factory=list)


class CanonicalSubsection(BaseModel):
    subsection_id: str
    section_id: str
    chapter_id: str
    number: str
    title: str
    paragraph_ids: List[str] = Field(default_factory=list)


class CanonicalChapter(BaseModel):
    chapter_id: str
    number: int
    roman: str
    title: str
    printed_start: int
    printed_end: int
    section_ids: List[str] = Field(default_factory=list)
    paragraph_ids: List[str] = Field(default_factory=list)


class CanonicalParagraph(BaseModel):
    paragraph_id: str
    book_id: str
    chapter_id: Optional[str] = None
    section_id: Optional[str] = None
    subsection_id: Optional[str] = None
    order: int
    text: str
    page: int
    source_block_ids: List[str] = Field(default_factory=list)


class CanonicalFigure(BaseModel):
    figure_id: str
    book_id: str
    chapter_id: Optional[str] = None
    section_id: Optional[str] = None
    subsection_id: Optional[str] = None
    page: int
    image_id: str
    caption: Optional[str] = None
    block_id: str


class CanonicalActivity(BaseModel):
    activity_id: str
    book_id: str
    chapter_id: Optional[str] = None
    section_id: Optional[str] = None
    subsection_id: Optional[str] = None
    page: int
    title: str
    body: str
    activity_type: str = "activity"
    source_block_ids: List[str] = Field(default_factory=list)
    block_id: str


class CanonicalTableCell(BaseModel):
    row: int
    col: int
    text: str


class CanonicalTable(BaseModel):
    table_id: str
    book_id: str
    chapter_id: Optional[str] = None
    section_id: Optional[str] = None
    subsection_id: Optional[str] = None
    page: int
    rows: int
    columns: int
    cells: List[CanonicalTableCell] = Field(default_factory=list)
    block_id: str


class CanonicalGlossaryEntry(BaseModel):
    glossary_id: str
    book_id: str
    chapter_id: Optional[str] = None
    section_id: Optional[str] = None
    subsection_id: Optional[str] = None
    page: int
    word: str
    meaning: str
    block_id: str


class CanonicalBlock(BaseModel):
    """Atomic content block — lowest level for database import."""
    block_id: str
    book_id: str
    chapter_id: str
    chapter_roman: str
    chapter_title: str
    section_id: Optional[str] = None
    topic_number: Optional[str] = None
    topic_title: Optional[str] = None
    subsection_id: Optional[str] = None
    subsection_number: Optional[str] = None
    subsection_title: Optional[str] = None
    placement_path: str
    role: str
    content_type: str
    page: int
    reading_order: int
    text: Optional[str] = None
    font: Optional[str] = None
    font_size: Optional[float] = None
    bold: Optional[bool] = None
    italic: Optional[bool] = None
    coordinates: Optional[Coordinates] = None


class Step10Validation(BaseModel):
    structure_complete: bool
    errors: List[str] = Field(default_factory=list)


class Step10CanonicalResult(BaseModel):
    step: int = 10
    step_name: str = "canonical_json"
    book: CanonicalBook
    chapters: List[CanonicalChapter]
    sections: List[CanonicalSection]
    subsections: List[CanonicalSubsection] = Field(default_factory=list)
    blocks: List[CanonicalBlock] = Field(default_factory=list)
    paragraphs: List[CanonicalParagraph]
    figures: List[CanonicalFigure]
    activities: List[CanonicalActivity]
    tables: List[CanonicalTable]
    glossary: List[CanonicalGlossaryEntry]
    counts: dict[str, int]
    validation: Step10Validation
