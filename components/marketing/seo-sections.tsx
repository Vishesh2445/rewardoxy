import Link from "next/link";
import { Box, Container, Paper, Grid, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import colors from "@/theme/colors";
import type { FaqItem } from "@/lib/content/schema";

export function HeroSection({
  title,
  highlight,
  subtitle,
}: {
  title: string;
  highlight?: string;
  subtitle: string;
}) {
  return (
    <Box sx={{ textAlign: "center", mb: 8 }}>
      <Box component="h1" sx={{ fontSize: { xs: "2rem", sm: "2.75rem" }, fontWeight: 800, m: 0, lineHeight: 1.2 }}>
        {title}{" "}
        {highlight && <Box component="span" sx={{ color: colors.green }}>{highlight}</Box>}
      </Box>
      <Box
        component="p"
        sx={{ mt: 2, fontSize: "1.1rem", color: colors.textSecondary, maxWidth: 640, mx: "auto", lineHeight: 1.7 }}
      >
        {subtitle}
      </Box>
    </Box>
  );
}

export function StepGrid({
  steps,
}: {
  steps: { step: string; title: string; desc: string }[];
}) {
  return (
    <Grid container spacing={3} sx={{ mb: 6 }}>
      {steps.map((item) => (
        <Grid size={{ xs: 12, sm: 4 }} key={item.step}>
          <Paper elevation={0} sx={{ bgcolor: colors.bgCard, borderRadius: 3, p: 3, height: "100%", textAlign: "center" }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: colors.greenTint,
                color: colors.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                mx: "auto",
                mb: 2,
              }}
            >
              {item.step}
            </Box>
            <Box sx={{ fontWeight: 700, fontSize: "1rem", mb: 1 }}>{item.title}</Box>
            <Box sx={{ color: colors.textSecondary, fontSize: "0.9rem", lineHeight: 1.7 }}>{item.desc}</Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export function FaqList({ faqs }: { faqs: FaqItem[] }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {faqs.map((faq, i) => (
        <Paper key={i} elevation={0} sx={{ bgcolor: colors.bgCard, borderRadius: 3, p: { xs: 2.5, sm: 3.5 } }}>
          <Box component="h2" sx={{ fontSize: "1.05rem", fontWeight: 700, m: 0, mb: 1.5 }}>
            {faq.q}
          </Box>
          <Box sx={{ color: colors.textSecondary, fontSize: "0.925rem", lineHeight: 1.8 }}>{faq.a}</Box>
        </Paper>
      ))}
    </Box>
  );
}

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {faqs.map((faq, i) => (
        <Accordion
          key={i}
          disableGutters
          elevation={0}
          sx={{
            bgcolor: colors.bgCard,
            borderRadius: "12px !important",
            "&:before": { display: "none" },
            overflow: "hidden",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: colors.textSecondary }} />}>
            <Box sx={{ fontWeight: 700, fontSize: "0.95rem" }}>{faq.q}</Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ color: colors.textSecondary, fontSize: "0.9rem", lineHeight: 1.8 }}>{faq.a}</Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

export function CtaBanner({
  text,
  buttonText = "Start Earning Free",
  href = "/auth/signup",
}: {
  text: string;
  buttonText?: string;
  href?: string;
}) {
  return (
    <Box sx={{ textAlign: "center", mt: 8, mb: 2 }}>
      <Box component="p" sx={{ color: colors.textSecondary, mb: 3, fontSize: "1.05rem" }}>
        {text}
      </Box>
      <Link
        href={href}
        style={{
          display: "inline-block",
          background: "linear-gradient(180deg, #10B981 0%, #059669 100%)",
          color: "#fff",
          fontWeight: 700,
          padding: "14px 32px",
          borderRadius: 12,
          textDecoration: "none",
          fontSize: "1rem",
        }}
      >
        {buttonText}
      </Link>
    </Box>
  );
}

export function RelatedLinks({
  links,
}: {
  links: { text: string; href: string }[];
}) {
  return (
    <Paper elevation={0} sx={{ bgcolor: colors.bgCard, borderRadius: 3, p: 3, mt: 4 }}>
      <Box sx={{ fontWeight: 700, mb: 2 }}>Related Pages</Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: colors.green,
              textDecoration: "none",
              fontSize: "0.875rem",
              padding: "6px 14px",
              border: `1px solid ${colors.divider}`,
              borderRadius: 8,
            }}
          >
            {link.text}
          </Link>
        ))}
      </Box>
    </Paper>
  );
}

export function PageContainer({
  children,
  maxWidth = "md",
}: {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}) {
  return (
    <Container maxWidth={maxWidth} sx={{ py: { xs: 6, sm: 10 } }}>
      {children}
    </Container>
  );
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Box component="h2" sx={{ fontSize: "1.5rem", fontWeight: 700, mb: 3, mt: 5 }}>
      {children}
    </Box>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 3, fontSize: "0.95rem" }}>
      {children}
    </Box>
  );
}
