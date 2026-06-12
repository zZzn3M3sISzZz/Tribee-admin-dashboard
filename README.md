# Tribee Admin Dashboard (offScreen Admin Console)

Next.js admin dashboard for Tribee operations: identity verification, safety reports, and host applications.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

You need a Tribee user with the `ops_admin` role:

```sql
INSERT INTO role_bindings (user_id, role)
VALUES ('<user-uuid>', 'ops_admin')
ON CONFLICT DO NOTHING;
```

## Production hosting (Amplify + subdomain)

Repo: [github.com/zZzn3M3sISzZz/Tribee-admin-dashboard](https://github.com/zZzn3M3sISzZz/Tribee-admin-dashboard)

Same pattern as Fitastic (`admin.enshaproductions.com`). Included in the main Tribee deploy:

```bash
cd ../Tribee-cdk
export ADMIN_DASHBOARD_GITHUB_TOKEN=<github-pat-with-repo-scope>  # optional
bash scripts/deploy.sh dev
```

Or deploy the hosting stack alone:

```bash
npx cdk deploy TribeeAdminDashboardHostingStack-dev -c env=dev
```

If Git was not wired at deploy time:

1. Connect **main** in **AWS Amplify → tribee-admin-dashboard → Connect branch**
3. **Domain management** → add `offscreen.admin.enshaproductions.com`
4. **Hostinger DNS** → CNAME + ACM validation records from Amplify
5. Trigger build: `aws amplify start-job --app-id <id> --branch-name main --job-type RELEASE`

## Pages

| Route | Purpose |
|-------|---------|
| `/login` | Staff email/password login |
| `/dashboard` | Overview metrics |
| `/user-approvals` | Identity verification queue |
| `/host-applications` | Host application review |
| `/venues/new` | Onboard new partner venue |
| `/taxonomy` | Interests, social comforts & motives |
| `/reports` | Safety report triage |
| `/settings` | Account & sign out |
