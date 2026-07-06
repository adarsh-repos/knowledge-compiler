const API = "/api";

export interface Book {
  id: string;
  title: string;
  subject: string;
  class_level: string;
  filename: string;
  created_at: string;
  updated_at: string;
}

export interface PdfPageInfo {
  page: number;
  width: number;
  height: number;
  rotation: number;
}

export interface StepValidation {
  every_page_detected: boolean;
  page_count_matches: boolean;
  errors: string[];
}

export interface Step01Result {
  step: number;
  step_name: string;
  source: string;
  total_pages: number;
  pages: PdfPageInfo[];
  validation: StepValidation;
}

export interface Step02Validation {
  no_missing_blocks: boolean;
  coordinates_valid: boolean;
  errors: string[];
}

export interface Step02Summary {
  step: number;
  step_name: string;
  source: string;
  total_pages: number;
  total_blocks: number;
  block_counts: Record<string, number>;
  validation: Step02Validation;
}

export interface LayoutBlock {
  type: "text" | "image" | "table" | "line" | "shape" | "colored_box";
  reading_position: number;
  coordinates: { x0: number; y0: number; x1: number; y1: number };
  text?: string | null;
  font?: string | null;
  font_size?: number | null;
  bold?: boolean | null;
  italic?: boolean | null;
  color?: string | null;
}

export interface PageLayout {
  page: number;
  blocks: LayoutBlock[];
}

export interface ContentBlock {
  block_id: string;
  page: number;
  type: string;
  text?: string | null;
  reading_position?: number;
  reading_order?: number;
  page_reading_order?: number;
  font?: string | null;
  font_size?: number | null;
  bold?: boolean | null;
  italic?: boolean | null;
}

export interface Step03Validation {
  all_blocks_mapped: boolean;
  unique_block_ids: boolean;
  errors: string[];
}

export interface Step03Summary {
  step: number;
  step_name: string;
  source: string;
  total_pages: number;
  total_blocks: number;
  block_counts: Record<string, number>;
  validation: Step03Validation;
}

export interface PageContentBlocks {
  page: number;
  blocks: ContentBlock[];
}

export interface Step04Validation {
  reading_sequence_correct: boolean;
  no_skipped_blocks: boolean;
  errors: string[];
}

export interface Step04Summary {
  step: number;
  step_name: string;
  source: string;
  total_pages: number;
  total_blocks: number;
  validation: Step04Validation;
}

export interface ClassifiedBlock extends ContentBlock {
  role: string;
}

export interface Step05Validation {
  all_blocks_classified: boolean;
  errors: string[];
}

export interface Step05Summary {
  step: number;
  step_name: string;
  source: string;
  total_pages: number;
  total_blocks: number;
  role_counts: Record<string, number>;
  validation: Step05Validation;
}

export interface Step06Validation {
  every_block_placed: boolean;
  errors: string[];
}

export interface HierarchyBlockRef {
  block_id: string;
  role: string;
  text?: string | null;
}

export interface HierarchySubsection {
  subsection_id?: string;
  number: string;
  title: string;
  blocks: HierarchyBlockRef[];
}

export interface HierarchySection {
  section_id?: string;
  number: string;
  title: string;
  is_overview?: boolean;
  subsections: HierarchySubsection[];
  blocks: HierarchyBlockRef[];
}

export interface HierarchyChapter {
  number: number;
  roman: string;
  title: string;
  printed_start: number;
  printed_end: number;
  sections: HierarchySection[];
  blocks: HierarchyBlockRef[];
}

export interface Step06Summary {
  step: number;
  step_name: string;
  source: string;
  book_title: string;
  total_blocks: number;
  chapter_count: number;
  validation: Step06Validation;
}

export interface PlacedBlockRecord {
  block_id: string;
  chapter_id: string;
  chapter_roman: string;
  chapter_title: string;
  section_id?: string | null;
  topic_number?: string | null;
  topic_title?: string | null;
  subsection_id?: string | null;
  subsection_number?: string | null;
  subsection_title?: string | null;
  placement_path: string;
  role: string;
  content_type: string;
  page: number;
  reading_order: number;
  text?: string | null;
}

