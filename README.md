# 🚀 AutomateCRM — Enterprise Lead Management & Cold Email Automation Engine

AutomateCRM is a production-grade CRM platform featuring automated real email delivery, instant and scheduled multi-customer broadcast campaigns, interactive cold-reply simulators, customer email delivery tracking, and background job scheduling.

---

## ✨ Features

- ⚡ **Instant & Scheduled Email Broadcasts**: Dispatch cold emails immediately or schedule them for background execution via `APScheduler`.
- 📊 **Customer Email Delivery Tracker**: Monitor email logs, delivery statuses, brief summaries, and full message history per customer.
- 🎯 **Lead Simulator Modal**: Simulate real incoming email leads to test automated CRM workflows in real-time.
- 🔐 **Role-Based Access Control (RBAC)**: Support for Admin and Staff users with granular permission controls.
- 🗄️ **Database-Backed SMTP Settings**: Persist email credentials in PostgreSQL / SQLite so configurations survive restarts.
- 🐳 **Full Dockerization**: Multi-container setup with Nginx (for static React SPA build + reverse proxy), FastAPI backend, and PostgreSQL database.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Vanilla CSS design tokens, Lucide Icons.
- **Backend**: Python 3.11, FastAPI, SQLAlchemy ORM, APScheduler, Pydantic.
- **Database**: PostgreSQL (Docker Production) / SQLite (Local Dev).
- **Web Server**: Nginx Alpine reverse proxy.

---

## 🚀 Quickstart with Docker Compose

### 1. Clone the repository
```bash
git clone https://github.com/your-username/CRM-automation.git
cd CRM-automation
```

### 2. Configure Environment Variables (Optional)
Copy the example environment configuration:
```bash
cp .env.example .env
```

### 3. Launch with Docker Compose
```bash
docker-compose up --build -d
```

Access the platform:
- 🌐 **Frontend Application**: `http://localhost`
- ⚙️ **FastAPI Backend API**: `http://localhost:8000/docs`
- 🔑 **Default Admin Login**: `admin@company.com` / `adminpassword`

---

## 💻 Local Development Setup (Without Docker)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 License
This project is open-source under the MIT License.
