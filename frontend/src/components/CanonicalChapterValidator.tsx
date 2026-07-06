import { useMemo, useState, type ReactNode } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  api,
  BLOCK_ROLE_LABELS,
  CanonicalActivity,
  CanonicalBlock,
  CanonicalChapter,
  CanonicalFigure,
  CanonicalGlossaryEntry,
  CanonicalParagraph,
  CanonicalSection,
  CanonicalSubsection,
  CanonicalTable,
  PlacedBlockRecord,
  Step10Canonical,
} from "../api";
import HierarchyBlockExplorer from "./HierarchyBlockExplorer";

const UNASSIGNED = "__unassigned__";

function blockToPlaced(b: CanonicalBlock): PlacedBlockRecord {
  return {
    block_id: b.block_id,
    chapter_id: b.chapter_id,
    chapter_roman: b.chapter_roman,
    chapter_title: b.chapter_title,
    section_id: b.section_id,
    topic_number: b.topic_number,
    topic_title: b.topic_title,
    subsection_id: b.subsection_id,
    subsection_number: b.subsection_number,
    subsection_title: b.subsection_title,
    placement_path: b.placement_path,
    role: b.role,
    content_type: b.content_type,
    page: b.page,
    reading_order: b.reading_order,
    text: b.text,
  };
}

type ChapterKey = string;

function byChapter<T extends { chapter_id?: string | null }>(items: T[], chapterKey: ChapterKey): T[] {
  if (chapterKey === UNASSIGNED) return items.filter((i) => !i.chapter_id);
  return items.filter((i) => i.chapter_id === chapterKey);
}

function chapterStats(data: Step10Canonical, chapterKey: ChapterKey) {
  return {
    paragraphs: byChapter(data.paragraphs, chapterKey).length,
    figures: byChapter(data.figures, chapterKey).length,
    activities: byChapter(data.activities, chapterKey).length,
    tables: byChapter(data.tables, chapterKey).length,
    glossary: byChapter(data.glossary, chapterKey).length,
  };
}

