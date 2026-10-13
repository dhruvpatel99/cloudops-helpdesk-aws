# CloudOps Helpdesk — Employee Portal

React + Vite + Tailwind CSS employee UI prototype using a white, navy, and blue enterprise theme.

## Run locally
Requires Node.js 20.19+ or 22.12+ recommended.

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL Vite prints, usually http://localhost:5173.

Production build:
```bash
npm run build
npm run preview
```

## API
Default API base URL: `https://j6hxz2wpt8.execute-api.ap-south-1.amazonaws.com`

Current routes used:
- `GET /tickets`
- `POST /tickets` with `{ "title": "...", "description": "..." }`

Status editing is not shown in the Employee Portal.

## Security — prototype only
Authentication is not enabled. The current backend does not enforce user ownership or admin roles, and `GET /tickets` returns the tickets exposed by the API. Therefore, this UI must not be described as securely displaying only the signed-in employee's tickets. Before real use, integrate Cognito, validate JWTs, and enforce ownership/admin permissions in API Gateway/Lambda. CORS and hidden UI controls are not authorization. Do not commit credentials or secrets.

The Admin Dashboard is planned as the next phase.