# Chore Service Platform

A **mobile-first web platform** for managing neighborhood chore services run by kids aged 12+. Built with **Next.js + PostgreSQL** for easy deployment to Vercel with a public URL.

## ✨ Key Features

### Parent Side
- ✅ Browse available chores (fixed-price and quote-based)
- ✅ Submit chore requests with optional notes
- ✅ Track job status: pending → confirmed → completed
- ✅ Leave 1-5 star reviews with comments after job completion
- ✅ Email confirmations for bookings and completion notifications

### Admin Side
- ✅ Review and manage pending job requests
- ✅ Assign crew members and set time windows
- ✅ Mark jobs complete to trigger review requests
- ✅ Manage crew member profiles
- ✅ View payment ledger and crew earnings

### Services Available
- **Fixed Price**: Bin Cleaning ($15), Edge Trimming ($20), Weed Removal ($25), Grass Cutting ($30), Locker/Loco Pickup ($10 each)
- **Quote-Based**: Shed Painting, Logs to Logstore, Mulch Installation, Custom Requests

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 16+
- PostgreSQL (local) OR Neon account (free)

### Setup

```bash
# 1. Clone and setup env
cp .env.example .env

# 2. Edit .env and add:
# DATABASE_URL=postgresql://user:password@localhost:5432/choreservice
# ADMIN_PASSWORD=your-secure-password

# 3. Install dependencies
npm install

# 4. Setup database
npx prisma migrate deploy

# 5. Run locally
npm run dev
```

Visit:
- **Parent**: http://localhost:3000 → Sign up/Login
- **Admin**: http://localhost:3000 → Admin Login

## 📱 Deploy to Vercel (Get Public URL)

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for step-by-step instructions.

**TL;DR:**
1. Push repo to GitHub
2. Connect to Vercel (automatic from GitHub)
3. Add PostgreSQL (Neon is free and recommended)
4. Set environment variables
5. Done! Your app is live at `https://your-app.vercel.app`

## 📊 Database Schema

Uses **PostgreSQL** with **Prisma ORM**:

- **parents** - Parent accounts with emails
- **crew_members** - Kids with skills and age
- **services** - Available chores (fixed or quote)
- **jobs** - Job requests, assignments, status
- **reviews** - Parent ratings (1-5 stars) aggregated by service
- **payments** - Earnings ledger for crew

## 🔐 Admin Workflow

1. **Login**: Use your admin password
2. **Review Jobs**: See pending requests
3. **Assign Crew**:
   - Select crew member
   - Set time window (e.g., "Sat 10am-12pm")
   - Add quote price if quote-based job
4. **Confirm**: Click "Confirm & Notify" → parent gets email
5. **Mark Done**: Click "Mark Done" → parent gets review request email
6. **Track Earnings**: View crew member earnings in Ledger tab

## 💬 Parent Workflow

1. **Sign Up** with email/password
2. **Browse** available chores
3. **Submit Request** → get confirmation email with crew member name
4. **Wait** for job completion
5. **Leave Review** (1-5 stars + comment) → helps other parents

## 📧 Email Notifications

**Development**: Logs to console (no email sent)

**Production**: Configure SMTP in `.env`:
```env
SMTP_HOST=smtp.service.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

Free options: SendGrid, Mailgun, Brevo (formerly Sendinblue)

## 🔒 Security

- ✅ Admin password via env var (never in code)
- ✅ Parent passwords: bcrypt hashed
- ✅ JWT tokens: expire after 7 days
- ✅ Authorization checks on all operations
- ⚠️ Use HTTPS in production

## 🚧 Tech Stack

- **Frontend**: React + Next.js App Router + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + bcrypt
- **Email**: Nodemailer
- **Hosting**: Vercel (automatic)

## 📖 Local Development

```bash
# Start dev server
npm run dev

# Prisma Studio (view/edit database)
npx prisma studio

# Run migrations
npx prisma migrate dev --name add_feature

# Build for production
npm run build
npm start
```

## 🌐 Vercel Deployment Checklist

- [ ] PostgreSQL database set up (Neon recommended)
- [ ] `.env.example` copied to `.env` locally
- [ ] Database migrations run locally: `npx prisma migrate deploy`
- [ ] Pushed to GitHub
- [ ] Connected to Vercel
- [ ] Environment variables added in Vercel dashboard
- [ ] Production migrations run: `vercel env pull && npx prisma migrate deploy`
- [ ] Visit your live URL and test login

See **VERCEL_DEPLOYMENT.md** for detailed steps.

## 🔄 Environment Variables

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host/db

# Auth
ADMIN_PASSWORD=your-secure-password-here
JWT_SECRET=random-string-for-signing-tokens

# Email
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=noreply@choreservice.local
SMTP_USER=
SMTP_PASS=

# Deployment
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000  # Change to your Vercel URL in production
```

## 📈 Next Steps

- [ ] **Payments**: Integrate Stripe or Square test mode
- [ ] **Media**: Add photo uploads for job completion proof
- [ ] **SMS**: Twilio for parent/crew text notifications
- [ ] **Custom Domain**: Point your domain to Vercel
- [ ] **Analytics**: Enable Vercel Analytics to monitor usage
- [ ] **WhatsApp Integration**: Quick messages to parents/crew

## 🤝 Contributing

All code follows the structure:
- `/app` - Next.js pages and API routes
- `/components` - React components
- `/lib` - Utilities (auth, email, database)
- `/prisma` - Database schema

## 📞 Support

- **Vercel**: https://vercel.com/docs
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **PostgreSQL**: https://www.postgresql.org/docs
