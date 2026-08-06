import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'chores.db');
const db = new sqlite3.Database(dbPath);

export function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Parents table
      db.run(`
        CREATE TABLE IF NOT EXISTS parents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          password_hash TEXT NOT NULL,
          address TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crew members table
      db.run(`
        CREATE TABLE IF NOT EXISTS crew_members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          age INTEGER,
          skills TEXT,
          is_available BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Services table
      db.run(`
        CREATE TABLE IF NOT EXISTS services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          service_type TEXT DEFAULT 'fixed',
          price DECIMAL(10,2),
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Jobs table
      db.run(`
        CREATE TABLE IF NOT EXISTS jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          parent_id INTEGER NOT NULL,
          service_id INTEGER,
          crew_member_id INTEGER,
          custom_request TEXT,
          status TEXT DEFAULT 'pending',
          quoted_price DECIMAL(10,2),
          final_price DECIMAL(10,2),
          notes TEXT,
          time_window TEXT,
          job_date DATE,
          completed_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES parents(id),
          FOREIGN KEY (service_id) REFERENCES services(id),
          FOREIGN KEY (crew_member_id) REFERENCES crew_members(id)
        )
      `);

      // Reviews table
      db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_id INTEGER NOT NULL UNIQUE,
          service_id INTEGER NOT NULL,
          parent_id INTEGER NOT NULL,
          rating INTEGER CHECK(rating >= 1 AND rating <= 5),
          comment TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (job_id) REFERENCES jobs(id),
          FOREIGN KEY (service_id) REFERENCES services(id),
          FOREIGN KEY (parent_id) REFERENCES parents(id)
        )
      `);

      // Payments/Ledger table
      db.run(`
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_id INTEGER NOT NULL,
          crew_member_id INTEGER NOT NULL,
          parent_id INTEGER NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          status TEXT DEFAULT 'pending',
          paid_date DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (job_id) REFERENCES jobs(id),
          FOREIGN KEY (crew_member_id) REFERENCES crew_members(id),
          FOREIGN KEY (parent_id) REFERENCES parents(id)
        )
      `, (err) => {
        if (err) reject(err);
        else {
          // Insert default services
          insertDefaultServices(() => {
            resolve();
          });
        }
      });
    });
  });
}

function insertDefaultServices(callback) {
  const services = [
    { name: 'Bin Cleaning', description: 'Clean and refresh bins', type: 'fixed', price: 15 },
    { name: 'Edge Trimming', description: 'Trim lawn edges and borders', type: 'fixed', price: 20 },
    { name: 'Weed Removal', description: 'Remove weeds from garden', type: 'fixed', price: 25 },
    { name: 'Grass Cutting', description: 'Mow and tidy lawn', type: 'fixed', price: 30 },
    { name: 'Locker Delivery Pickup', description: 'Pickup/delivery service', type: 'fixed', price: 10 },
    { name: 'Loco Pickup', description: 'Local pickup service', type: 'fixed', price: 10 },
    { name: 'Shed Painting', description: 'Paint shed exterior', type: 'quote', price: null },
    { name: 'Logs to Logstore', description: 'Transport logs to storage', type: 'quote', price: null },
    { name: 'Mulch Installation', description: 'Install mulch in garden beds', type: 'quote', price: null },
    { name: 'Custom Request', description: 'Other service - we will quote', type: 'quote', price: null }
  ];

  let inserted = 0;
  services.forEach(service => {
    db.run(
      `INSERT OR IGNORE INTO services (name, description, service_type, price, is_active)
       SELECT ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = ?)`,
      [service.name, service.description, service.type, service.price, 1, service.name],
      () => {
        inserted++;
        if (inserted === services.length) callback();
      }
    );
  });
}

export function getDb() {
  return db;
}

export function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
