# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are Martin Paška's classmates in **Chinese 1 (Čínština 1)**, Chinese Studies, Faculty of Arts, Masaryk University (FF MUNI), Brno: complete beginners in their first semester of Chinese. Martin himself is one of them.

They use it to learn and keep the course material in their heads: the characters, words, tones, grammar and sentences of each textbook lesson as the class reaches it.

## Product Purpose

Zì You Later is a study companion that follows the course textbook, *Integrated Chinese, Level 1 Part 1* (3rd edition), Intro and Lessons 1–10. It exists because Martin could not find an app that suited him.

Success means a student keeps up with the course with a few minutes of practice a day, comes to class prepared, and goes into vocabulary quizzes and chapter tests confident.

## Positioning

- **Exactly the textbook:** only the vocabulary, grammar and sentences of IC 1/1, lesson by lesson, with nothing added. Example sentences use only vocabulary introduced up to their lesson. General tools (Anki, Pleco, Duolingo) cannot claim this.
- **Everything in one place:** flashcards with audio and spaced daily review, stroke-order writing, tone training, sentence building and translation, grammar notes, and chapter-style tests.
- **Free and without ads:** a personal project, not a commercial product.

## Operating Context

All of these are real uses, so no single setting can be assumed:

- **Phone, short sessions:** a few minutes a day, on the tram or between classes.
- **Computer, longer sessions:** at a desk, including writing characters.
- **Before tests:** intense review before vocabulary quizzes and chapter tests.
- **In class:** during or right after a lesson, on the material just covered.

The course textbook is in English, so learning content (meanings, sentence translations, grammar explanations) stays in English. The interface is Czech by default, with an English switch.

## Capabilities and Constraints

- **Modes:** Flashcards, Learn, Grammar, Sentences (build, listen, translate, read), Writing (watch, trace, from memory), Match, Tone trainer, Tone twins, Test, a daily spaced review, and Progress & settings.
- **Data:** about 400 characters, 363 words and 184 example sentences from Intro and Lessons 1–10. Simplified and traditional script.
- **Stack:** one static `index.html` (inline CSS and JS) plus `strokes.json`, hosted on GitHub Pages. No build step. External: Google Fonts, hanzi-writer from jsDelivr, supabase-js from jsDelivr.
- **Accounts:** optional, via Supabase (email and password). They sync progress across devices and power a public leaderboard of nickname, avatar, known, week and streak. Without an account everything works and progress stays in the browser (localStorage).
- **Free tier:** the Supabase project pauses after about a week of inactivity, and built-in auth email is rate-limited. The app must keep working without the backend.
- **Audio:** device speech synthesis for Chinese. Some devices have no Chinese voice.
- **Languages:** the interface is translated on screen (EN source strings, Czech dictionary). Czech is the default for new visitors.

## Brand Commitments

- **Name:** *Zì You Later*.
- **Author:** Martin Paška, Chinese name **帕马庭**, shown as a red seal.
- **Status:** an unofficial project, not an official Masaryk University app.
- **Voice:** friendly, direct, informal Czech (*ty*).
- **About page:** says why the app exists (no suitable app could be found) and never mentions price.

## Evidence on Hand

- **Content:** the vocabulary index of IC 1/1 (3rd ed.), the app's own example sentences and grammar notes, and stroke data from Make Me a Hanzi (Arphic Public License).
- **Not available:** no testimonials, user counts, ratings, press or endorsements. None may be invented, and MUNI endorsement must not be implied.

## Product Principles

1. **Follow the course, not a curriculum of our own.** Content and order come from the textbook lessons the class is on.
2. **Every minute counts.** Starting a useful session on a phone takes one tap, and longer desk sessions still have depth (writing, tests).
3. **Recall over rereading.** Modes make the learner produce answers, and the daily review spaces them out.
4. **Works for everyone without an account.** Accounts add sync and the leaderboard, never access.
5. **Honest and unofficial.** No invented claims, no ads, no implied institutional backing.

## Accessibility & Inclusion

- **Standard:** target WCAG 2.2 AA.
- **Chinese text:** characters and pinyin must be marked with the right language so screen readers and fonts treat them correctly.
- **Tones:** tone colours must stay legible and are never the only signal (tone numbers and contours accompany them).
- **Input:** practice works by touch and by keyboard (shortcut keys exist), and respects reduced-motion preferences without losing feedback.
