import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  api,
  BLOCK_ROLE_LABELS,
  BLOCK_TYPE_LABELS,
  Book,
  ClassifiedBlock,
  CONTENT_BLOCK_LABELS,
  HierarchyChapter,
  PageContentBlocks,
  PageParagraphs,
  ParagraphBlock,
  Step01Result,
  Step02Summary,
  Step03Summary,
  Step04Summary,
  Step05Summary,
  Step06Hierarchy,
  Step06Summary,
  Step07Summary,
  Step08Summary,
  PageImageTable,
  VALIDATION_CHECK_LABELS,
  Step09Summary,
  Step10Summary,
  Step10Canonical,
} from "../api";
import CanonicalChapterValidator from "../components/CanonicalChapterValidator";
import HierarchyBlockExplorer from "../components/HierarchyBlockExplorer";

type StepStatus = "pending" | "running" | "complete" | "error";

function StatusChip({ status, label }: { status: StepStatus; label: string }) {
  if (status === "running") {
    return <Chip icon={<CircularProgress size={14} />} label={label} size="small" color="primary" />;
  }
  if (status === "complete") {
    return <Chip icon={<CheckCircleIcon />} label={label} size="small" color="success" />;
  }
  if (status === "error") {
    return <Chip icon={<ErrorIcon />} label={label} size="small" color="error" />;
  }
  return <Chip label={label} size="small" variant="outlined" />;
}

