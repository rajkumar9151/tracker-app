<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# TrackerApp Developer & VM Architecture Rules

This project runs on a Google Cloud Platform `e2-micro` (1 GB RAM) instance. To prevent the server from crashing or freezing, you MUST strictly follow these rules:

## 1. Memory Constraints & Build Operations (CRITICAL)
- **OOM Prevention:** You must never run `npm run build` while the live application is running in the background. The VM will exceed 1 GB RAM and freeze, requiring a hard reboot in the GCP Console.
- **Build Protocol:** Always stop PM2 before building, and use the restricted memory flag:
  ```bash
  npx pm2 stop tracker-app
  NODE_OPTIONS="--max-old-space-size=512" npm run build
  npx pm2 start tracker-app
  ```
- **Update Script:** All updates on the VM should be executed by running the `./update.sh` script, which handles this sequence safely.

## 2. Database & Backups Architecture
- **Location:** The database is a flat file at `data/db.json` (ignored in Git).
- **Daily GCS Backups:** Daily backups are uploaded to the Google Cloud Storage bucket (`GCS_BUCKET_NAME`) under `backups/db-YYYY-MM-DD-timestamp.json`.
- **Backup Execution:** Backups are run using Node 22's native env file loader:
  ```bash
  node --env-file=.env.local scripts/backup.js
  ```
- **Backup Retention:** The backup script lists files and automatically deletes older backups to retain a maximum of 30 backups in GCS.

## 3. File Attachments & Streaming
- **Storage:** Task and update attachments are saved to GCS (if `GCS_BUCKET_NAME` is configured) or `data/uploads/` (local fallback for development).
- **Security:** The GCS bucket is 100% private. All attachments are streamed securely through the Next.js backend endpoint `/api/attachments?file=<key>` or `/api/attachments?local=<key>`, keeping storage secure.
- **Compatibility:** Backward compatibility is maintained for old Base64 attachments (checking for the `data` field in database objects vs. the new streaming URLs).

## 4. App Security & Passcode
- **AI Summary Passcode:** Gemini summary requests require the passcode configured in your private environment variable `AI_SUMMARY_PASSCODE` (hint: `Civic`). This is checked securely at the server route `/api/generate-summary/route.js` by matching the user's input against the server's `.env.local` configuration.
- **Idle Timeout:** The main tracker logs users out after **1 hour** of complete inactivity.

