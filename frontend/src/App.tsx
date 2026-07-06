import { Link, Route, Routes } from "react-router-dom";
import { AppBar, Box, Container, Toolbar, Typography, Button } from "@mui/material";
import UploadPage from "./pages/UploadPage";
import BookDetailPage from "./pages/BookDetailPage";

export default function App() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Knowledge Compiler — Pre-AI Pipeline
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Upload
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/books/:bookId" element={<BookDetailPage />} />
        </Routes>
      </Container>
    </Box>
  );
}
