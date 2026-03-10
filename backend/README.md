# Backend - Laundry API

Backend API untuk Website Laundry menggunakan Node.js + Express + PostgreSQL.

## Prerequisites

- Node.js v18+
- PostgreSQL 14+

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup database:**
   - Buat database PostgreSQL bernama `laundry_db`
   - Jalankan script SQL:
     ```bash
     psql -U postgres -d laundry_db -f src/config/db.sql
     ```

3. **Configure environment:**
   - Copy `.env.example` ke `.env`
   - Update kredensial database

4. **Run server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register customer baru |
| POST | `/api/auth/login` | Login & dapat token |
| GET | `/api/auth/profile` | Get profil (auth required) |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List semua layanan |
| POST | `/api/services` | Tambah layanan (admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Buat pesanan baru |
| GET | `/api/orders` | List pesanan |
| GET | `/api/orders/:id` | Detail pesanan |
| PATCH | `/api/orders/:id/status` | Update status (admin) |

## Default Admin

- Email: `admin@laundry.com`
- Password: `admin123`
