import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { BLOCK_ROLE_LABELS, PlacedBlockRecord } from "../api";

function BlockTable({ blocks }: { blocks: PlacedBlockRecord[] }) {
  if (blocks.length === 0) {
    return <Typography variant="caption" color="text.secondary">No blocks</Typography>;
  }
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell width={90}>Block</TableCell>
          <TableCell width={50}>Page</TableCell>
          <TableCell width={90}>Role</TableCell>
          <TableCell>Text</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {blocks.map((b) => (
          <TableRow key={b.block_id} hover>
            <TableCell>
              <Typography variant="caption" fontFamily="monospace" fontWeight={700}>
                {b.block_id}
              </Typography>
            </TableCell>
            <TableCell>{b.page}</TableCell>
            <TableCell>
              <Chip label={BLOCK_ROLE_LABELS[b.role] ?? b.role} size="small" variant="outlined" />
            </TableCell>
            <TableCell sx={{ whiteSpace: "normal" }}>{b.text ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function HierarchyBlockExplorer({
  blockIndex,
  coverPages = [],
  skippedCount = 0,
}: {
  blockIndex: PlacedBlockRecord[];
  coverPages?: number[];
  skippedCount?: number;
}) {
  const chapters = useMemo(() => {
    const map = new Map<string, { roman: string; title: string; blocks: PlacedBlockRecord[] }>();
    for (const b of blockIndex) {
      const entry = map.get(b.chapter_id) ?? {
        roman: b.chapter_roman,
        title: b.chapter_title,
        blocks: [],
      };
      entry.blocks.push(b);
      map.set(b.chapter_id, entry);
    }
    return [...map.entries()].sort((a, b) => a[1].roman.localeCompare(b[1].roman));
  }, [blockIndex]);

  const [chapterId, setChapterId] = useState(chapters[0]?.[0] ?? "");

  const selected = chapters.find(([id]) => id === chapterId)?.[1];
  const chapterBlocks = selected?.blocks ?? [];

  const grouped = useMemo(() => {
    const topics = new Map<string, { title: string; isOverview: boolean; blocks: PlacedBlockRecord[]; subs: Map<string, { title: string; blocks: PlacedBlockRecord[] }> }>();
    for (const b of chapterBlocks) {
      const key = b.section_id ?? "none";
      const topic = topics.get(key) ?? {
        title: b.topic_title ?? "Unassigned",
        isOverview: b.topic_number === "0",
        blocks: [],
        subs: new Map(),
      };
      if (b.subsection_id) {
        const sub = topic.subs.get(b.subsection_id) ?? {
          title: b.subsection_title ?? b.subsection_number ?? "",
          blocks: [],
        };
        sub.blocks.push(b);
        topic.subs.set(b.subsection_id, sub);
      } else {
        topic.blocks.push(b);
      }
      topics.set(key, topic);
    }
    return [...topics.entries()].sort((a, b) => {
      const an = parseInt(a[1].blocks[0]?.topic_number ?? a[1].subs.values().next().value?.blocks[0]?.topic_number ?? "999", 10);
      const bn = parseInt(b[1].blocks[0]?.topic_number ?? b[1].subs.values().next().value?.blocks[0]?.topic_number ?? "999", 10);
      if (a[1].isOverview) return -1;
      if (b[1].isOverview) return 1;
      return (Number.isNaN(an) ? 999 : an) - (Number.isNaN(bn) ? 999 : bn);
    });
  }, [chapterBlocks]);

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Chip label={`${blockIndex.length} blocks placed`} size="small" color="primary" />
        {coverPages.length > 0 && (
          <Chip label={`Cover pages skipped: ${coverPages.join(", ")}`} size="small" variant="outlined" />
        )}
        {skippedCount > 0 && (
          <Chip label={`${skippedCount} skipped (cover + front matter)`} size="small" variant="outlined" />
        )}
      </Box>

      {chapters.length === 0 ? (
        <Typography color="text.secondary">No placed blocks yet. Run Step 6.</Typography>
      ) : (
        <>
          <FormControl size="small" sx={{ minWidth: 220, mb: 2, display: "block" }}>
            <InputLabel>Chapter</InputLabel>
            <Select value={chapterId} label="Chapter" onChange={(e) => setChapterId(e.target.value)}>
              {chapters.map(([id, ch]) => (
                <MenuItem key={id} value={id}>
                  Chapter {ch.roman} — {ch.title.slice(0, 40)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {grouped.map(([sectionId, topic]) => (
            <Accordion key={sectionId} disableGutters sx={{ mb: 1, "&:before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                  <Typography variant="body2" fontWeight={600}>
                    {topic.isOverview ? "Overview" : `Topic ${topic.blocks[0]?.topic_number ?? ""}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{topic.title}</Typography>
                  <Chip
                    label={`${topic.blocks.length + [...topic.subs.values()].reduce((n, s) => n + s.blocks.length, 0)} blocks`}
                    size="small"
                  />
                  {topic.subs.size > 0 && (
                    <Chip label={`${topic.subs.size} subtopics`} size="small" variant="outlined" />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {topic.blocks.length > 0 && (
                  <Box sx={{ mb: topic.subs.size > 0 ? 2 : 0 }}>
                    {topic.subs.size > 0 && (
                      <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                        Topic introduction
                      </Typography>
                    )}
                    <BlockTable blocks={topic.blocks} />
                  </Box>
                )}
                {[...topic.subs.entries()].map(([subId, sub]) => (
                  <Box key={subId} sx={{ mt: 2, pl: 1, borderLeft: 2, borderColor: "divider" }}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      {sub.blocks[0]?.subsection_number} {sub.title}
                    </Typography>
                    <BlockTable blocks={sub.blocks} />
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}
    </Box>
  );
}
