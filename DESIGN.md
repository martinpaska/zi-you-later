---
name: Zì You Later
description: A study companion for Integrated Chinese 1/1, made like a practice notebook with a red seal.
colors:
  seal-red: "#d72323"
  seal-red-deep: "#b51c1c"
  seal-red-soft: "#f7d3d3"
  grid-pink: "#f0b5b5"
  ink-black: "#000000"
  charcoal: "#3e3636"
  blush: "#f5eded"
  paper: "#f8f8f8"
  card-white: "#ffffff"
  sunk-grey: "#efecec"
  hairline: "#e4dede"
  know-green: "#2f6b3a"
  know-green-soft: "#e1ead5"
  miss-red: "#b3261e"
  miss-red-soft: "#f7d6d3"
  star-gold: "#a87400"
  tone-1: "#0a68ad"
  tone-2: "#946000"
  tone-3: "#1c2a6b"
  tone-4: "#7a4a1c"
  tone-neutral: "#6f7680"
  night-bg: "#141111"
  night-surface: "#1f1a1a"
  night-sunk: "#2b2424"
  night-hairline: "#3b3232"
  night-red: "#dd2c2c"
  night-red-text: "#ff7b7b"
typography:
  display:
    fontFamily: "Outfit, ZiYou Kai, Source Sans 3, system-ui, sans-serif"
    fontSize: "clamp(1.7rem, 6vw, 2.2rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Outfit, ZiYou Kai, Source Sans 3, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "Outfit, ZiYou Kai, Source Sans 3, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 600
    lineHeight: 1.15
  body:
    fontFamily: "ZiYou Kai, Source Sans 3, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ZiYou Kai, Source Sans 3, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    letterSpacing: "0.06em"
  hanzi:
    fontFamily: "ZiYou Kai, Noto Serif SC, Noto Serif TC, serif"
    fontWeight: 500
  seal:
    fontFamily: "Ma Shan Zheng, Noto Serif SC, KaiTi, serif"
rounded:
  xs: "4px"
  sm: "9px"
  md: "12px"
  lg: "16px"
  xl: "22px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "22px"
components:
  button-primary:
    backgroundColor: "{colors.seal-red}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.md}"
    padding: "11px 16px"
  button-ghost:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.md}"
    padding: "11px 16px"
  button-know:
    backgroundColor: "{colors.know-green}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.md}"
  button-still-learning:
    backgroundColor: "{colors.miss-red}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.md}"
  cta-today:
    backgroundColor: "{colors.seal-red}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
  card:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.xl}"
    padding: "22px 18px"
  segmented:
    backgroundColor: "{colors.sunk-grey}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.md}"
    padding: "3px"
  chip-tag:
    backgroundColor: "{colors.sunk-grey}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  hero-panel:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.blush}"
    rounded: "{rounded.lg}"
---

# Design System: Zì You Later

## Overview

**Creative North Star: "The Practice Notebook with a Seal"**

Every screen is a page from a Chinese practice notebook: white paper cards on a pale paper desk, the 米字格 practice grid behind each character, and one red seal that signs the work. Red is the author's seal 帕马庭 made into a colour. It marks what you do next, never decoration for its own sake. Black is ink, charcoal is the pencil, blush is the pale paper of the panels.

The mood is **friendly and focused**. Small playful touches (mahjong 你好 tiles, the 今天 tear-off calendar, illustrated mode tiles, a seal on the landing) live on the home and setup screens. Inside a practice session the page goes quiet: one card, one question, two answers. Everything a session needs fits on one phone screen, nothing jumps when feedback appears, and a session is short (15 items) with a clear end.

Chinese is always written, never typeset: every character is drawn with **ZiYou Kai**, a font built from the same stroke data as the stroke-order animations, so a character looks the same on a flashcard, in a sentence and under your finger in Writing.

**Key Characteristics:**
- Paper cards on a pale desk, with a soft stack of cards behind the flashcard.
- One red: action and identity, used sparingly; green/red only for Know / Still learning.
- Handwritten Chinese everywhere (ZiYou Kai); Latin text in Outfit (headings) and Source Sans 3 (body).
- Tone colours are a system, always paired with tone marks and contour glyphs.
- One phone screen per practice step; feedback swaps in place.
- Czech interface, English learning content, Chinese marked `lang="zh-Hans"`.

