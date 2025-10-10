# IssueFlow

Find unassigned open GitHub issues without pull requests - your gateway to open-source contribution!

## Features

- **Smart Filtering**: Automatically filters issues that are:
  - ✅ Open
  - ✅ Unassigned
  - ✅ No linked pull requests

- **Multiple Authentication Options**:
  - 🔐 **GitHub OAuth** - Sign in with GitHub (Device Flow, no backend needed!)
  - 🔑 **Personal Access Token** - Manual token input
  - 🌐 **No Auth** - Use without signing in (REST API fallback)

- **Optimized Performance**: Built with 2025's best tech
  - Astro 5.x (0 KB JavaScript for static content)
  - Svelte (3KB runtime for interactive components)
  - UnoCSS (on-demand atomic CSS)
  - GitHub GraphQL API (45% faster than REST)

- **Rate Limit Friendly**:
  - 60 requests/hour without token (REST API)
  - 5000 requests/hour with GitHub OAuth or token (GraphQL API)
  - Token stored locally only (privacy-first)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:4321

### Build for Production

```bash
npm run build
```

Output in `/dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Option 1: With GitHub OAuth (Recommended) 🔐

1. Click **"Sign in with GitHub"**
2. Copy the code shown
3. Authorize the app on GitHub
4. Paste a repository URL and start searching!

**Setup**: See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for configuration instructions.

### Option 2: With Personal Access Token 🔑

1. Create a [GitHub token](https://github.com/settings/tokens/new?description=GitHub%20Issues%20Finder&scopes=public_repo) (select `public_repo` scope)
2. Paste the token in the app
3. Paste a repository URL and start searching!

### Option 3: Without Authentication 🌐

1. Just paste a repository URL and click "Find Available Issues"
2. Works immediately with 60 requests/hour limit

**Privacy Note**: All authentication is handled locally in your browser. Tokens are never sent to any server except GitHub's API.

## Deployment

### Cloudflare Pages (Recommended)

1. Push code to GitHub
2. Login to Cloudflare Dashboard
3. Pages → Create a project → Connect to Git
4. Build settings:
   - Framework: Astro
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy!

### Alternative: Vercel

```bash
npm install -g vercel
vercel
```

### Alternative: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Tech Stack

- **Framework**: Astro 5.x
- **Interactive Components**: Svelte
- **Styling**: UnoCSS
- **API Client**: graphql-request
- **Build Tool**: Vite (via Astro)
- **Language**: TypeScript

## Performance

- Lighthouse Score: 100/100 (target)
- First Contentful Paint: < 0.8s
- Largest Contentful Paint: < 1.2s
- Total Blocking Time: < 100ms

## Contributing

Pull requests welcome! This project itself uses the issues it helps you find.

## License

MIT

## Author

Built with research-backed 2025 tech stack optimization.
