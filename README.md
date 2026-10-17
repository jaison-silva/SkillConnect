🤝 SkillConnect

SkillConnect is a multi-role, full-stack service marketplace connecting Clients with skilled Providers, governed by Admin moderation.

✨ Core Features

Dual-Consent Negotiation: Synchronized contract room where any change resets prior approvals until both parties lock terms.

Financial Escrow: Upfront payment capture and split payouts via Stripe Connect / Razorpay Route.

Geospatial & Calendar Guards: Prevents double-bookings and enforces realistic transit buffers using MongoDB 2dsphere indexes.

On-Site OTP Handshake: Requires a 4-digit Client OTP verification before transitioning jobs to IN_PROGRESS.

Masked Communication: Scoped Socket.io media chat and peer-to-peer WebRTC voice calls.

Agentic AI Disputes: Automated escrow mediation using Gemini/Claude APIs with an Admin override console.

🛠️ Tech Stack & Architecture

Built with a strict Clean N-Tier Architecture (Routes ➔ Controllers ➔ Services ➔ Repositories ➔ Models) following SOLID and OOP principles.

Frontend: React 18 (Vite), TypeScript, Tailwind CSS, Redux Toolkit & RTK Query

Backend: Node.js, Express.js, TypeScript (tsx), Inversify (IoC/DI), class-validator

Database & Cache: MongoDB Atlas (Mongoose), Redis

Integrations: Socket.io, WebRTC, AWS S3 / Cloudinary, Stripe / Razorpay, Resend / Nodemailer, Gemini / Claude API

🚀 Quick Start

1. Backend Setup

cd backend
npm install


Create a backend/.env file:

PORT=5000
MONGO_URI=mongodb://localhost:27017/skillconnect
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secret_key
REDIS_URL=redis://localhost:6379


Run the server:

npm run dev


2. Frontend Setup

cd frontend
npm install
npm run dev


3. API Testing

Import the root postman/ directory into your Postman desktop app to access pre-configured API collections.

👤 Author

Jaison Joy — Full-Stack Engineer