export default function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [step1, setStep1] = useState<Step01Result | null>(null);
  const [step2, setStep2] = useState<Step02Summary | null>(null);
  const [step3, setStep3] = useState<Step03Summary | null>(null);
  const [step4, setStep4] = useState<Step04Summary | null>(null);
  const [step5, setStep5] = useState<Step05Summary | null>(null);
  const [step6, setStep6] = useState<Step06Summary | null>(null);
  const [step7, setStep7] = useState<Step07Summary | null>(null);
  const [step8, setStep8] = useState<Step08Summary | null>(null);
  const [step9, setStep9] = useState<Step09Summary | null>(null);
  const [step10, setStep10] = useState<Step10Summary | null>(null);
  const [canonical, setCanonical] = useState<Step10Canonical | null>(null);
  const [hierarchy, setHierarchy] = useState<Step06Hierarchy | null>(null);
  const [step1Status, setStep1Status] = useState<StepStatus>("pending");
  const [step2Status, setStep2Status] = useState<StepStatus>("pending");
  const [step3Status, setStep3Status] = useState<StepStatus>("pending");
  const [step4Status, setStep4Status] = useState<StepStatus>("pending");
  const [step5Status, setStep5Status] = useState<StepStatus>("pending");
  const [step6Status, setStep6Status] = useState<StepStatus>("pending");
  const [step7Status, setStep7Status] = useState<StepStatus>("pending");
  const [step8Status, setStep8Status] = useState<StepStatus>("pending");
  const [step9Status, setStep9Status] = useState<StepStatus>("pending");
  const [step10Status, setStep10Status] = useState<StepStatus>("pending");
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [selectedPage, setSelectedPage] = useState(1);
  const [pageBlocks, setPageBlocks] = useState<PageContentBlocks | null>(null);
  const [pageParagraphs, setPageParagraphs] = useState<PageParagraphs | null>(null);
  const [pageImageTable, setPageImageTable] = useState<PageImageTable | null>(null);
  const [loadingPage, setLoadingPage] = useState(false);

  const runPipeline = async () => {
    if (!bookId) return;
    setError("");

    let s1Done = false;
    let s2Done = false;
    let s3Done = false;
    let s4Done = false;
    let s5Done = false;
    let s6Done = false;
    let s7Done = false;
    let s8Done = false;
    let s9Done = false;
    try {
      setStep1Status("running");
      setStep2Status("pending");
      setStep3Status("pending");
      setStep4Status("pending");
      setStep5Status("pending");
      setStep6Status("pending");
      setStep7Status("pending");
      setStep8Status("pending");
      setStep9Status("pending");
      setStep10Status("pending");
      setActiveStep(0);
      let s1: Step01Result;
      try {
        s1 = await api.getStep1(bookId);
      } catch {
        s1 = await api.runStep1(bookId);
      }
      setStep1(s1);
      setStep1Status("complete");
      s1Done = true;
      setActiveStep(1);

      setStep2Status("running");
      let s2: Step02Summary;
      try {
        s2 = await api.getStep2Summary(bookId);
      } catch {
        s2 = await api.runStep2(bookId);
      }
      setStep2(s2);
      setStep2Status("complete");
      s2Done = true;
      setActiveStep(2);

      setStep3Status("running");
      let s3: Step03Summary;
      try {
        s3 = await api.getStep3Summary(bookId);
      } catch {
        s3 = await api.runStep3(bookId);
      }
      setStep3(s3);
      setStep3Status("complete");
      s3Done = true;
      setActiveStep(3);

      setStep4Status("running");
      let s4: Step04Summary;
      try {
        s4 = await api.getStep4Summary(bookId);
      } catch {
        s4 = await api.runStep4(bookId);
      }
      setStep4(s4);
      setStep4Status("complete");
      s4Done = true;
      setActiveStep(4);

      setStep5Status("running");
      let s5: Step05Summary;
      try {
        s5 = await api.getStep5Summary(bookId);
      } catch {
        s5 = await api.runStep5(bookId);
      }
      setStep5(s5);
      setStep5Status("complete");
      s5Done = true;
      setActiveStep(5);

      setStep6Status("running");
      let s6: Step06Summary;
      try {
        s6 = await api.getStep6Summary(bookId);
      } catch {
        s6 = await api.runStep6(bookId);
      }
      setStep6(s6);
      const h = await api.getStep6Hierarchy(bookId);
      setHierarchy(h);
      setStep6Status("complete");
      s6Done = true;
      setActiveStep(6);

      setStep7Status("running");
      let s7: Step07Summary;
      try {
        s7 = await api.getStep7Summary(bookId);
      } catch {
        s7 = await api.runStep7(bookId);
      }
      setStep7(s7);
      setStep7Status("complete");
      s7Done = true;
      setActiveStep(7);

      setStep8Status("running");
      let s8: Step08Summary;
      try {
        s8 = await api.getStep8Summary(bookId);
      } catch {
        s8 = await api.runStep8(bookId);
      }
      setStep8(s8);
      setStep8Status("complete");
      s8Done = true;
      setActiveStep(8);

      setStep9Status("running");
      try {
        const s9 = await api.runStep9(bookId);
        setStep9(s9);
        setStep9Status("complete");
        s9Done = true;
        setActiveStep(9);

        setStep10Status("running");
        let s10: Step10Summary;
        try {
          s10 = await api.getStep10Summary(bookId);
        } catch {
          await api.runStep10(bookId);
          s10 = await api.getStep10Summary(bookId);
        }
        setStep10(s10);
        const canon = await api.getCanonical(bookId);
        setCanonical(canon);
        setStep10Status("complete");
      } catch (step9Err) {
        try {
          const s9 = await api.getStep9Summary(bookId);
          setStep9(s9);
        } catch {
          /* no saved validation output */
        }
        setStep9Status("error");
        throw step9Err;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Pipeline failed";
      setError(msg);
      if (!s1Done) setStep1Status("error");
      else if (!s2Done) setStep2Status("error");
      else if (!s3Done) setStep3Status("error");
      else if (!s4Done) setStep4Status("error");
      else if (!s5Done) setStep5Status("error");
      else if (!s6Done) setStep6Status("error");
      else if (!s7Done) setStep7Status("error");
      else if (!s8Done) setStep8Status("error");
      else if (!s9Done) setStep9Status("error");
      else setStep10Status("error");
    }
  };

  useEffect(() => {
    if (!bookId) return;
    let cancelled = false;

    (async () => {
      try {
        const b = await api.getBook(bookId);
        if (cancelled) return;
        setBook(b);
        await runPipeline();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  useEffect(() => {
    if (!bookId || step5Status !== "complete") return;
    setLoadingPage(true);
    api
      .getStep5Page(bookId, selectedPage)
      .then(setPageBlocks)
      .catch(() => setPageBlocks(null))
      .finally(() => setLoadingPage(false));
  }, [bookId, selectedPage, step5Status]);

  useEffect(() => {
    if (!bookId || step7Status !== "complete") return;
    api
      .getStep7Page(bookId, selectedPage)
      .then(setPageParagraphs)
      .catch(() => setPageParagraphs(null));
  }, [bookId, selectedPage, step7Status]);

  useEffect(() => {
    if (!bookId || step8Status !== "complete") return;
    api
      .getStep8Page(bookId, selectedPage)
      .then(setPageImageTable)
      .catch(() => setPageImageTable(null));
  }, [bookId, selectedPage, step8Status]);

  useEffect(() => {
    if (!bookId || step10Status !== "complete") return;
    api.getCanonical(bookId).then(setCanonical).catch(() => setCanonical(null));
  }, [bookId, step10Status]);

  if (!book) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const pipelineRunning =
    step1Status === "running" ||
    step2Status === "running" ||
    step3Status === "running" ||
    step4Status === "running" ||
    step5Status === "running" ||
    step6Status === "running" ||
    step7Status === "running" ||
    step8Status === "running" ||
    step9Status === "running" ||
    step10Status === "running";

  return (
    <Box>
      <Button component={Link} to="/" size="small" sx={{ mb: 2 }}>
        ← Back to upload
      </Button>

      <Typography variant="h4" gutterBottom fontWeight={700}>
        Pre-AI Pipeline
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {book.title} · {book.filename}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Processing steps
            </Typography>
            <Button
              variant="contained"
              size="small"
              disabled={pipelineRunning}
              startIcon={pipelineRunning ? <CircularProgress size={14} color="inherit" /> : <PlayArrowIcon />}
              onClick={runPipeline}
            >
              Re-run pipeline
            </Button>
          </Box>

          <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
            {/* STEP 1 */}
            <Step expanded completed={step1Status === "complete"}>
              <StepLabel
                optional={<StatusChip status={step1Status} label={stepLabel(step1Status, "PDF Reader")} />}
              >
                Step 1 — PDF Reader
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Read every page: width, height, rotation. No AI.
                </Typography>
                {step1Status === "running" && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2">Reading {book.filename}…</Typography>
                  </Box>
                )}
                {step1 && (
                  <>
                    <ValidationRow
                      ok={step1.validation.every_page_detected}
                      label="Every page detected"
                    />
                    <ValidationRow
                      ok={step1.validation.page_count_matches}
                      label={`Page count matches PDF (${step1.total_pages} pages)`}
                    />
                    {step1.validation.errors.length > 0 && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {step1.validation.errors.map((e) => (
                          <div key={e}>{e}</div>
                        ))}
                      </Alert>
                    )}
                    <PageSizeTable pages={step1.pages.slice(0, 5)} total={step1.total_pages} />
                  </>
                )}
              </StepContent>
            </Step>

            {/* STEP 2 */}
            <Step expanded completed={step2Status === "complete"}>
              <StepLabel
                optional={<StatusChip status={step2Status} label={stepLabel(step2Status, "Layout")} />}
              >
                Step 2 — Layout Extraction
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Extract text, images, tables, lines, shapes, colored boxes from every page.
                </Typography>
                {step2Status === "running" && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2">Extracting layout blocks…</Typography>
                  </Box>
                )}
                {step2 && (
                  <>
                    <ValidationRow ok={step2.validation.no_missing_blocks} label="No missing pages" />
                    <ValidationRow ok={step2.validation.coordinates_valid} label="Coordinates valid" />
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", my: 2 }}>
                      <Chip label={`${step2.total_blocks.toLocaleString()} layout blocks`} size="small" />
                      {Object.entries(step2.block_counts).map(([type, count]) =>
                        count > 0 ? (
                          <Chip
                            key={type}
                            label={`${BLOCK_TYPE_LABELS[type] ?? type}: ${count}`}
                            size="small"
                            variant="outlined"
                          />
                        ) : null
                      )}
                    </Box>
                  </>
                )}
                {step1Status === "complete" && step2Status === "pending" && (
                  <Typography variant="body2" color="text.secondary">
                    Waiting for Step 1 to finish…
                  </Typography>
                )}
              </StepContent>
            </Step>

            {/* STEP 3 */}
            <Step expanded completed={step3Status === "complete"}>
              <StepLabel
                optional={<StatusChip status={step3Status} label={stepLabel(step3Status, "Content Blocks")} />}
              >
                Step 3 — Content Block Builder
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Classify layout into Paragraph, Heading, Image, Caption, Table, Activity, etc.
                </Typography>
                {step3Status === "running" && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2">Building content blocks…</Typography>
                  </Box>
                )}
                {step3 && (
                  <>
                    <ValidationRow ok={step3.validation.all_blocks_mapped} label="All layout objects mapped" />
                    <ValidationRow ok={step3.validation.unique_block_ids} label="Unique block IDs (CB000001…)" />
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", my: 2 }}>
                      <Chip label={`${step3.total_blocks.toLocaleString()} content blocks`} size="small" color="primary" />
                      {Object.entries(step3.block_counts).map(([type, count]) =>
                        count > 0 ? (
                          <Chip
                            key={type}
                            label={`${CONTENT_BLOCK_LABELS[type] ?? type}: ${count}`}
                            size="small"
                            variant="outlined"
                          />
                        ) : null
                      )}
                    </Box>
                  </>
                )}
                {step2Status === "complete" && step3Status === "pending" && (
                  <Typography variant="body2" color="text.secondary">
                    Waiting for Step 2 to finish…
                  </Typography>
                )}
              </StepContent>
            </Step>

            {/* STEP 4 */}
            <Step expanded completed={step4Status === "complete"}>
              <StepLabel
                optional={<StatusChip status={step4Status} label={stepLabel(step4Status, "Reading Order")} />}
              >
                Step 4 — Reading Order Builder
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Preserve exact reading flow: Heading → Paragraph → Activity → Figure → Caption…
                </Typography>
                {step4Status === "running" && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2">Assigning reading order…</Typography>
                  </Box>
                )}
                {step4 && (
                  <>
                    <ValidationRow
                      ok={step4.validation.reading_sequence_correct}
                      label="Reading sequence correct (page → top → left)"
                    />
                    <ValidationRow ok={step4.validation.no_skipped_blocks} label="No skipped blocks" />
                    <Chip
                      label={`${step4.total_blocks.toLocaleString()} blocks ordered`}
                      size="small"
                      sx={{ my: 2 }}
                      color="primary"
                    />
                  </>
                )}
                {step3Status === "complete" && step4Status === "pending" && (
                  <Typography variant="body2" color="text.secondary">
                    Waiting for Step 3 to finish…
                  </Typography>
                )}
              </StepContent>
            </Step>

            {/* STEP 5 */}
            <Step expanded completed={step5Status === "complete"}>
              <StepLabel
                optional={<StatusChip status={step5Status} label={stepLabel(step5Status, "Classification")} />}
              >
                Step 5 — Block Classification
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Assign semantic roles via layout rules: pink box → Activity, yellow box → Glossary.
                </Typography>
                {step5Status === "running" && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2">Classifying blocks…</Typography>
                  </Box>
                )}
                {step5 && (
                  <>
                    <ValidationRow ok={step5.validation.all_blocks_classified} label="Every block classified" />
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", my: 2 }}>
                      <Chip label={`${step5.total_blocks.toLocaleString()} classified blocks`} size="small" color="primary" />
                      {Object.entries(step5.role_counts).map(([role, count]) =>
                        count > 0 ? (
                          <Chip
                            key={role}
                            label={`${BLOCK_ROLE_LABELS[role] ?? role}: ${count}`}
                            size="small"
                            variant="outlined"
                            color={role === "activity" ? "secondary" : role === "glossary" ? "warning" : "default"}
                          />
                        ) : null
                      )}
                    </Box>

                    {step5.total_pages > 0 && (
                      <>
                        <FormControl size="small" sx={{ minWidth: 160, mb: 2, display: "block" }}>
                          <InputLabel>Inspect roles by page</InputLabel>
                          <Select
                            value={selectedPage}
                            label="Inspect roles by page"
                            onChange={(e) => setSelectedPage(Number(e.target.value))}
                          >
                            {Array.from({ length: step5.total_pages }, (_, i) => i + 1).map((p) => (
                              <MenuItem key={p} value={p}>
                                Page {p}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {loadingPage ? (
                          <CircularProgress size={24} />
                        ) : (
                          <RoleTable blocks={(pageBlocks?.blocks ?? []) as ClassifiedBlock[]} page={selectedPage} />
                        )}
                      </>
                    )}
                  </>
                )}
                {step4Status === "complete" && step5Status === "pending" && (
                  <Typography variant="body2" color="text.secondary">
                    Waiting for Step 4 to finish…
                  </Typography>
                )}
              </StepContent>
            </Step>

            {/* STEP 6 */}
            <Step expanded completed={step6Status === "complete"}>
              <StepLabel
                optional={<StatusChip status={step6Status} label={stepLabel(step6Status, "Hierarchy")} />}
              >
                Step 6 — Hierarchy Builder
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Book → Chapter → Overview → Topic → Subtopic → Block (atomic unit for database)
                </Typography>
                {step6Status === "running" && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2">Building hierarchy…</Typography>
                  </Box>
                )}
                {step6 && (
                  <>
                    <ValidationRow ok={step6.validation.every_block_placed} label="Every block belongs somewhere" />
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", my: 2 }}>
                      <Chip label={step6.book_title} size="small" />
                      <Chip label={`${step6.chapter_count} chapters`} size="small" variant="outlined" />
                      <Chip label={`${step6.total_blocks.toLocaleString()} blocks placed`} size="small" color="primary" />
                    </Box>
                    {hierarchy?.block_index && hierarchy.block_index.length > 0 ? (
                      <HierarchyBlockExplorer
                        blockIndex={hierarchy.block_index}
                        coverPages={hierarchy.cover_page_numbers}
                        skippedCount={hierarchy.skipped_block_ids?.length ?? 0}
                      />
                    ) : (
                      hierarchy && <HierarchyOutline chapters={hierarchy.chapters} />
                    )}
                  </>
                )}
                {step5Status === "complete" && step6Status === "pending" && (
                  <Typography variant="body2" color="text.secondary">
                    Waiting for Step 5 to finish…
                  </Typography>
                )}
              </StepContent>
            </Step>

            {/* STEP 7 */}
            <Step expanded completed={step7Status === "complete"}>
              <StepLabel
                optional={<StatusChip status={step7Status} label={stepLabel(step7Status, "Paragraphs")} />}
              >
                Step 7 — Paragraph Builder
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Merge text blocks into logical paragraphs (same font, alignment, spacing).
                </Typography>
                {step7Status === "running" && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2">Building paragraphs…</Typography>
                  </Box>
                )}
                {step7 && (
                  <>
                    <ValidationRow ok={step7.validation.no_incorrect_splits} label="No paragraph split incorrectly" />
                    <ValidationRow ok={step7.validation.no_incorrect_merges} label="No incorrect merges" />
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", my: 2 }}>
                      <Chip
                        label={`${step7.total_paragraphs.toLocaleString()} paragraphs`}
                        size="small"
                        color="primary"
                      />
                      <Chip
                        label={`from ${step7.source_paragraph_blocks.toLocaleString()} paragraph blocks`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {step5 && step5.total_pages > 0 && (
                      <>
                        <FormControl size="small" sx={{ minWidth: 160, mb: 2, display: "block" }}>
                          <InputLabel>Inspect paragraphs by page</InputLabel>
                          <Select
                            value={selectedPage}
                            label="Inspect paragraphs by page"
                            onChange={(e) => setSelectedPage(Number(e.target.value))}
                          >
                            {Array.from({ length: step5.total_pages }, (_, i) => i + 1).map((p) => (
                              <MenuItem key={p} value={p}>
                                Page {p}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <ParagraphTable paragraphs={pageParagraphs?.paragraphs ?? []} page={selectedPage} />
                      </>
                    )}
                  </>
                )}
                {step6Status === "complete" && step7Status === "pending" && (
                  <Typography variant="body2" color="text.secondary">
                    Waiting for Step 6 to finish…
                  </Typography>
                )}
              </StepContent>
            </Step>

            {/* STEP 8 */}
            <Step expanded completed={step8Status === "complete"}>
              <StepLabel
                optional={<StatusChip status={step8Status} label={stepLabel(step8Status, "Images & Tables")} />}
              >
                Step 8 — Image & Table Builder
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Extract images, figures with captions, tables, activities, and glossaries.
                </Typography>
                {step8Status === "running" && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2">Extracting images and tables…</Typography>
                  </Box>
                )}
                {step8 && (
                  <>
                    <ValidationRow ok={step8.validation.caption_linked} label="Caption linked" />
                    <ValidationRow ok={step8.validation.images_detected} label="Images detected" />
                    <ValidationRow ok={step8.validation.tables_preserved} label="Tables preserved" />
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", my: 2 }}>
                      <Chip label={`${step8.figure_count} figures`} size="small" color="primary" />
                      <Chip label={`${step8.table_count} tables`} size="small" variant="outlined" />
                      <Chip label={`${step8.activity_count} activities`} size="small" color="secondary" />
                      <Chip label={`${step8.glossary_count} glossaries`} size="small" color="warning" />
                    </Box>

                    {step5 && step5.total_pages > 0 && (
                      <>
                        <FormControl size="small" sx={{ minWidth: 160, mb: 2, display: "block" }}>
                          <InputLabel>Inspect by page</InputLabel>
                          <Select
                            value={selectedPage}
                            label="Inspect by page"
                            onChange={(e) => setSelectedPage(Number(e.target.value))}
                          >
                            {Array.from({ length: step5.total_pages }, (_, i) => i + 1).map((p) => (
                              <MenuItem key={p} value={p}>
                                Page {p}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <ImageTableInspector
                          bookId={bookId!}
                          page={selectedPage}
                          data={pageImageTable}
                        />
                      </>
                    )}
                  </>
                )}
                {step7Status === "complete" && step8Status === "pending" && (
                  <Typography variant="body2" color="text.secondary">
                    Waiting for Step 7 to finish…
                  </Typography>
                )}
              </StepContent>
            </Step>

            {/* STEP 9 */}
            <Step expanded completed={step9Status === "complete"}>
              <StepLabel
                optional={<StatusChip status={step9Status} label={stepLabel(step9Status, "Validation")} />}
              >
                Step 9 — Validation Engine
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Mandatory cross-step checks. Pipeline stops if any check fails.
                </Typography>
                {step9Status === "running" && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2">Running validation engine…</Typography>
                  </Box>
                )}
                {step9 && (
                  <>
                    <Alert
                      severity={step9.validation?.passed ? "success" : "error"}
                      sx={{ mb: 2 }}
                    >
                      {step9.validation?.passed
                        ? `All ${step9.total_checks} checks passed`
                        : `Pipeline stopped — ${step9.passed_checks}/${step9.total_checks} checks passed`}
                    </Alert>
                    {(step9.checks ?? step9.validation?.checks ?? []).map((check) => (
                      <Box key={check.name} sx={{ mb: 0.5 }}>
                        <ValidationRow
                          ok={check.passed}
                          label={VALIDATION_CHECK_LABELS[check.name] ?? check.name}
                        />
                        {!check.passed && (check.errors?.length ?? 0) > 0 && (
                          <Typography variant="caption" color="error" sx={{ pl: 3.5, display: "block" }}>
                            {(check.errors ?? []).slice(0, 2).join(" · ")}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </>
                )}
                {step8Status === "complete" && step9Status === "pending" && (
                  <Typography variant="body2" color="text.secondary">
                    Waiting for Step 8 to finish…
                  </Typography>
                )}
              </StepContent>
            </Step>

            {/* STEP 10 */}
            <Step expanded completed={step10Status === "complete"}>
              <StepLabel
                optional={<StatusChip status={step10Status} label={stepLabel(step10Status, "Canonical JSON")} />}
              >
                Step 10 — Clean Canonical JSON
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Review chapter-by-chapter before database import: sections, paragraphs, figures, activities, tables, glossary.
                </Typography>
                {step10Status === "running" && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2">Building canonical JSON…</Typography>
                  </Box>
                )}
                {step10 && (
                  <>
                    <ValidationRow ok={step10.validation.structure_complete} label="Structure complete" />
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", my: 2 }}>
                      {Object.entries(step10.counts).map(([key, count]) => (
                        <Chip key={key} label={`${key}: ${count}`} size="small" variant="outlined" />
                      ))}
                    </Box>
                    {canonical && (
                      <CanonicalChapterValidator bookId={bookId!} data={canonical} />
                    )}
                  </>
                )}
                {step9Status === "complete" && step10Status === "pending" && (
                  <Typography variant="body2" color="text.secondary">
                    Waiting for Step 9 to finish…
                  </Typography>
                )}
              </StepContent>
            </Step>
          </Stepper>
        </CardContent>
      </Card>
    </Box>
  );
}

function stepLabel(status: StepStatus, name: string): string {
  if (status === "running") return `Running ${name}…`;
  if (status === "complete") return "Complete";
  if (status === "error") return "Failed";
  return "Pending";
}

function ValidationRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
      {ok ? (
        <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
      ) : (
        <ErrorIcon color="error" sx={{ fontSize: 18 }} />
      )}
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
}

function PageSizeTable({ pages, total }: { pages: Step01Result["pages"]; total: number }) {
  return (
    <Box sx={{ mt: 2, maxHeight: 200, overflow: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Page</TableCell>
            <TableCell align="right">Width</TableCell>
            <TableCell align="right">Height</TableCell>
            <TableCell align="right">Rotation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pages.map((p) => (
            <TableRow key={p.page}>
              <TableCell>{p.page}</TableCell>
              <TableCell align="right">{p.width}</TableCell>
              <TableCell align="right">{p.height}</TableCell>
              <TableCell align="right">{p.rotation}°</TableCell>
            </TableRow>
          ))}
          {total > pages.length && (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography variant="caption" color="text.secondary">
                  …and {total - pages.length} more pages
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}

function RoleTable({ blocks, page }: { blocks: ClassifiedBlock[]; page: number }) {
  if (blocks.length === 0) {
    return <Typography color="text.secondary">No blocks on page {page}.</Typography>;
  }

  const sorted = [...blocks].sort(
    (a, b) => (a.page_reading_order ?? 0) - (b.page_reading_order ?? 0)
  );

  return (
    <Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2, alignItems: "center" }}>
        {sorted.map((b, i) => (
          <Box key={b.block_id} sx={{ display: "flex", alignItems: "center" }}>
            <Chip
              label={`${b.page_reading_order}. ${BLOCK_ROLE_LABELS[b.role] ?? b.role}`}
              size="small"
              variant="outlined"
              color={b.role === "activity" ? "secondary" : b.role === "glossary" ? "warning" : "default"}
            />
            {i < sorted.length - 1 && (
              <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5 }}>
                ↓
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Box sx={{ maxHeight: 360, overflow: "auto" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width={50}>Order</TableCell>
              <TableCell width={90}>Block ID</TableCell>
              <TableCell width={100}>Role</TableCell>
              <TableCell width={100}>Type</TableCell>
              <TableCell>Text</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((b) => (
              <TableRow key={b.block_id} hover>
                <TableCell>{b.reading_order}</TableCell>
                <TableCell>
                  <Typography variant="caption" fontFamily="monospace">
                    {b.block_id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={BLOCK_ROLE_LABELS[b.role] ?? b.role} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip label={CONTENT_BLOCK_LABELS[b.type] ?? b.type} size="small" variant="outlined" />
                </TableCell>
                <TableCell sx={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {b.text ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}

function HierarchyOutline({ chapters }: { chapters: HierarchyChapter[] }) {
  return (
    <Box sx={{ maxHeight: 400, overflow: "auto", pl: 1 }}>
      {chapters.map((ch) => (
        <Box key={ch.number} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Chapter {ch.roman} — {ch.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Printed pp. {ch.printed_start}–{ch.printed_end} · {ch.blocks.length} direct blocks
          </Typography>
          {ch.sections.map((sec) => (
            <Box key={sec.number} sx={{ pl: 2, mb: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Section {sec.number} — {sec.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {sec.blocks.length} blocks
                {sec.subsections.length > 0 && ` · ${sec.subsections.length} subsections`}
              </Typography>
              {sec.subsections.map((sub) => (
                <Box key={sub.number} sx={{ pl: 2 }}>
                  <Typography variant="caption" display="block">
                    {sub.number} {sub.title} ({sub.blocks.length} blocks)
                  </Typography>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

function ParagraphTable({ paragraphs, page }: { paragraphs: ParagraphBlock[]; page: number }) {
  if (paragraphs.length === 0) {
    return <Typography color="text.secondary">No paragraphs on page {page}.</Typography>;
  }

  return (
    <Box sx={{ maxHeight: 400, overflow: "auto" }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell width={90}>Paragraph ID</TableCell>
            <TableCell width={80}>Sources</TableCell>
            <TableCell>Text</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paragraphs.map((p) => (
            <TableRow key={p.paragraph_id} hover>
              <TableCell>
                <Typography variant="caption" fontFamily="monospace" fontWeight={700}>
                  {p.paragraph_id}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {p.source_block_ids.length} block{p.source_block_ids.length !== 1 ? "s" : ""}
                </Typography>
              </TableCell>
              <TableCell>{p.text}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function ImageTableInspector({
  bookId,
  page,
  data,
}: {
  bookId: string;
  page: number;
  data: PageImageTable | null;
}) {
  if (!data) {
    return <Typography color="text.secondary">Loading page {page}…</Typography>;
  }

  const empty =
    data.figures.length === 0 &&
    data.tables.length === 0 &&
    data.activities.length === 0 &&
    data.glossaries.length === 0;

  if (empty) {
    return <Typography color="text.secondary">No extracted content on page {page}.</Typography>;
  }

  return (
    <Box sx={{ maxHeight: 480, overflow: "auto" }}>
      {data.figures.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Figures
          </Typography>
          {data.figures.map((f) => (
            <Box key={f.figure_id} sx={{ display: "flex", gap: 2, mb: 1.5, alignItems: "flex-start" }}>
              <Box
                component="img"
                src={api.getStep8ImageUrl(bookId, f.image_id)}
                alt={f.figure_id}
                sx={{ width: 80, height: 80, objectFit: "contain", bgcolor: "grey.100", borderRadius: 1 }}
              />
              <Box>
                <Typography variant="caption" fontFamily="monospace" fontWeight={700}>
                  {f.figure_id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {f.caption ?? "No caption linked"}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {data.tables.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Tables
          </Typography>
          {data.tables.map((t) => (
            <Box key={t.table_id} sx={{ mb: 1 }}>
              <Typography variant="caption" fontFamily="monospace">
                {t.table_id} · {t.rows}×{t.columns}
              </Typography>
              <Table size="small" sx={{ mt: 0.5 }}>
                <TableBody>
                  {Array.from({ length: t.rows }, (_, r) => (
                    <TableRow key={r}>
                      {Array.from({ length: t.columns }, (_, c) => {
                        const cell = t.cells.find((x) => x.row === r && x.col === c);
                        return <TableCell key={c}>{cell?.text ?? ""}</TableCell>;
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ))}
        </Box>
      )}

      {data.activities.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Activities
          </Typography>
          {data.activities.map((a) => (
            <Box key={a.activity_id} sx={{ mb: 1.5, p: 1, bgcolor: "action.hover", borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                {a.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                p.{a.page} · {a.activity_type ?? "activity"}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {a.body}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {data.glossaries.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Glossary
          </Typography>
          {data.glossaries.map((g) => (
            <Box key={g.glossary_id} sx={{ mb: 1 }}>
              {g.entries.length > 0 ? (
                g.entries.map((e) => (
                  <Typography key={`${g.glossary_id}-${e.word}`} variant="body2">
                    <strong>{e.word}</strong> — {e.meaning}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {g.glossary_id} (no parsed entries)
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