export interface Step06Hierarchy {
  book_title: string;
  chapters: HierarchyChapter[];
  block_placements: Record<string, string>;
  block_index?: PlacedBlockRecord[];
  skipped_block_ids?: string[];
  cover_page_numbers?: number[];
}

export interface ParagraphBlock {
  paragraph_id: string;
  page: number;
  text: string;
  source_block_ids: string[];
  font?: string | null;
  font_size?: number | null;
}

export interface Step07Validation {
  no_incorrect_splits: boolean;
  no_incorrect_merges: boolean;
  errors: string[];
}

export interface Step07Summary {
  step: number;
  step_name: string;
  source: string;
  total_paragraphs: number;
  source_paragraph_blocks: number;
  validation: Step07Validation;
}

export interface PageParagraphs {
  page: number;
  paragraphs: ParagraphBlock[];
}

export interface Step08Validation {
  caption_linked: boolean;
  images_detected: boolean;
  tables_preserved: boolean;
  errors: string[];
}

export interface Step08Summary {
  step: number;
  step_name: string;
  source: string;
  image_count: number;
  figure_count: number;
  table_count: number;
  activity_count: number;
  glossary_count: number;
  validation: Step08Validation;
}

export interface FigureRecord {
  figure_id: string;
  image_id: string;
  block_id: string;
  caption_block_id?: string | null;
  caption?: string | null;
  page: number;
}

export interface ExtractedTable {
  table_id: string;
  block_id: string;
  page: number;
  rows: number;
  columns: number;
  cells: { row: number; col: number; text: string }[];
}

export interface ActivityRecord {
  activity_id: string;
  block_id: string;
  page: number;
  title: string;
  body: string;
}

export interface GlossaryEntry {
  word: string;
  meaning: string;
}

export interface GlossaryRecord {
  glossary_id: string;
  block_id: string;
  page: number;
  entries: GlossaryEntry[];
}

export interface PageImageTable {
  page: number;
  figures: FigureRecord[];
  tables: ExtractedTable[];
  activities: ActivityRecord[];
  glossaries: GlossaryRecord[];
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  errors: string[];
}

export interface Step09Validation {
  passed: boolean;
  checks: ValidationCheck[];
  errors: string[];
}

export interface Step09Summary {
  step: number;
  step_name: string;
  source: string;
  total_checks: number;
  passed_checks: number;
  validation: Step09Validation;
  checks: ValidationCheck[];
}

export const VALIDATION_CHECK_LABELS: Record<string, string> = {
  missing_pages: "Missing pages",
  missing_paragraphs: "Missing paragraphs",
  duplicate_blocks: "Duplicate blocks",
  duplicate_ids: "Duplicate IDs",
  empty_blocks: "Empty blocks",
  broken_hierarchy: "Broken hierarchy",
  invalid_coordinates: "Invalid coordinates",
  reading_order: "Reading order",
  images_with_captions: "Images with captions",
  tables_complete: "Tables complete",
};

export interface CanonicalBook {
  book_id: string;
  title: string;
  subject: string;
  class_level: string;
  filename: string;
  total_pages: number;
}

export interface CanonicalChapter {
  chapter_id: string;
  number: number;
  roman: string;
  title: string;
  printed_start: number;
  printed_end: number;
  section_ids: string[];
  paragraph_ids: string[];
}

export interface CanonicalSection {
  section_id: string;
  chapter_id: string;
  number: string;
  title: string;
  is_overview?: boolean;
  paragraph_ids: string[];
  subsection_ids?: string[];
}

export interface CanonicalSubsection {
  subsection_id: string;
  section_id: string;
  chapter_id: string;
  number: string;
  title: string;
  paragraph_ids: string[];
}

export interface CanonicalParagraph {
  paragraph_id: string;
  book_id: string;
  chapter_id?: string | null;
  section_id?: string | null;
  subsection_id?: string | null;
  order: number;
  text: string;
  page: number;
  source_block_ids: string[];
}

export interface CanonicalFigure {
  figure_id: string;
  book_id: string;
  chapter_id?: string | null;
  section_id?: string | null;
  subsection_id?: string | null;
  page: number;
  image_id: string;
  caption?: string | null;
  block_id: string;
}

