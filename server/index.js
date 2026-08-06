import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { initializeDatabase, getAsync, allAsync, runAsync } from './db.js';
import { registerParent, loginParent, generateToken, authMiddleware, adminMiddleware, hashPassword, verifyToken } from './auth.js';
import { initializeEmail, sendBookingConfirmation, sendJobCompletionNotice, sendQuoteNotification } from './email.js';

dotenv.config();
initializeEmail();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Initialize database on startup
await initializeDatabase();

// ============ PARENT AUTH ROUTES ============

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingParent = await getAsync('SELECT id FROM parents WHERE email = ?', [email]);
    if (existingParent) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const parentId = await registerParent(name, email, password, phone, address);
    const token = generateToken(parentId, false);

    res.status(201).json({ parentId, token, name, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const parent = await loginParent(email, password);
    if (!parent) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(parent.id, false);
    res.json({ parentId: parent.id, token, name: parent.name, email: parent.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============ ADMIN AUTH ROUTE ============

app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    if (password === process.env.ADMIN_PASSWORD) {
      const token = generateToken(999, true); // Admin ID = 999
      res.json({ token, isAdmin: true });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============ SERVICES ROUTE ============

app.get('/api/services', async (req, res) => {
  try {
    const services = await allAsync('SELECT * FROM services WHERE is_active = 1');
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.get('/api/services/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await allAsync(
      `SELECT rating, comment, created_at FROM reviews
       WHERE service_id = ? ORDER BY created_at DESC`,
      [id]
    );
    const avgRating = await getAsync(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE service_id = ?`,
      [id]
    );
    res.json({ reviews, avgRating: avgRating?.avg_rating || 0, totalReviews: avgRating?.total_reviews || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// ============ PARENT BOOKING ROUTES ============

app.post('/api/jobs', authMiddleware, async (req, res) => {
  try {
    const { serviceId, customRequest } = req.body;
    const parentId = req.user.userId;

    if (!serviceId && !customRequest) {
      return res.status(400).json({ error: 'Either serviceId or customRequest required' });
    }

    const result = await runAsync(
      `INSERT INTO jobs (parent_id, service_id, custom_request, status)
       VALUES (?, ?, ?, 'pending')`,
      [parentId, serviceId || null, customRequest || null]
    );

    res.status(201).json({ jobId: result.lastID, status: 'pending' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

app.get('/api/jobs', authMiddleware, async (req, res) => {
  try {
    const parentId = req.user.userId;
    const jobs = await allAsync(
      `SELECT j.*, s.name as service_name, cm.name as crew_name
       FROM jobs j
       LEFT JOIN services s ON j.service_id = s.id
       LEFT JOIN crew_members cm ON j.crew_member_id = cm.id
       WHERE j.parent_id = ?
       ORDER BY j.created_at DESC`,
      [parentId]
    );
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get('/api/jobs/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const parentId = req.user.userId;

    const job = await getAsync(
      `SELECT j.*, s.name as service_name, cm.name as crew_name
       FROM jobs j
       LEFT JOIN services s ON j.service_id = s.id
       LEFT JOIN crew_members cm ON j.crew_member_id = cm.id
       WHERE j.id = ? AND j.parent_id = ?`,
      [id, parentId]
    );

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const review = await getAsync(
      `SELECT * FROM reviews WHERE job_id = ?`,
      [id]
    );

    res.json({ ...job, review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// ============ REVIEW ROUTES ============

app.post('/api/reviews', authMiddleware, async (req, res) => {
  try {
    const { jobId, rating, comment } = req.body;
    const parentId = req.user.userId;

    if (!jobId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid job or rating' });
    }

    // Verify job belongs to parent
    const job = await getAsync('SELECT * FROM jobs WHERE id = ? AND parent_id = ?', [jobId, parentId]);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (!job.service_id) {
      return res.status(400).json({ error: 'Cannot review custom requests' });
    }

    const result = await runAsync(
      `INSERT INTO reviews (job_id, service_id, parent_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [jobId, job.service_id, parentId, rating, comment || null]
    );

    res.status(201).json({ reviewId: result.lastID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// ============ ADMIN ROUTES ============

app.get('/api/admin/jobs', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const jobs = await allAsync(
      `SELECT j.*, p.name as parent_name, p.email as parent_email, p.phone as parent_phone,
              s.name as service_name, cm.name as crew_name
       FROM jobs j
       LEFT JOIN parents p ON j.parent_id = p.id
       LEFT JOIN services s ON j.service_id = s.id
       LEFT JOIN crew_members cm ON j.crew_member_id = cm.id
       ORDER BY j.created_at DESC`
    );
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get('/api/admin/crew', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const crew = await allAsync('SELECT * FROM crew_members ORDER BY name');

    // Get job counts for each crew member
    const crewWithStats = await Promise.all(crew.map(async (member) => {
      const stats = await getAsync(
        `SELECT COUNT(*) as completed_jobs FROM jobs WHERE crew_member_id = ? AND status = 'completed'`,
        [member.id]
      );
      return { ...member, completed_jobs: stats?.completed_jobs || 0 };
    }));

    res.json(crewWithStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch crew' });
  }
});

app.post('/api/admin/crew', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, age, skills } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name required' });
    }

    const result = await runAsync(
      `INSERT INTO crew_members (name, age, skills)
       VALUES (?, ?, ?)`,
      [name, age || null, skills || null]
    );

    res.status(201).json({ crewId: result.lastID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add crew member' });
  }
});

app.patch('/api/admin/jobs/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, crewMemberId, quotedPrice, timeWindow, jobDate, notes } = req.body;

    let query = 'UPDATE jobs SET ';
    const updates = [];
    const params = [];

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (crewMemberId !== undefined) {
      updates.push('crew_member_id = ?');
      params.push(crewMemberId);
    }
    if (quotedPrice !== undefined) {
      updates.push('quoted_price = ?');
      params.push(quotedPrice);
    }
    if (timeWindow !== undefined) {
      updates.push('time_window = ?');
      params.push(timeWindow);
    }
    if (jobDate !== undefined) {
      updates.push('job_date = ?');
      params.push(jobDate);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (status === 'completed') {
      updates.push('completed_at = CURRENT_TIMESTAMP');
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    await runAsync(query, params);

    // If status changed to "confirmed", send confirmation email
    if (status === 'confirmed') {
      const job = await getAsync(
        `SELECT j.*, p.name, p.email, s.name as service_name, cm.name as crew_name
         FROM jobs j
         LEFT JOIN parents p ON j.parent_id = p.id
         LEFT JOIN services s ON j.service_id = s.id
         LEFT JOIN crew_members cm ON j.crew_member_id = cm.id
         WHERE j.id = ?`,
        [id]
      );

      if (job) {
        await sendBookingConfirmation(
          job.email,
          job.name,
          job.id,
          job.service_name || job.custom_request,
          job.time_window,
          job.crew_name
        );
      }
    }

    // If status changed to "completed", send review request
    if (status === 'completed') {
      const job = await getAsync(
        `SELECT j.*, p.name, p.email, s.name as service_name
         FROM jobs j
         LEFT JOIN parents p ON j.parent_id = p.id
         LEFT JOIN services s ON j.service_id = s.id
         WHERE j.id = ?`,
        [id]
      );

      if (job) {
        await sendJobCompletionNotice(job.email, job.name, job.id, job.service_name);
      }
    }

    res.json({ jobId: id, updated: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

app.get('/api/admin/ledger', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ledger = await allAsync(
      `SELECT p.id, p.name, SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as earned,
              COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as jobs_completed
       FROM payments p
       GROUP BY p.crew_member_id
       ORDER BY p.name`
    );

    const detailed = await allAsync(
      `SELECT p.*, cm.name as crew_name, j.id as job_id, s.name as service_name
       FROM payments p
       LEFT JOIN crew_members cm ON p.crew_member_id = cm.id
       LEFT JOIN jobs j ON p.job_id = j.id
       LEFT JOIN services s ON j.service_id = s.id
       ORDER BY p.created_at DESC`
    );

    res.json({ summary: ledger, detailed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ledger' });
  }
});

// ============ HEALTH CHECK ============

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin password: ${process.env.ADMIN_PASSWORD}`);
});
