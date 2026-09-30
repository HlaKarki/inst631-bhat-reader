# Bhat 2026 annotated reader

> [!NOTE]
> This came about in collaboration with Claude (Claude Code). I led and guided the whole thing (what to build, how it should look and feel, what felt off), and most of the coding was done by Claude. The full transcript is at `claude-code-transcript.txt`.

This is my CHI Mission Part 3 for INST631. Instead of posting another annotated PDF, I wanted my notes on the paper to be something you can actually click through. The paper is Bhat, Shi, Song, Yoo and Saha (CHI '26), "In my defense, only three hours on Instagram": Designing Toward Digital Self-Awareness and Wellbeing. The paper is licensed under CC BY 4.0, which is why its pages can be shown here.

Every highlight on the page is one of my notes (51 of them), colored by what kind of note it is: central idea, research questions, definitions, prior work, what they did, results and conclusions, real-world links, and my own questions. Click a highlight and the note opens right next to the passage (the rest of the page blurs a bit so you can focus on the part I'm talking about).

## What it does

- Easy controls with the arrow keys. Left and right step between notes.
- Screen reader friendly labels, so every highlight reads out which note it is and what category it's in.
- Mobile friendly view.
- Contents button for overall navigation. It's in the top right and lists every section of the paper with my notes under it, and you can hide categories you don't care about.

## Running it

It uses bun, Vite, React and Tailwind.

```sh
bun install
bun run dev
```

`bun run build` makes the static site in `dist/`. The note data and page images come from `tools/build_part3.py` one folder up (it reads the paper PDF plus my notes in `bhat-part3-ledger.md`, and writes the notes, the highlight positions, the table of contents and the page images), and `bun run sync` copies all of that into the app.
