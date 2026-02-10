# Operator SOP — New Site from Base Template

> Step-by-step procedure for creating a new industry site from the astro-local-business-v2 base.

---

## Step 1: Create the Project Repo

Create a folder locally and connect it to a new GitHub repo:

```bash
mkdir {industry}-template && cd {industry}-template
echo "# {industry}-template" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/hoyere/{industry}-template.git
git push -u origin main
```

Clone the base template into this folder:

```bash
git clone https://github.com/hoyere/astro-local-business-v2.git
```

---

## Step 2: Export & Format the Notion Crops

1. Go to the Notion database for this project's component crops
2. Export to CSV
3. Import the CSV into a new tab in the [formatting spreadsheet](https://docs.google.com/spreadsheets/d/1ooPaLDExPkYPrTqPFffhMeq_3rbpD--oipr343nY9AQ/edit?gid=1228472663#gid=1228472663)
4. Name the tab using the industry convention
5. Update the tab name in the formatter formulas (two spots in the second column's formula)
6. Copy the formatted Name and cropHtml columns → paste special (values only)
7. Download as CSV
8. Move the CSV into `html-base/` next to `download_csv_mockups.py`

---

## Step 3: Download HTML Slices

Ensure the S3 bucket holding the cropHtml files is set to public access.

```bash
cd html-base/

# The script auto-discovers the single CSV in this folder.
# It downloads each HTML snippet from S3, decodes the sheet export format,
# and writes clean HTML to html/ plus an updated manifest.json.
python download_csv_mockups.py

# To re-download all files (overwrite existing):
python download_csv_mockups.py --force

# To specify a CSV if multiple exist:
python download_csv_mockups.py --csv "automatetemplates - {industry}.csv"
```

After the download completes:
- Check stderr for any reported issues
- Verify `html/` contains the expected number of `.html` files
- Verify `manifest.json` was written with matching `local_html` paths
- Commit the new files

### Manifest Schema

Each entry in `manifest.json`:

| Field | Description |
|-------|-------------|
| `index` | Sort order (monotonic integer) |
| `name` | Canonical slice ID: `<pageSlug>_p<nn>_s<start>pct_l<length>pct.jpg` |
| `page` | Human-readable page label + Notion URL |
| `site_template` | Design system identifier |
| `status` | Export lifecycle flag (currently always `imageCropAndHtml`) |
| `source_html` | S3 URL of the HTML snippet |
| `local_html` | Relative path to the downloaded HTML file |
| `crop_section` | S3 URL of the source image crop |
| `drive_id` | Placeholder for Google Drive asset IDs (currently unused) |

---

## Step 4: Run Preprocessing & Fetch Images

### 4a. Preprocess HTML slices

```bash
python3 preprocess.py
```

This generates a `preprocessed/` directory with:
- `tokens.css` — Ready-to-paste `@theme` block (hex → oklch converted)
- `components.json` — Unique structural patterns + page mapping
- `pages.json` — Page slug → ordered section list
- `image-config.json` — Deduplicated image queries from `alt` texts
- `clean-html/` — Boilerplate-stripped HTML (~50% smaller)

### 4b. (Optional) Batch-download images

If you have an Unsplash API key, batch-download all needed images:

```bash
# Preview what would be downloaded
python3 fetch_images.py --dry-run

# Download all images
python3 fetch_images.py

# Re-download everything (overwrite existing)
python3 fetch_images.py --force
```

Requires `UNSPLASH_ACCESS_KEY` in environment or `.env` file. Get a free key at https://unsplash.com/developers.

See `PIPELINE_OPTIMIZATION.md` for design rationale.

---

## Step 5: Build the Themed Site

### LLM Context Documents

Provide the building LLM with these files:

1. **`LLM_BUILD_INSTRUCTIONS.md`** — Architecture rules, translation patterns, build phases, anti-patterns, and verification commands. Primary reference doc.
2. **`IMPLeMENTATION_CHECKLIST.md`** — Fill-in progress tracker. Copy into the project root and replace `{PLACEHOLDERS}` with industry details.
3. **`manifest.json`** — The slice manifest for this project.
4. **`html/`** — The HTML slice files referenced by the manifest.
5. **`preprocessed/`** — (If Step 4 was run) Pre-extracted tokens, component clusters, and image manifest.

### LLM Invocation Prompt

```
Project: {industry}-template (Astro local-business base)
Goal: Convert the base repo into a themed site for {INDUSTRY} using the manifest slices.

Context:
- Build instructions: LLM_BUILD_INSTRUCTIONS.md (architecture rules, translation patterns, anti-patterns)
- Checklist: IMPLeMENTATION_CHECKLIST.md (phased build tracker)
- Manifest: manifest.json (slice entries with page order and local_html paths)
- Source HTML: html/*.html (sections to translate into Astro components)

Follow the phases in LLM_BUILD_INSTRUCTIONS.md:
1. Phase 1: Analyze manifest, classify sections, identify shared components (READ ONLY)
2. Phase 2: Extract colors → oklch @theme block, write site.config.ts, write content.config.ts
3. Phase 3: Source images (§3.6), then build Header, Footer, and shared section components
4. Phase 4: Create content collections and wire Astro page routes
5. Phase 5: Assemble remaining pages from manifest section order
6. Phase 6: Run all verification checks from §6

For every section, cross-reference the matching html/ file listed in the manifest.
Source industry-appropriate photos for any placehold.co placeholders.
Run the verification grep commands at the end of each phase before proceeding.
```

---

## Step 6: Verification

After the LLM build completes, run the verification commands from `LLM_BUILD_INSTRUCTIONS.md` §6 and confirm:

- [ ] `npm run build` succeeds with zero errors
- [ ] All pages from the manifest are generated
- [ ] Zero anti-patterns (legacy files, hardcoded colors, placeholder content)
- [ ] All images sourced and `ATTRIBUTION.md` updated
- [ ] No `placehold.co` URLs remain

Then proceed to deploy review (`AUDIT_v2_6_DEPLOY.md`).

---

*Operator SOP v1.2*
