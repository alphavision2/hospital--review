# Hospital Review

MERN application with a React/Vite frontend and an Express/MongoDB API.

## Deploy to Vercel from GitHub

The workflow in `.github/workflows/deploy.yml` deploys the production app whenever
changes are pushed to `main`. It can also be run manually from the repository's
**Actions** tab.

1. Import this GitHub repository into Vercel and create a project. Keep the project
   root at the repository root so Vercel can use `vercel.json`.
2. Add these GitHub repository secrets under **Settings → Secrets and variables
   → Actions**:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
3. Add these environment variables to the Vercel project for the Production
   environment:
   - `MONGO_URI` — connection string for a MongoDB instance accessible from Vercel
   - `JWT_SECRET` — a long, random secret used to sign authentication tokens
   - `EMAIL_USER` and `EMAIL_PASS` — email provider credentials for verification
   - `HOSPITAL_DATA_API_URL` and `HOSPITAL_DATA_API_KEY` — optional, for hospital
     data imports
4. Push a commit to `main`, or run **Deploy to Vercel** manually in GitHub Actions.

The frontend calls the same-origin `/api` routes in production. For local
development, the frontend uses `http://localhost:5000/api` by default. Set
`VITE_API_BASE_URL` only if the API is hosted at a different URL.

For local development, start the backend with `npm start` from `backend/` and
the frontend with `npm run dev` from `frontend/`.
