# Recruit Sphere: Advanced AI-Driven Recruitment Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

**Recruit Sphere** is a professional-grade, full-stack enterprise recruitment platform designed to automate and streamline the hiring process. Built for modern HR teams and tech recruiters, it provides an end-to-end Hiring-as-a-Service solution featuring intelligent resume parsing, dynamic recruitment pipelines, and secure assessments.

---

## 🚀 Core Features

- **Intelligent ATS Scoring:** Automated resume parsing that scores candidates dynamically based on job-specific criteria and keywords, establishing minimum passing thresholds.
- **Dynamic Multi-Stage Pipelines:** Configurable recruitment stages for every individual job posting, supporting automated transitions through:
  - **ATS Resume Screening**
  - **Proctored Aptitude Exams** (Timed, customizable logical reasoning)
  - **Advanced Coding Challenges** (Embedded IDE with multi-language support and test cases)
- **AI-Conducted Interviews (Upcoming):** An autonomous AI module designed to conduct dynamic, behavioral, and technical video/audio interviews.
- **Real-Time Notification System:** Integrated SMTP email delivery and in-app alerts keep candidates and recruiters instantly updated on status changes and exam schedules.
- **Comprehensive Candidate Profiles:** A unified command center for candidates to track application statuses, manage skill portfolios, and host resumes.

---

## 🛠️ Technology Stack

Our platform leverages a modern, highly scalable tech stack:

- **Frontend & Framework:** Next.js 14 (App Router), React 19, Tailwind CSS, Shadcn UI
- **State Management:** Zustand (Global UI State), TanStack Query (Server State)
- **Backend Orchestration:** Next.js Server Actions backed by a dedicated, decoupled **Service Layer** (SOA)
- **Database:** MongoDB with Mongoose (Optimized Schema Indexing)
- **Validation & Security:** Zod for end-to-end type safety, bcryptjs for hashing, and custom secure JWT/cookie-based session middleware
- **Email Delivery:** Nodemailer (SMTP Integration)

---

## 🏗️ System Architecture

Recruit Sphere employs a **Service-Oriented Architecture (SOA)**, separating UI rendering from business logic to ensure maximum testability and maintainability.

### Core Design Principles:
1. **Dumb Actions, Smart Services:** Next.js Server Actions act purely as entry points. All complex business logic (e.g., ATS scoring, pipeline transitions) resides in modular classes within `src/services/`.
2. **Streaming & Suspense:** Data-heavy dashboard routes utilize Next.js `loading.tsx` and React Suspense boundaries to eliminate blank screens and provide near-instant perceived load times.
3. **Optimized Data Layer:** Standardized `.lean()` MongoDB queries combined with strategic indexing (on `createdAt`, `status`, `recruiterId`) ensure high-performance throughput even at scale.

---

## 📁 Project Structure

```bash
src/
├── app/               # Next.js App Router (Pages, Layouts, API Routes, Actions)
├── components/        # Reusable UI components (Shadcn UI, Layouts, Forms)
├── features/          # Domain-driven feature modules (Jobs, Candidates, Exams)
├── hooks/             # Custom React hooks
├── lib/               # Utility functions, Database config, and Email setups
├── models/            # Mongoose Schemas & Database Models
├── services/          # Centralized Business Logic (JobService, ApplicationService)
├── shared/            # Shared TypeScript types and Zod validation schemas
└── store/             # Global state management using Zustand
```

---

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/varni1512/Recruit_Sphere.git
   cd Recruit_Sphere
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # AI Integrations
   GROQ_API_KEY=your_groq_api_key

   # Cloudinary (Media Storage)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Email Configuration (SMTP)
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_app_specific_password
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   *The application will be available at `http://localhost:3000`.*

5. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## 📝 License

This project is distributed under the **MIT License**. See the `LICENSE` file for more information.
