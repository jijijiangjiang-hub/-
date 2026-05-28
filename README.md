# Bobby's World

An interactive personal website built with React, TypeScript, Vite, GSAP, Framer Motion, and Three.js.

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

## Deployment

This project is configured for GitHub Pages through `.github/workflows/deploy.yml`.

After pushing the repository to GitHub:

1. Open the repository settings.
2. Go to `Pages`.
3. Set the source to `GitHub Actions`.
4. Push to the `main` branch.

GitHub Actions will build the site and publish it to a public `https://<username>.github.io/<repo>/` URL.