export interface CanonicalActivity {
  activity_id: string;
  book_id: string;
  chapter_id?: string | null;
  section_id?: string | null;
  subsection_id?: string | null;
  page: number;
  title: string;
  body: string;
  activity_type?: string;
  source_block_ids?: string[];
  block_id: string;
}

export interface CanonicalTable {
  table_id: string;
  book_id: string;
  chapter_id?: string | null;
  section_id?: string | null;
  page: number;
  rows: number;
  columns: number;
  cells: { row: number; col: number; text: string }[];
  block_id: string;
}

export interface CanonicalGlossaryEntry {
  glossary_id: string;
  book_id: string;
  chapter_id?: string | null;
  section_id?: string | null;
  page: number;
  word: string;
  meaning: string;
  block_id: string;
}

export interface Step10Validation {
  structure_complete: boolean;
  errors: string[];
}

export interface Step10Summary {
  step: number;
  step_name: string;
  book: CanonicalBook;
  counts: Record<string, number>;
  validation: Step10Validation;
}

export interface CanonicalBlock {
  block_id: string;
  book_id: string;
  chapter_id: string;
  chapter_roman: string;
  chapter_title: string;
  section_id?: string | null;
  topic_number?: string | null;
  topic_title?: string | null;
  subsection_id?: string | null;
  subsection_number?: string | null;
  subsection_title?: string | null;
  placement_path: string;
  role: string;
  content_type: string;
  page: number;
  reading_order: number;
  text?: string | null;
  font?: string | null;
  font_size?: number | null;
}

export interface Step10Canonical {
  step: number;
  step_name: string;
  book: CanonicalBook;
  chapters: CanonicalChapter[];
  sections: CanonicalSection[];
  subsections?: CanonicalSubsection[];
  blocks?: CanonicalBlock[];
  paragraphs: CanonicalParagraph[];
  figures: CanonicalFigure[];
  activities: CanonicalActivity[];
  tables: CanonicalTable[];
  glossary: CanonicalGlossaryEntry[];
  counts: Record<string, number>;
  validation: Step10Validation;
}

type StepStatus = "pending" | "running" | "complete" | "error";

export interface PipelineState {
  step1: StepStatus;
  step2: StepStatus;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = err.detail;
    if (typeof detail === "object" && detail?.message) {
      const extra =
        detail.validation?.errors?.length > 0
          ? `: ${detail.validation.errors.slice(0, 3).join("; ")}`
          : "";
      throw new Error(detail.message + extra);
    }
    throw new Error(typeof detail === "string" ? detail : "Request failed");
  }
  return res.json();
}

