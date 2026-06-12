# Project Instructions

## Scope

This is Bobby's interactive personal website. Keep edits visually conservative and aligned with the existing Schiele/oil-painting direction unless the user asks for a new style.

## Stack

- React + TypeScript + Vite.
- Animation uses Framer Motion and GSAP.
- Public image and video assets live in `public/assets/`.
- Production builds are emitted to `dist/`.

## Commands

```bash
npm run dev
npm run lint
npm run build
```

Local preview normally runs at:

```text
http://127.0.0.1:5173/
```

## Current App Structure

- `src/components/LoadingPage.tsx`: intro video/title/enter button.
- `src/components/EyeTransition.tsx`: eye and vortex transition from intro to main room.
- `src/components/MainInterface.tsx`: main room background, four frame hotspots, and detail routing.
- `src/components/MainFrame.tsx`: clickable frame overlay and launch animation.
- `src/components/MainCharacter.tsx`: canvas-rendered torso/arm pointer behavior with generated back and shoulder socket cover assets.
- `src/components/StudyDetailPage.tsx`: shared parchment and quill detail page used by all four frame sections.
- `src/components/CustomCursor.tsx`: oil-brush cursor.

The main background source size is `1796x876`. Frame overlay alignment depends on the `FRAME_ITEMS.frameBounds` values in `MainInterface.tsx`; change those carefully and verify visually.

## Assets

Use the processed web assets in `public/assets/` from code. Raw source folders with Chinese names are local/import artifacts and should not be committed unless the user explicitly asks:

- `图片素材库/`
- `学业和履历信息/`
- `日常生活/`
- `action-composites/`

The current detail page assets are:

- `public/assets/parchment-paper.png`
- `public/assets/quill-pen.png`

The current character cover assets are:

- `public/assets/character-back-extended.png`
- `public/assets/character-left-shoulder-wedge.png`
- `public/assets/character-right-shoulder-wedge.png`

The current life gallery assets are:

- `public/assets/life-fishing-catch.jpg`
- `public/assets/life-riverside-dog.jpg`
- `public/assets/life-dog-closeup.jpg`
- `public/assets/life-fishing-portrait.jpg`
- `public/assets/life-boat-fishing.jpg`

## Git And Publishing

The publish repository is managed through `.git-publish`:

```bash
git --git-dir=.git-publish --work-tree=. status --short
git --git-dir=.git-publish --work-tree=. add <files>
git --git-dir=.git-publish --work-tree=. commit -m "<message>"
git --git-dir=.git-publish --work-tree=. push origin main
```

Remote:

```text
https://github.com/jijijiangjiang-hub/-.git
```

Public site:

```text
https://jijijiangjiang-hub.github.io/-/
```

There may be local-only or user-created changes in the workspace. Before staging, always inspect `git --git-dir=.git-publish --work-tree=. status --short` and stage only the files relevant to the current request.

## Known Handoff Notes

- As of 2026-06-01, the last deployed content is `9dec14c Use parchment and quill assets`.
- A prior direct `git push` to `github.com:443` timed out, while `api.github.com` worked. If that recurs, use the GitHub API publish fallback and then align `.git-publish` to the remote commit.
- `.github/workflows/deploy.yml` may show a newline-only local diff. Do not include it in unrelated commits.
- As of 2026-06-08 local workspace work, all four detail pages use the parchment-style `StudyDetailPage` and contain filled content: study, career, life, and social/projects. This local content has not necessarily been deployed.
- `MainCharacter` is now a canvas rig with a wider transparent work area, full-arm rotation toward the cursor, and generated back/shoulder cover layers to reduce shoulder seams during pointer motion.
- On this workstation, `npm`/`npx` may resolve to incomplete wrappers under `E:\姜极宸工作\coding` and fail with a missing `node_modules\npm\bin\npm-prefix.js`. Repair Node/npm before relying on `npm run ...`; local Vite can be invoked directly with `node node_modules\vite\bin\vite.js ...` as a temporary workaround.
