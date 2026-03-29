# 🎯 Hyper-Detailed Blog SEO Checklist (2026 Edition)
> **Role:** Senior SEO Strategist & AI Search Specialist
> **Purpose:** Use this as a mandatory reference when drafting any new blog post in MDX for the WarmAudience platform.

---

## 🏗️ 1. Frontmatter Technical Setup (The Metadata)
Every article MUST start with this exact structure in the MDX file:

```yaml
---
title: "Primary Keyword Rich Title"
description: "High-CTR hook (150-160 chars)"
seoTitle: "Optional: Title for Google if different from page title"
seoDescription: "Optional: Specific Meta Description for SERPs"
date: "current date"
updatedAt: "date when updated"
category: "Category Name"
author: "Aurangzeb Abbas"
image: "/blog/hero-image.avif"
tags: ["tag1", "tag2"]
---
```

### ✅ Checklist:
*   **[ ] URL Slug:** Short, lowercase, hyphen-separated. (e.g., `/blog/audience-research-guide` NOT `/blog/how-to-do-audience-research-in-2026-easy-way`).
*   **[ ] Canonical Tag:** Managed by the system, but ensure no trailing slashes in your logic.
*   **[ ] Date Freshness:** Always update `updatedAt` when making non-trivial edits.

---

## ✍️ 2. Content Structure & Semantic SEO

### 💎 The 100-Word Rule (GEO Optimization)
*   **[ ] BLUF (Bottom Line Up Front):** Place the answer to the main search query in the first 2-3 sentences.
*   **[ ] Semantic Core:** Use the primary keyword in the first 50 words.
*   **[ ] TL;DR Box:** Always include a `<Note>` or `<HighlightBox>` summary at the top for AI search summaries (Generative AI Overviews).

### 🏷️ Heading Hierarchy (Semantic HTML)
*   **[ ] H1 (Post Title):** Exactly one per page. Must contain the primary keyword.
*   **[ ] H2s (Sub-pillars):** Use for main sections. Pose at least one as a question.
*   **[ ] H3s (Details):** Use for sub-points. DO NOT skip heading levels (e.g., don't go from H2 to H4).
*   **[ ] Anchor Links:** Ensure headings are clear; the system automatically generates IDs for deep-linking.

### 📏 Length & Density
*   **[ ] Pillar Posts:** 2,500 - 3000 words for high-competition keywords.
*   **[ ] Support Posts:** 1,500 - 2000 words.
*   **[ ] Paragraphs:** Maximum 3-4 lines. Increase readability score on mobile.

---

## 📊 3. Interactive & Visual Elements

### 📑 Table of Contents (TOC)
*   **[ ] Inclusion:** Every post over 800 words must have a `<TOC>` component.
*   **[ ] Anchor Precision:** Ensure TOC links match the slugified heading IDs.

### 🖼️ Image Optimization
*   **[ ] Format:** Use `.avif` (preferred) or `.webp`.
*   **[ ] Alt Text:** Mandatory. Describe the image + include a keyword if natural.
*   **[ ] Priority Prop:** If adding a Hero image, ensure it is set to `priority` (handled by MDX components).

### 📋 Tables & Comparisons
*   **[ ] Structured Data:** Use Markdown tables (`| Col | Col |`) for data comparisons. This helps AI bots extract your data for "comparison snippets" in SERPs.

### ❓ FAQ Section (Rich Snippets)
*   **[ ] Inclusion:** Add an "Frequently Asked Questions" section at the end using H3s or a custom component.
*   **[ ] Schema:** This wins "People Also Ask" slots in Google.

---

## 🔗 4. Linking Architecture

*   **[ ] Internal Links:** Minimum 3-5 links to other `warmaudience.com` blog posts or feature pages. Use descriptive anchor text (NOT "click here").
*   **[ ] External Citations:** Minimum 2 links to high-authority domains (DA 70+). Link to official docs, research studies, or major publications.
*   **[ ] External Link Security:** All external links must open in a new tab (`target="_blank"`) with `rel="noopener noreferrer"`.

---

## 🚀 5. Generative AI & Attribution Optimization (ARO)

Search is changing. You need to "feed" the AI models so they credit you.

*   **[ ] Entity Density:** Use names of specific tools, people, and frameworks (Entities) that the AI understands.
*   **[ ] Citation Triggers:** Use phrases like *"Our analysis of 500 LinkedIn profiles reveals..."* or *"According to the 2026 Audience Research Report..."*.
*   **[ ] Expert Quotes:** Include a quote from a team member or industry expert to boost E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).

---

## 🛑 6. What to Avoid (The "Blacklist")

*   **[ ] No Keyword Stuffing:** If it sounds robotic, rewrite it.
*   **[ ] No Broken Links:** Every link must be valid.
*   **[ ] No Large Layout Shifts:** Don't add components that generic un-sized layout jumps.
*   **[ ] No AI-Generated "Fluff":** If using AI to draft, ensure you add original insights, data, or personal experiences. Generic AI content will NOT rank in 2026.

---

## 🛠️ Components to Use in MDX:
*   `<TOC>`: For navigation.
*   `<Note>`: For critical warnings or takeaways.
*   `<HighlightBox>`: For expert tips or data points.
*   `<Badge>`: For category or status tags.
*   `<Button>`: For CTAs (Call to Action).

---
**Prepared by:** Antigravity SEO Subsystem
**Status:** Primary Reference Implementation
