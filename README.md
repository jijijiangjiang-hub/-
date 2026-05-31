# Bobby's World

An interactive personal website built with React, TypeScript, Vite, GSAP, Framer Motion, and Three.js.

Public site:

```text
https://jijijiangjiang-hub.github.io/-/
```

## Current Experience

- The intro uses `public/assets/intro-video.mp4`, `entry-title.svg`, and `enter-memory.png`.
- The enter flow transitions through the eye/vortex animation before revealing the main room.
- The main room is based on `public/assets/main-bg.png` and four aligned frame overlays:
  - `main-frame-study.png`
  - `main-frame-career.png`
  - `main-frame-life.png`
  - `main-frame-social.png`
- The central character uses separate `torso-base.png`, `hand-left.png`, and `hand-right.png` assets. The arm on the cursor side rotates toward the pointer.
- The study detail page is the first detailed page. It uses `parchment-paper.png` and `quill-pen.png`, with per-character writing animation.
- Career, life, and social detail pages are still placeholders.

## Development

```bash
npm install
npm run dev
```

Local preview runs at:

```text
http://127.0.0.1:5173/
```

## Build

```bash
npm run build
```

The production output is generated in `dist/`.

Useful checks before publishing:

```bash
npm run lint
npm run build
```

## Deployment

This project is configured for GitHub Pages through `.github/workflows/deploy.yml`.

After pushing the repository to GitHub:

1. Open the repository settings.
2. Go to `Pages`.
3. Set the source to `GitHub Actions`.
4. Push to the `main` branch.

GitHub Actions will build the site and publish it to a public `https://<username>.github.io/<repo>/` URL.

The repository currently uses a publish Git directory at `.git-publish`:

```bash
git --git-dir=.git-publish --work-tree=. status --short
git --git-dir=.git-publish --work-tree=. add <files>
git --git-dir=.git-publish --work-tree=. commit -m "<message>"
git --git-dir=.git-publish --work-tree=. push origin main
```

If direct `git push` to `github.com:443` fails while `api.github.com` still works, publish can be done through the GitHub API with the same file tree, then align `.git-publish` to the remote commit before the next release.
