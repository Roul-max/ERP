# ACE-ERP Frontend

React + Vite + TypeScript frontend for the ACE-ERP (University ERP) system.

For full repo setup (backend + DB + seed), see the root README: `../README.md`.

## Local development

### Environment
- Copy `frontend/.env.example` → `frontend/.env`
- `VITE_API_URL`:
  - Leave empty in local dev to use the Vite proxy.
  - Set in production to your backend origin (e.g. `https://your-api.example.com`).

### Install & run

```bash
npm install
npm run dev
```

Dev server:
- `http://localhost:5173`
