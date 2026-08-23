# Root Orchestration Guide

This document guides AI agents on how the root workspace of **Liverpool Discos** is structured, built, and orchestrated.

---

## 📂 Directory Layout

```
.
├── client/                 # React + Tailwind v4 frontend
│   ├── src/
│   │   ├── main.tsx        # React entrypoint
│   │   ├── App.tsx         # Main application container
│   │   └── index.css       # Tailwind directives
│   ├── vite.config.ts
│   └── package.json
├── server/                 # Express + TypeScript backend
│   ├── src/
│   │   └── index.ts        # Server entrypoint with express & dotenv
│   ├── tsconfig.json
│   └── package.json
├── docs/                   # Documentation and specifications
│   ├── requirements.md     # System requirements (Portuguese UI, English Code)
│   └── root-guide.md       # Root orchestration guide
├── package.json            # Root orchestration script
├── package-lock.json
└── .gitignore              # Monorepo wide exclusions
```

---

## 🛠️ Build & Development Commands

The workspace uses `concurrently` to orchestrate both the frontend and backend in development.

*   **Development**: Starts both client and server dev servers concurrently.
    ```bash
    npm run dev
    ```
*   **Production Build**: Compiles both projects.
    ```bash
    # Build client
    npm run build --prefix client
    
    # Build server
    npm run build --prefix server
    ```

---

## 🤝 Monorepo Git Workflow

*   All changes must be committed in the main repository: [liverpool](file:///home/diogo/projects/liverpool).
*   Never initialize nested `.git` folders in `client/` or `server/`.
*   Ensure environment variables (`server/.env`) are kept out of version control (handled by root [.gitignore](file:///home/diogo/projects/liverpool/.gitignore)).
