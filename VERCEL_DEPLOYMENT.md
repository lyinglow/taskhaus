# Deploying to Vercel

This guide walks you through deploying the Chore Service Platform to Vercel with a PostgreSQL database.

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **GitHub Repository**: Push your code to GitHub (already done)
3. **PostgreSQL Database**: Free option is **Neon** (https://neon.tech) or **Vercel PostgreSQL** (if available in your region)

## Step 1: Set Up PostgreSQL Database

### Option A: Use Neon (Recommended - Free Tier)

1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy your connection string (looks like: `postgresql://user:password@host/database`)
4. Save this - you'll need it in Step 2

### Option B: Use Vercel PostgreSQL

1. In Vercel dashboard, go to **Storage** → **PostgreSQL**
2. Create a new database
3. Copy the connection string

## Step 2: Set Up Prisma Database

Run migrations locally first:

```bash
# Install dependencies
npm install

# Set up .env with your DATABASE_URL from Step 1
cp .env.example .env
# Edit .env and paste your PostgreSQL connection string

# Run migrations to create tables
npx prisma migrate deploy
```

You can also use Prisma Studio to see your database:
```bash
npx prisma studio
```

This creates all your tables (parents, crew_members, services, jobs, reviews, payments).

## Step 3: Deploy to Vercel

### Via Vercel CLI (Fastest)

```bash
npm i -g vercel
vercel
```

Follow the prompts to:
- Connect your GitHub repo
- Set deployment settings

### Via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select "Next.js" as framework
4. Click "Deploy"

## Step 4: Add Environment Variables

After deployment starts in Vercel:

1. Go to your project's **Settings** → **Environment Variables**
2. Add these variables:

```
ADMIN_PASSWORD=your-secure-password-here
JWT_SECRET=generate-random-string-here
DATABASE_URL=your-postgresql-connection-string
SMTP_FROM=noreply@choreservice.local
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-vercel-domain.vercel.app
```

Generate a random JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Run Migrations on Production

After env variables are set:

```bash
vercel env pull  # Get production env
npx prisma migrate deploy
```

Or use Vercel's Post-Deploy Script (create `.vercel/build-output.json` if needed).

## Step 6: Initialize Services in Database

The first time the app runs, it will auto-insert services. But if you need to manually add them:

```javascript
// Run this via Prisma Studio or create a script
prisma.service.createMany({
  data: [
    { name: 'Bin Cleaning', description: 'Clean and refresh bins', serviceType: 'fixed', price: 15 },
    { name: 'Edge Trimming', description: 'Trim lawn edges', serviceType: 'fixed', price: 20 },
    // ... add others
  ]
})
```

## Accessing Your App

Your app will be live at: `https://your-repo-name.vercel.app`

Default access:
- **Parent Side**: https://your-repo-name.vercel.app → Sign up / Login
- **Admin**: https://your-repo-name.vercel.app → "Admin Login" → password (your `ADMIN_PASSWORD`)

## Email Setup (Optional but Recommended)

For production email notifications:

1. Get SMTP credentials from a service like:
   - SendGrid (free tier: 100 emails/day)
   - Mailgun
   - AWS SES
   - Your web host

2. Update Vercel env variables:
```
SMTP_HOST=smtp.service.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

Dev/test emails log to console by default.

## Troubleshooting

### Database Connection Error
- Verify `DATABASE_URL` is set in Vercel env vars
- Check PostgreSQL database is active
- Run `npx prisma migrate deploy` again

### Build Fails
- Check Vercel build logs
- Ensure all env vars are set
- Run `npm install` locally and test build: `npm run build`

### Emails Not Sending
- In development, they log to console
- In production, check SMTP env vars are correct
- Test with: `curl -X POST http://localhost:3000/api/test-email`

## Database Backups (Neon)

Neon automatically backs up your database. To access:
1. Go to Neon dashboard → Your project → Backups
2. Schedule automatic backups or create manual ones

## Performance Tips

- Vercel serverless is fast for Next.js
- Database queries are cached via Prisma
- Images/assets deploy to Vercel's CDN
- Monitor performance in Vercel Analytics

## Next Steps

1. **Add Payment Processing**: Integrate Stripe or Square (currently mocked)
2. **Add File Uploads**: For job photos/proof of completion
3. **SMS Notifications**: Integrate Twilio for parent/crew texting
4. **Custom Domain**: Add your domain in Vercel Settings

## Support

- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs

## Vercel Limits (Free Tier)

- **Serverless Functions**: 100GB/month compute
- **Database Storage**: 256MB (Vercel PostgreSQL) - use Neon for larger
- **Bandwidth**: 100GB/month
- **Deployments**: Unlimited

Upgrade anytime if you exceed limits.
