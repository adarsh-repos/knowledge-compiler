import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { motion } from "framer-motion";

const FAQS = [
  {
    q: "Pehle din mock dena hai?",
    a: "Nahi. Aap Foundation phase mein land karte ho — Aaj ka Plan ready hota hai NCERT aur practice ke saath. Mock baad mein aate hain.",
  },
  {
    q: "Doosre apps se kya alag hai?",
    a: "Wahan MCQ aur chat alag-alag hain. Yahan sab connected hai — mock result se weak area, phir NCERT fix, phir roz ka plan.",
  },
  {
    q: "Foundation phase kya hai?",
    a: "Shuruat NCERT se. Roz 4 tasks — padho, practice karo, revise karo. System batata hai kya karna hai, aap decide nahi karte.",
  },
  {
    q: "Signup free hai?",
    a: "Haan. Mobile OTP se signup, seedha dashboard pe. Koi payment nahi chahiye shuru karne ke liye.",
  },
];

export function FAQSection() {
  const [expanded, setExpanded] = useState<string | false>(false);

  return (
    <Box id="faq" sx={{ py: { xs: 5, md: 9 } }}>
      <Stack alignItems="center" sx={{ mb: { xs: 3, md: 4 }, textAlign: "center" }}>
        <Typography
          variant="overline"
          sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.1em", fontSize: "0.7rem" }}
        >
          FAQ
        </Typography>
        <Typography
          component="h2"
          sx={{ mt: 0.75, fontSize: { xs: "1.45rem", sm: "1.85rem", md: "2.2rem" }, fontWeight: 800 }}
        >
          Common sawaal
        </Typography>
      </Stack>

      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        sx={{ maxWidth: 640, mx: "auto" }}
      >
        {FAQS.map((faq) => (
          <Accordion
            key={faq.q}
            expanded={expanded === faq.q}
            onChange={(_, isExp) => setExpanded(isExp ? faq.q : false)}
            disableGutters
            elevation={0}
            sx={{
              mb: 1,
              borderRadius: "10px !important",
              border: (t) => `1px solid ${t.palette.divider}`,
              "&:before": { display: "none" },
              overflow: "hidden",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreRoundedIcon />}
              sx={{ px: { xs: 1.75, md: 2.25 }, py: 0.25, "& .MuiAccordionSummary-content": { my: 1.25 } }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: { xs: "0.9rem", md: "0.95rem" } }}>
                {faq.q}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 1.75, md: 2.25 }, pt: 0, pb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, fontSize: "0.88rem" }}>
                {faq.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
