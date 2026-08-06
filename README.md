# Chore Service Platform

A mobile-first web platform for managing neighborhood chore services run by kids aged 12+.

## Features

### Parent Side
- Browse available chores (fixed-price and quote-based)
- Submit chore requests with optional notes
- Track job status (pending → confirmed → completed)
- Leave 1-5 star reviews with comments after job completion
- Email confirmations for bookings and completion notifications

### Admin Side
- Review and manage pending job requests
- Assign crew members and set time windows
- Track job lifecycle and mark jobs as complete
- Manage crew member profiles and availability
- View payment ledger and crew earnings

### Services
- Bin Cleaning ($15)
- Edge Trimming ($20)
- Weed Removal ($25)
- Grass Cutting ($30)
- Locker Delivery Pickup ($10)
- Loco Pickup ($10)
- Shed Painting (quote)
- Logs to Logstore (quote)
- Mulch Installation (quote)
- Custom Requests (quote)

## Setup

### Prerequisites
- Node.js 16+
- npm

### Installation

1. Clone the repository and navigate to it
2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and set:
   - `ADMIN_PASSWORD` - Your admin login password
   - `JWT_SECRET` - A random secret key for auth tokens
   - `SMTP_FROM` - Email address for sending confirmations

4. Install dependencies:
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

### Running

**Development (both server and client):**
```bash
npm run dev
```

This starts:
- Server on http://localhost:3001
- Client on http://localhost:3000

**Production:**
```bash
npm run build
npm start
```

## Usage

### Parent Workflow
1. Sign up or login with email/password
2. Browse available chores from the menu
3. Select a service and submit a request
4. Receive email confirmation when admin assigns a crew member
5. Check job history to track status
6. After completion, receive email with review link
7. Leave a review (1-5 stars + optional comment)

### Admin Workflow
1. Login with admin password
2. Review pending jobs in the dashboard
3. Click "Edit" on a job to:
   - Assign a crew member
   - Set time window (e.g., "Saturday 10am-12pm")
   - Set a quote price (for quote-based services)
   - Add notes
4. Click "Confirm & Notify" to send confirmation email to parent
5. When job is done, mark it "Done" to trigger review request
6. Manage crew members in the Crew tab
7. View earnings in the Ledger tab

## Database

The app uses SQLite for simplicity. Database file is at `data/chores.db`.

Tables:
- `parents` - Parent accounts
- `crew_members` - Crew member profiles
- `services` - Available services
- `jobs` - Job requests and assignments
- `reviews` - Parent reviews
- `payments` - Payment ledger tracking crew earnings

## Email

For development, emails are logged to console (using localhost:1025).

For production, configure SMTP:
```env
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
SMTP_FROM=noreply@yourservice.com
```

## Security Notes

- Admin password is set via environment variable
- Parent accounts use bcrypt password hashing
- JWT tokens expire after 7 days
- All job operations are checked for parent/admin authorization
- Consider HTTPS in production

## Next Steps

- Integrate with real payment processing (Stripe, Square)
- Add WhatsApp integration for quick admin communication
- Implement crew member app for job tracking
- Add image upload for service completion
- Create automated payment processing to crew members
- Add availability calendar for crew scheduling