## Colors

A three-colour notebook palette (ink black, charcoal, seal red) on paper neutrals, with a separate, contrast-checked tone palette.

### Primary
- **Seal Red** (#d72323): primary buttons, the Today's review CTA, the home header bar, the seal, selected-choice outline and check badge, the red part of progress bars. Text-red on light surfaces uses **Seal Red Deep** (#b51c1c) for links and eyebrows.
- **Seal Red Soft** (#f7d3d3) and **Grid Pink** (#f0b5b5): selection halos and the 米字格 guide lines.

### Neutral
- **Ink Black** (#000000): body text and Chinese characters.
- **Charcoal** (#3e3636): secondary text, the dark Today's review panel, inactive segmented buttons.
- **Blush** (#f5eded): text on the charcoal panel; the palest paper.
- **Paper** (#f8f8f8): page background. **Card White** (#ffffff): cards and buttons. **Sunk Grey** (#efecec): tags, segmented-control trays, inputs. **Hairline** (#e4dede): borders and the stroke-tracing outline.

### Feedback
- **Know Green** (#2f6b3a) on **#e1ead5**, **Miss Red** (#b3261e) on **#f7d6d3**: answer feedback, the Know / Still learning buttons, the green and red parts of the split progress bar. **Star Gold** (#a87400) for the starred state.

### Tones (colour-blind safe default)
- Tone 1 **#0a68ad**, tone 2 **#946000**, tone 3 **#1c2a6b**, tone 4 **#7a4a1c**, neutral **#6f7680**. A "Classic" set (red, orange, green, blue) and "Off" are user options.

### Dark mode
The same notebook at night: **#141111** desk, **#1f1a1a** cards, **#2b2424** sunk, **#3b3232** hairline, blush text, a slightly brighter **#dd2c2c** red for fills and **#ff7b7b** for red text. Tone colours are lifted (#5cb0f0, #e5a63a, #a7b4ff, #dba477). Know / Still learning stay solid #2f6b3a / #b3261e with white text.

### Named Rules
**The One Seal Rule.** Seal Red marks the single next action on a screen (or identity: header, seal). Skip, secondary and alternative actions are ghost buttons. A selected option is outlined and checked, never filled red.
**The Never-Only-Colour Rule.** Tone colour is always accompanied by the tone mark and the contour glyph; Know/Still learning always carry ✓ / ✗ and a word.

## Typography

**Display Font:** Outfit (with Source Sans 3, system-ui)
**Body Font:** Source Sans 3 (with Segoe UI, system-ui)
**Chinese:** ZiYou Kai, the app's own stroke-data font (with Noto Serif SC / TC). The seal uses Ma Shan Zheng.

**Character:** a geometric, friendly display face for headings and numbers, a plain humanist body, and hand-written Chinese that matches what the student writes.

### Hierarchy
- **Display** (700, clamp(1.7rem, 6vw, 2.2rem), 1.15, -0.01em): page titles, the landing headline.
- **Headline** (700, 1.25rem, 1.15): section headings (Today's review, What do you want to do?).
- **Title** (600, 1.05rem): card and grammar-point titles.
- **Body** (400, 1rem, 1.5): explanations and hints; hints .9rem in Charcoal.
- **Label** (700, .8rem, uppercase, letter-spaced): eyebrows and group labels ("NAUČ SE NĚCO NOVÉHO"). Never stacked above a page heading.
- **Hanzi**: sized per context (flashcard character up to 120px cells, chips 1.25–2rem), weight 500.

### Named Rules
**The Written-Not-Typeset Rule.** All Chinese uses ZiYou Kai so every character matches its stroke order; don't introduce a second Chinese face except for the seal.

## Layout

One centred column like a phone app (max-width 680px, 16px side padding with safe-area insets). Home stacks: sticky red header bar → Today's review panel → mode groups (Learn something new / Practise) in a 2-column tile grid. A practice view replaces the home view: back button + split progress bar + tally on top, then one card, then answer buttons. Practice screens fit one phone screen (the flashcard height is `clamp(300px, 100svh − 326px, 480px)` and locked for the deck). Breakpoints: 640px (phone vs wider: phone hides helper hints, wider shows more), 480px and 420px for small phones. Rhythm: 6 / 8 / 12 / 16 / 22px; sections 22px apart, practice screens 12px.

## Elevation & Depth

Layered, soft and ambient: paper resting on a desk. Cards and tiles carry a low warm shadow; hover lifts them slightly. The flashcard shows a stack of two cards behind it. Dark mode deepens the shadows instead of adding glow.

### Shadow Vocabulary
- **Rest** (`--sh1: 0 1px 2px rgb(62 54 54/.06), 0 4px 14px -4px rgb(62 54 54/.12)`): cards, tiles, stats.
- **Lifted** (`--sh2: 0 2px 4px rgb(62 54 54/.06), 0 16px 32px -10px rgb(62 54 54/.22)`): hover on tiles and choices.
- **Card stack** (`var(--sh1), 7px 9px 0 -3px var(--surface), 7px 9px 0 -2px rgb(0 0 0/.07), 14px 18px 0 -6px var(--surface), 14px 18px 0 -5px rgb(0 0 0/.06)`): the flashcard only.
- **Primary button** (`0 6px 16px -6px rgb(215 35 35/.55)`): a soft red drop under filled red buttons in light mode.

## Shapes

Soft rectangles, never sharp and never blobs: 22px flashcards and practice cards, 16px mode tiles and panels, 12px buttons and segmented trays, 9–10px inner segments and inputs, pill for tags, the streak and the header buttons. The seal is a slightly rotated 5px-radius rectangle. Practice grids are dashed 米字格 lines inside a 12px rounded cell.

## Components

### Buttons
- **Shape:** 12px radius, 11px × 16px padding, 700 weight, min height 44px on touch.
- **Primary:** Seal Red with white text and a soft red drop shadow; one per screen.
- **Ghost:** white (dark: night surface) with ink text and the rest shadow; for skip, back, shuffle, start over.
- **Know / Still learning:** solid green / red pair with ✓ / ✗.
- **Hover / Focus:** lift by 1–2px, focus ring 2px Seal Red with offset; press scales to .97.

### Segmented controls
- Sunk-grey tray (12px radius, 3px padding) with white pressed segment; used for card direction (中 → EN / EN → 中 / Mix), round length, level, filters.

### Choice tiles and lesson tiles
- White, 16px radius. Selected: Seal Red outline, a red ✓ badge in the corner, faint pink fill (dark: #2c1a1a). Lesson tiles show "Lekce N", the English title and the Chinese title (问好, 家庭 …); selected lesson tiles invert to ink.

### Cards
- White, 22px radius, centred content. The flashcard: front = the prompt (handwritten character or English) and a "Tap to flip" hint that disappears after five flips; back = the character in 米字格 cells, pinyin, part of speech, meaning and a round play button.

### Split progress bar and tally
- Signature: a 9px bar split red (mistakes) / green (correct) / grey (to go), with a legend "● N Chyby · N Zbývá · N Správně ●" underneath. Used in every practice mode with right/wrong answers.

### Today's review panel
- Charcoal panel with blush text, three stats (the last links to Progress) and a full-width Seal Red CTA; on first run the stats are replaced by one sentence describing the first session.

### Inputs
- Sunk-grey fill, 2px hairline border, 10px radius, ≥16px text; green / red border on right / wrong.

## Do's and Don'ts

### Do:
- **Do** keep each practice step on one phone screen and swap feedback in place (Writing, Flashcards) instead of inserting boxes that push buttons down.
- **Do** keep sessions short: 15 items per round with an end screen and "Next round".
- **Do** use ZiYou Kai for every Chinese character and mark Chinese with `lang="zh-Hans"`.
- **Do** pair tone colour with tone marks and contour glyphs.
- **Do** write the interface in friendly Czech (*ty*) and keep learning content in English.
- **Do** check both light and dark mode; red text on dark uses #ff7b7b.

### Don't:
- **Don't** fill a selected option with red or make a skip action the red primary.
- **Don't** add a kicker/eyebrow above a page heading.
- **Don't** add emoji as icons inside the practice UI; use drawn SVG.
- **Don't** imply MUNI endorsement, invent testimonials or mention price.
- **Don't** introduce another Chinese typeface or a stock-photo hero; illustrations are flat, inked, red/black/cream.
