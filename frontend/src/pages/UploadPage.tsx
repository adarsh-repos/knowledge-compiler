import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { api, Book } from "../api";

export default function UploadPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("NCERT Class 10 History");
  const [subject, setSubject] = useState("History");
  const [classLevel, setClassLevel] = useState("10");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadBooks = useCallback(async () => {
    try {
      setBooks(await api.listBooks());
    } catch {
      /* backend may not be running yet */
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title);
      fd.append("subject", subject);
      fd.append("class_level", classLevel);
      const result = await api.uploadBook(fd);
      navigate(`/books/${result.book.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Upload PDF
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Upload the full NCERT PDF. Steps 1–10 run automatically. No AI.
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: "grid", gap: 2, maxWidth: 480 }}>
            <TextField label="Book Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
            <TextField label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} fullWidth />
            <TextField label="Class" value={classLevel} onChange={(e) => setClassLevel(e.target.value)} fullWidth />
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
              Choose PDF
              <input type="file" accept=".pdf" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </Button>
            {file && (
              <Typography variant="body2" color="text.secondary">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
              </Typography>
            )}
            <Button variant="contained" size="large" disabled={!file || uploading} onClick={handleUpload}>
              {uploading ? "Uploading…" : "Upload PDF"}
            </Button>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Previous uploads
      </Typography>
      {books.length === 0 ? (
        <Typography color="text.secondary">No books uploaded yet.</Typography>
      ) : (
        <List>
          {books.map((book) => (
            <ListItem key={book.id} disablePadding>
              <ListItemButton onClick={() => navigate(`/books/${book.id}`)}>
                <ListItemText primary={book.title} secondary={book.filename} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