export const api = {
  listBooks: () => request<Book[]>("/books"),
  getBook: (id: string) => request<Book>(`/books/${id}`),
  uploadBook: (formData: FormData) =>
    request<{ book: Book; message: string }>("/books/upload", {
      method: "POST",
      body: formData,
    }),
  runStep1: (bookId: string) =>
    request<Step01Result>(`/books/${bookId}/pipeline/step1`, { method: "POST" }),
  getStep1: (bookId: string) => request<Step01Result>(`/books/${bookId}/pipeline/step1`),
  runStep2: (bookId: string) =>
    request<Step02Summary>(`/books/${bookId}/pipeline/step2`, { method: "POST" }),
  getStep2Summary: (bookId: string) =>
    request<Step02Summary>(`/books/${bookId}/pipeline/step2/summary`),
  getStep2Page: (bookId: string, page: number) =>
    request<PageLayout>(`/books/${bookId}/pipeline/step2/pages/${page}`),
  runStep3: (bookId: string) =>
    request<Step03Summary>(`/books/${bookId}/pipeline/step3`, { method: "POST" }),
  getStep3Summary: (bookId: string) =>
    request<Step03Summary>(`/books/${bookId}/pipeline/step3/summary`),
  getStep3Page: (bookId: string, page: number) =>
    request<PageContentBlocks>(`/books/${bookId}/pipeline/step3/pages/${page}`),
  runStep4: (bookId: string) =>
    request<Step04Summary>(`/books/${bookId}/pipeline/step4`, { method: "POST" }),
  getStep4Summary: (bookId: string) =>
    request<Step04Summary>(`/books/${bookId}/pipeline/step4/summary`),
  getStep4Page: (bookId: string, page: number) =>
    request<PageContentBlocks>(`/books/${bookId}/pipeline/step4/pages/${page}`),
  runStep5: (bookId: string) =>
    request<Step05Summary>(`/books/${bookId}/pipeline/step5`, { method: "POST" }),
  getStep5Summary: (bookId: string) =>
    request<Step05Summary>(`/books/${bookId}/pipeline/step5/summary`),
  getStep5Page: (bookId: string, page: number) =>
    request<PageContentBlocks & { blocks: ClassifiedBlock[] }>(
      `/books/${bookId}/pipeline/step5/pages/${page}`
    ),
  runStep6: (bookId: string) =>
    request<Step06Summary>(`/books/${bookId}/pipeline/step6`, { method: "POST" }),
  getStep6Summary: (bookId: string) =>
    request<Step06Summary>(`/books/${bookId}/pipeline/step6/summary`),
  getStep6Hierarchy: (bookId: string) =>
    request<Step06Hierarchy>(`/books/${bookId}/pipeline/step6/hierarchy`),
  runStep7: (bookId: string) =>
    request<Step07Summary>(`/books/${bookId}/pipeline/step7`, { method: "POST" }),
  getStep7Summary: (bookId: string) =>
    request<Step07Summary>(`/books/${bookId}/pipeline/step7/summary`),
  getStep7Page: (bookId: string, page: number) =>
    request<PageParagraphs>(`/books/${bookId}/pipeline/step7/pages/${page}`),
  runStep8: (bookId: string) =>
    request<Step08Summary>(`/books/${bookId}/pipeline/step8`, { method: "POST" }),
  getStep8Summary: (bookId: string) =>
    request<Step08Summary>(`/books/${bookId}/pipeline/step8/summary`),
  getStep8Page: (bookId: string, page: number) =>
    request<PageImageTable>(`/books/${bookId}/pipeline/step8/pages/${page}`),
  getStep8ImageUrl: (bookId: string, imageId: string) =>
    `/api/books/${bookId}/pipeline/step8/images/${imageId}`,
  runStep9: (bookId: string) =>
    request<Step09Summary>(`/books/${bookId}/pipeline/step9`, { method: "POST" }),
  getStep9Summary: (bookId: string) =>
    request<Step09Summary>(`/books/${bookId}/pipeline/step9/summary`),
  runStep10: (bookId: string) =>
    request<Step10Canonical>(`/books/${bookId}/pipeline/step10`, { method: "POST" }),
  getStep10Summary: (bookId: string) =>
    request<Step10Summary>(`/books/${bookId}/pipeline/step10/summary`),
  getCanonical: (bookId: string) =>
    request<Step10Canonical>(`/books/${bookId}/pipeline/step10/canonical`),
};

export const CONTENT_BLOCK_LABELS: Record<string, string> = {
  paragraph: "Paragraph",
  heading: "Heading",
  image: "Image",
  caption: "Caption",
  table: "Table",
  activity: "Activity",
  exercise: "Exercise",
  glossary: "Glossary",
  sidebar: "Sidebar",
  timeline: "Timeline",
  quote: "Quote",
};

export const BLOCK_ROLE_LABELS: Record<string, string> = {
  chapter: "Chapter",
  chapter_title: "Chapter title",
  section: "Topic",
  subsection: "Subtopic",
  paragraph: "Paragraph",
  activity: "Activity",
  exercise: "Exercise",
  figure: "Figure",
  caption: "Caption",
  glossary: "Glossary",
  quote: "Quote",
  poem: "Poem",
  table: "Table",
  sidebar: "Sidebar",
  timeline: "Timeline",
  front_matter: "Front matter",
  map_embedded: "Map label (in figure)",
  fragment: "Merged fragment",
  cover: "Cover page",
};

export const BLOCK_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  image: "Image",
  table: "Table",
  line: "Line",
  shape: "Shape",
  colored_box: "Colored box",
};