export default function CanonicalChapterValidator({
  bookId,
  data,
}: {
  bookId: string;
  data: Step10Canonical;
}) {
  const [mode, setMode] = useState(0);
  const chapters = useMemo(() => {
    const list = [...data.chapters];
    const unassigned = chapterStats(data, UNASSIGNED);
    const hasUnassigned = Object.values(unassigned).some((n) => n > 0);
    if (hasUnassigned) {
      list.push({
        chapter_id: UNASSIGNED,
        number: 0,
        roman: "?",
        title: "Unassigned (needs review)",
        printed_start: 0,
        printed_end: 0,
        section_ids: [],
        paragraph_ids: byChapter(data.paragraphs, UNASSIGNED).map((p) => p.paragraph_id),
      });
    }
    return list;
  }, [data]);

  const [selectedId, setSelectedId] = useState<ChapterKey>(chapters[0]?.chapter_id ?? "");

  const selected = chapters.find((c) => c.chapter_id === selectedId) ?? chapters[0];
  const stats = selected ? chapterStats(data, selected.chapter_id) : null;

  return (
    <Box sx={{ mt: 2 }}>
      <Tabs value={mode} onChange={(_, v) => setMode(v)} sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
        <Tab label="Validate by chapter" />
        <Tab label="All entities" />
        <Tab label={`Atomic blocks (${data.blocks?.length ?? 0})`} />
      </Tabs>

      {mode === 0 && selected && stats && (
        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
          <Box
            sx={{
              width: { xs: "100%", md: 280 },
              flexShrink: 0,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              maxHeight: 480,
              overflow: "auto",
            }}
          >
            <Typography variant="subtitle2" sx={{ p: 1.5, bgcolor: "grey.50" }}>
              Chapters ({chapters.length})
            </Typography>
            <List dense disablePadding>
              {chapters.map((ch) => {
                const s = chapterStats(data, ch.chapter_id);
                const isUnassigned = ch.chapter_id === UNASSIGNED;
                return (
                  <ListItemButton
                    key={ch.chapter_id}
                    selected={selectedId === ch.chapter_id}
                    onClick={() => setSelectedId(ch.chapter_id)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          {isUnassigned && <WarningAmberIcon color="warning" sx={{ fontSize: 16 }} />}
                          <span>
                            {isUnassigned ? ch.title : `Chapter ${ch.roman}`}
                          </span>
                        </Box>
                      }
                      secondary={
                        isUnassigned
                          ? `${s.paragraphs} paragraphs · review before DB`
                          : `${ch.title.slice(0, 40)}${ch.title.length > 40 ? "…" : ""}`
                      }
                    />
                    <Chip label={s.paragraphs} size="small" variant="outlined" />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ChapterDetailPanel bookId={bookId} data={data} chapter={selected} stats={stats} />
          </Box>
        </Box>
      )}

      {mode === 1 && <AllEntitiesView bookId={bookId} data={data} />}

      {mode === 2 && (
        <HierarchyBlockExplorer
          blockIndex={(data.blocks ?? []).map(blockToPlaced)}
        />
      )}
    </Box>
  );
}

function ChapterDetailPanel({
  bookId,
  data,
  chapter,
  stats,
}: {
  bookId: string;
  data: Step10Canonical;
  chapter: CanonicalChapter;
  stats: ReturnType<typeof chapterStats>;
}) {
  const isUnassigned = chapter.chapter_id === UNASSIGNED;
  const sections = data.sections
    .filter((s) => (isUnassigned ? !s.chapter_id : s.chapter_id === chapter.chapter_id))
    .sort((a, b) => {
      if (a.is_overview) return -1;
      if (b.is_overview) return 1;
      const an = parseInt(a.number, 10);
      const bn = parseInt(b.number, 10);
      if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
      return a.number.localeCompare(b.number);
    });
  const subsections = data.subsections ?? [];
  const paraMap = useMemo(
    () => Object.fromEntries(data.paragraphs.map((p) => [p.paragraph_id, p])),
    [data.paragraphs]
  );

  const chapterParagraphs = byChapter(data.paragraphs, chapter.chapter_id);
  const sectionParaIds = new Set(sections.flatMap((s) => s.paragraph_ids));
  const directParagraphs = chapterParagraphs.filter((p) => !sectionParaIds.has(p.paragraph_id));

  const figures = byChapter(data.figures, chapter.chapter_id);
  const activities = byChapter(data.activities, chapter.chapter_id);
  const tables = byChapter(data.tables, chapter.chapter_id);
  const glossary = byChapter(data.glossary, chapter.chapter_id);

  const sectionEntityIds = new Set(sections.map((s) => s.section_id));
  const directFigures = figures.filter((f) => !f.section_id || !sectionEntityIds.has(f.section_id));
  const directActivities = activities.filter((a) => !a.section_id || !sectionEntityIds.has(a.section_id));
  const directTables = tables.filter((t) => !t.section_id || !sectionEntityIds.has(t.section_id));
  const directGlossary = glossary.filter((g) => !g.section_id || !sectionEntityIds.has(g.section_id));

  const ready = stats.paragraphs > 0 && !isUnassigned;

  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2, maxHeight: 520, overflow: "auto" }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {isUnassigned ? "Unassigned content" : `Chapter ${chapter.roman} — ${chapter.title}`}
        </Typography>
        {!isUnassigned && (
          <Typography variant="body2" color="text.secondary">
            Printed pages {chapter.printed_start}–{chapter.printed_end} · {chapter.chapter_id}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
          <Chip label={`${stats.paragraphs} paragraphs`} size="small" color="primary" />
          <Chip label={`${sections.length} topics`} size="small" variant="outlined" />
          <Chip label={`${stats.figures} figures`} size="small" variant="outlined" />
          <Chip label={`${stats.activities} activities`} size="small" variant="outlined" />
          <Chip label={`${stats.tables} tables`} size="small" variant="outlined" />
          <Chip label={`${stats.glossary} glossary`} size="small" variant="outlined" />
        </Box>
      </Box>

      <Alert severity={isUnassigned ? "warning" : ready ? "success" : "info"} sx={{ mb: 2 }}>
        {isUnassigned
          ? "Content not linked to a chapter — fix hierarchy before database import."
          : ready
            ? "Chapter looks ready for validation. Review sections and content below."
            : "No paragraphs in this chapter yet."}
      </Alert>

      {sections.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Topics
          </Typography>
          {sections.map((sec) => (
            <SectionBlock
              key={sec.section_id}
              section={sec}
              subsections={subsections.filter((s) => s.section_id === sec.section_id)}
              paraMap={paraMap}
              figures={figures}
              activities={activities}
              tables={tables}
              glossary={glossary}
              bookId={bookId}
            />
          ))}
        </Box>
      )}

      {directParagraphs.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Chapter paragraphs {sections.length > 0 ? "(not in a section)" : ""}
          </Typography>
          <ParagraphList paragraphs={directParagraphs} />
        </Box>
      )}

      {directFigures.length > 0 && (
        <ContentSection title={`Figures (${directFigures.length}) — chapter level`}>
          {directFigures.map((f) => (
            <Box key={f.figure_id} sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
              <Box
                component="img"
                src={api.getStep8ImageUrl(bookId, f.image_id)}
                alt={f.figure_id}
                sx={{ width: 56, height: 56, objectFit: "contain", bgcolor: "grey.100", borderRadius: 1 }}
              />
              <Box>
                <Typography variant="caption" fontFamily="monospace">{f.figure_id} · p.{f.page}</Typography>
                <Typography variant="body2">{f.caption ?? "No caption"}</Typography>
              </Box>
            </Box>
          ))}
        </ContentSection>
      )}

      {directActivities.length > 0 && (
        <ContentSection title={`Activities (${directActivities.length}) — chapter level`}>
          {directActivities.map((a) => (
            <Box key={a.activity_id} sx={{ mb: 1.5, p: 1, bgcolor: "action.hover", borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={600}>{a.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                p.{a.page} · {a.activity_type ?? "activity"}
                {a.source_block_ids?.length ? ` · ${a.source_block_ids.length} blocks merged` : ""}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{a.body}</Typography>
            </Box>
          ))}
        </ContentSection>
      )}

      {directTables.length > 0 && (
        <ContentSection title={`Tables (${directTables.length}) — chapter level`}>
          {directTables.map((t) => (
            <MiniTable key={t.table_id} table={t} />
          ))}
        </ContentSection>
      )}

      {directGlossary.length > 0 && (
        <ContentSection title={`Glossary (${directGlossary.length}) — chapter level`}>
          {directGlossary.map((e, i) => (
            <Typography key={`${e.word}-${i}`} variant="body2" sx={{ mb: 0.5 }}>
              <strong>{e.word}</strong> — {e.meaning}
            </Typography>
          ))}
        </ContentSection>
      )}

      {stats.paragraphs === 0 && figures.length === 0 && activities.length === 0 && (
        <Typography color="text.secondary">No content in this chapter.</Typography>
      )}
    </Box>
  );
}

function ContentGroup({
  title,
  paragraphs,
  figures,
  activities,
  tables,
  glossary,
  bookId,
}: {
  title?: string;
  paragraphs: CanonicalParagraph[];
  figures: CanonicalFigure[];
  activities: CanonicalActivity[];
  tables: CanonicalTable[];
  glossary: CanonicalGlossaryEntry[];
  bookId: string;
}) {
  const hasContent =
    paragraphs.length > 0 ||
    figures.length > 0 ||
    activities.length > 0 ||
    tables.length > 0 ||
    glossary.length > 0;

  if (!hasContent) {
    return <Typography variant="caption" color="text.secondary">No content</Typography>;
  }

  return (
    <Box>
      {title && (
        <Typography variant="caption" fontWeight={600} display="block" gutterBottom sx={{ color: "text.secondary" }}>
          {title}
        </Typography>
      )}
      {paragraphs.length > 0 && <ParagraphList paragraphs={paragraphs} />}
      {figures.length > 0 && (
        <Box sx={{ mt: paragraphs.length > 0 ? 1.5 : 0 }}>
          <Typography variant="caption" fontWeight={600} display="block" gutterBottom>Figures</Typography>
          {figures.map((f) => (
            <Box key={f.figure_id} sx={{ display: "flex", gap: 1.5, mb: 1 }}>
              <Box
                component="img"
                src={api.getStep8ImageUrl(bookId, f.image_id)}
                alt={f.figure_id}
                sx={{ width: 48, height: 48, objectFit: "contain", bgcolor: "grey.100", borderRadius: 1 }}
              />
              <Box>
                <Typography variant="caption" fontFamily="monospace">{f.figure_id} · p.{f.page}</Typography>
                <Typography variant="body2">{f.caption ?? "No caption"}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
      {activities.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
            Activities · New words · Source · Discuss
          </Typography>
          {activities.map((a) => (
            <Box key={a.activity_id} sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight={600}>{a.title}</Typography>
              <Typography variant="caption" color="text.secondary">p.{a.page}</Typography>
              <Typography variant="body2" color="text.secondary">
                {a.body.slice(0, 150)}{a.body.length > 150 ? "…" : ""}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
      {tables.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" fontWeight={600} display="block" gutterBottom>Tables</Typography>
          {tables.map((t) => <MiniTable key={t.table_id} table={t} />)}
        </Box>
      )}
      {glossary.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" fontWeight={600} display="block" gutterBottom>Glossary</Typography>
          {glossary.map((e, i) => (
            <Typography key={`${e.word}-${i}`} variant="body2" sx={{ mb: 0.5 }}>
              <strong>{e.word}</strong> — {e.meaning}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}

function SectionBlock({
  section,
  subsections,
  paraMap,
  figures,
  activities,
  tables,
  glossary,
  bookId,
}: {
  section: CanonicalSection;
  subsections: CanonicalSubsection[];
  paraMap: Record<string, CanonicalParagraph>;
  figures: CanonicalFigure[];
  activities: CanonicalActivity[];
  tables: CanonicalTable[];
  glossary: CanonicalGlossaryEntry[];
  bookId: string;
}) {
  const topicParagraphs = section.paragraph_ids
    .map((id) => paraMap[id])
    .filter((p): p is CanonicalParagraph => !!p);

  const inSection = <T extends { section_id?: string | null; subsection_id?: string | null }>(items: T[]) =>
    items.filter((i) => i.section_id === section.section_id);

  const topicOnly = <T extends { subsection_id?: string | null }>(items: T[]) =>
    items.filter((i) => !i.subsection_id);

  const forSubsection = <T extends { subsection_id?: string | null }>(items: T[], subId: string) =>
    items.filter((i) => i.subsection_id === subId);

  const sectionItems = inSection(figures);
  const sectionActs = inSection(activities);
  const sectionTables = inSection(tables);
  const sectionGlossary = inSection(glossary);

  const topicLevelParas = topicParagraphs;
  const totalParas =
    topicLevelParas.length +
    subsections.reduce((n, s) => n + s.paragraph_ids.length, 0);

  const label = section.is_overview
    ? "Overview"
    : `Topic ${section.number}`;

  return (
    <Accordion disableGutters sx={{ mb: 1, "&:before": { display: "none" } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="body2" fontWeight={600}>{label}</Typography>
          <Typography variant="body2" color="text.secondary">
            {section.title.slice(0, 60)}{section.title.length > 60 ? "…" : ""}
          </Typography>
          <Chip label={`${totalParas} ¶`} size="small" />
          {sectionItems.length > 0 && (
            <Chip label={`${sectionItems.length} fig`} size="small" variant="outlined" />
          )}
          {sectionActs.length > 0 && (
            <Chip label={`${sectionActs.length} act`} size="small" variant="outlined" />
          )}
          {subsections.length > 0 && (
            <Chip label={`${subsections.length} subtopics`} size="small" variant="outlined" />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <ContentGroup
          title={subsections.length > 0 ? `${label} introduction` : undefined}
          paragraphs={topicLevelParas}
          figures={topicOnly(sectionItems)}
          activities={topicOnly(sectionActs)}
          tables={topicOnly(sectionTables)}
          glossary={topicOnly(sectionGlossary)}
          bookId={bookId}
        />
        {subsections.map((sub) => (
          <Box key={sub.subsection_id} sx={{ mt: 2, pl: 1, borderLeft: 2, borderColor: "divider" }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              {sub.number} {sub.title}
            </Typography>
            <ContentGroup
              paragraphs={sub.paragraph_ids.map((id) => paraMap[id]).filter((p): p is CanonicalParagraph => !!p)}
              figures={forSubsection(sectionItems, sub.subsection_id)}
              activities={forSubsection(sectionActs, sub.subsection_id)}
              tables={forSubsection(sectionTables, sub.subsection_id)}
              glossary={forSubsection(sectionGlossary, sub.subsection_id)}
              bookId={bookId}
            />
          </Box>
        ))}
      </AccordionDetails>
    </Accordion>
  );
}

function ParagraphList({ paragraphs }: { paragraphs: CanonicalParagraph[] }) {
  if (paragraphs.length === 0) {
    return <Typography variant="caption" color="text.secondary">No paragraphs</Typography>;
  }
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell width={90}>ID</TableCell>
          <TableCell width={50}>Page</TableCell>
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
            <TableCell>{p.page}</TableCell>
            <TableCell sx={{ whiteSpace: "normal" }}>{p.text}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ContentSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Divider sx={{ mb: 1 }} />
      <Typography variant="subtitle2" gutterBottom>{title}</Typography>
      {children}
    </Box>
  );
}

function MiniTable({ table }: { table: CanonicalTable }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" fontFamily="monospace">
        {table.table_id} · {table.rows}×{table.columns} · p.{table.page}
      </Typography>
      <Table size="small" sx={{ mt: 0.5 }}>
        <TableBody>
          {Array.from({ length: Math.min(table.rows, 5) }, (_, r) => (
            <TableRow key={r}>
              {Array.from({ length: table.columns }, (_, c) => {
                const cell = table.cells.find((x) => x.row === r && x.col === c);
                return <TableCell key={c}>{cell?.text ?? ""}</TableCell>;
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function AllEntitiesView({ bookId, data }: { bookId: string; data: Step10Canonical }) {
  const [tab, setTab] = useState(0);
  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
        <Tab label={`Paragraphs (${data.paragraphs.length})`} />
        <Tab label={`Figures (${data.figures.length})`} />
        <Tab label={`Activities (${data.activities.length})`} />
        <Tab label={`Tables (${data.tables.length})`} />
        <Tab label={`Glossary (${data.glossary.length})`} />
      </Tabs>
      <Box sx={{ maxHeight: 400, overflow: "auto" }}>
        {tab === 0 && <ParagraphList paragraphs={data.paragraphs.slice(0, 150)} />}
        {tab === 1 && (
          <Box>
            {data.figures.slice(0, 30).map((f) => (
              <Box key={f.figure_id} sx={{ display: "flex", gap: 1, mb: 1 }}>
                <Box component="img" src={api.getStep8ImageUrl(bookId, f.image_id)} alt="" sx={{ width: 48, height: 48, objectFit: "contain" }} />
                <Typography variant="body2">{f.figure_id} · {f.caption ?? "—"}</Typography>
              </Box>
            ))}
          </Box>
        )}
        {tab === 2 && (
          <Box>
            {data.activities.slice(0, 40).map((a) => (
              <Box key={a.activity_id} sx={{ mb: 1.5 }}>
                <Typography variant="body2" fontWeight={600}>{a.title}</Typography>
                <Typography variant="caption" color="text.secondary">p.{a.page} · {a.activity_type ?? "activity"}</Typography>
                <Typography variant="body2" color="text.secondary">{a.body}</Typography>
              </Box>
            ))}
          </Box>
        )}
        {tab === 3 && data.tables.slice(0, 10).map((t) => <MiniTable key={t.table_id} table={t} />)}
        {tab === 4 && (
          <Box>
            {data.glossary.map((e, i) => (
              <Typography key={i} variant="body2"><strong>{e.word}</strong> — {e.meaning}</Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
