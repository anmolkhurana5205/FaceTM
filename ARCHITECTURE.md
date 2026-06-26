# FacePay — Project Architecture

> A custodial crypto wallet platform that enables face-authenticated transactions. Users register once with their face, and from that point forward can send/receive coins simply by looking at the camera — no passwords required.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Directory Structure](#directory-structure)
4. [Current Tech Stack](#current-tech-stack)
   - [Framework & Runtime](#framework--runtime)
   - [Authentication](#authentication)
   - [Face Recognition (Current)](#face-recognition-current)
   - [Database & ORM](#database--orm)
   - [UI & Styling](#ui--styling)
   - [Forms & Validation](#forms--validation)
   - [Email](#email)
   - [Utilities](#utilities)
5. [Database Schema](#database-schema)
6. [Core Feature Flows](#core-feature-flows)
   - [Face Enrollment](#face-enrollment-flow)
   - [Face Login](#face-login-flow)
   - [Coin Transfer (Face-Authorized)](#coin-transfer-face-authorized-flow)
7. [Future Roadmap & Libraries](#future-roadmap--libraries)
   - [Liveness Detection & Anti-Spoofing](#1-liveness-detection--anti-spoofing)
   - [Real Crypto Integration](#2-real-crypto-integration-custodial-wallets)
   - [On-Ramp / Off-Ramp (Fiat ↔ Crypto)](#3-on-ramp--off-ramp-fiat--crypto)
   - [QR Code Payments](#4-qr-code-payments)
   - [Push Notifications](#5-push-notifications)
   - [Rate Limiting & Fraud Detection](#6-rate-limiting--fraud-detection)
   - [Analytics & Monitoring](#7-analytics--monitoring)
   - [Mobile App (React Native)](#8-mobile-app-react-native)
   - [Audit Logging & Compliance](#9-audit-logging--compliance)
   - [Improved Face AI Pipeline](#10-improved-face-ai-pipeline)
8. [Security Architecture](#security-architecture)
9. [Environment Variables](#environment-variables)

---

## Project Overview

FacePay is a **custodial cryptocurrency payment platform** where:

- The platform holds private keys on behalf of users (custodial model).
- Users authenticate using **biometric face recognition** instead of (or in addition to) passwords.
- Transactions between users are settled internally on the platform's ledger; actual on-chain settlement can be batched.
- The face descriptor (128-dimensional float vector) is computed **client-side** using `face-api.js` and stored server-side in the database — no raw images are ever persisted.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 16 (App Router)                  │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │  Client (Browser)│    │   Server (Next.js RSC/Actions)│   │
│  │                 │    │                              │   │
│  │  face-api.js    │───▶│  NextAuth v5 (Auth Layer)    │   │
│  │  (webcam →      │    │  Prisma ORM                  │   │
│  │   descriptor)   │    │  Zod Validation              │   │
│  │                 │    │  Resend (Email)               │   │
│  │  React 19       │    │                              │   │
│  │  Radix UI       │    │  Server Actions              │   │
│  │  Tailwind v4    │    │  ├── auth (login/register)   │   │
│  └────────┬────────┘    │  ├── face-auth (enroll/verify│   │
│           │             │  └── wallet (send/balance)   │   │
│           │             └──────────────┬───────────────┘   │
└───────────┼──────────────────────────┼────────────────────┘
            │                          │
            ▼                          ▼
     [Webcam / Camera]        ┌────────────────────┐
                              │  PostgreSQL (Neon)  │
                              │                    │
                              │  Users             │
                              │  Wallets           │
                              │  Transactions      │
                              │  Auth Tokens       │
                              └────────────────────┘
```

---

## Directory Structure

```
face_pay/
├── actions/              # Next.js Server Actions (server-side business logic)
│   ├── face-auth.ts      # enrollFace, verifyFaceDescriptor, disableFaceAuth
│   ├── login.ts          # credential + 2FA login flow
│   ├── register.ts       # user registration + email verification
│   ├── wallet.ts         # getWalletBalance, sendCoins, getWalletTransactions
│   ├── settings.ts       # update name, password, 2FA toggle
│   └── ...
├── app/                  # Next.js App Router pages
│   ├── (protected)/      # Route group — requires authenticated session
│   │   ├── dashboard/    # Wallet dashboard
│   │   ├── settings/     # Account settings (face enroll, 2FA)
│   │   ├── admin/        # Admin-only pages
│   │   └── _components/  # Shared layout components
│   ├── auth/             # Public auth pages (login, register, verify)
│   ├── api/              # API Route Handlers
│   │   └── auth/         # NextAuth catch-all handler
│   └── layout.tsx        # Root layout with Providers
├── components/
│   ├── auth/             # All auth UI components
│   │   ├── face-enrollment.tsx  # Webcam face capture for registration
│   │   ├── face-login.tsx       # Webcam face capture for login
│   │   ├── login-form.tsx       # Email/password + 2FA form
│   │   └── ...
│   └── ui/               # shadcn/ui primitives (Radix-based)
├── data/                 # Pure DB query functions (read-only, no business logic)
│   ├── user.ts
│   ├── wallet.ts
│   ├── transaction.ts
│   └── ...
├── lib/
│   ├── db.ts             # Prisma client singleton (Neon serverless adapter)
│   ├── face-detection.ts # face-api.js helpers (load models, detect descriptor)
│   ├── wallet.ts         # transferCoins core logic (atomic DB transaction)
│   ├── mail.ts           # Resend email helpers
│   ├── tokens.ts         # Generate/manage verification tokens
│   └── types/            # Shared TypeScript types
├── prisma/
│   └── schema.prisma     # Database schema (User, Wallet, Transaction, Auth)
├── schemas/              # Zod validation schemas (shared client+server)
├── hooks/                # Custom React hooks
├── auth.ts               # NextAuth configuration + JWT/session callbacks
├── auth.config.ts        # Auth providers (Credentials, Google, GitHub)
└── routes.ts             # Public/protected/API route definitions
```

---

## Current Tech Stack

### Framework & Runtime

| Library | Version | Purpose |
|---|---|---|
| **Next.js** | `16.0.10` | Full-stack React framework — App Router, RSC, Server Actions, API Routes |
| **React** | `19.2.0` | UI library with concurrent features |
| **TypeScript** | `^5` | Static typing across the entire codebase |
| **Node.js** | `>=20` | Runtime for the server side |

---

### Authentication

| Library | Version | Purpose |
|---|---|---|
| **next-auth** | `^5.0.0-beta.30` | Authentication framework — JWT sessions, OAuth providers, custom Credentials |
| **@auth/prisma-adapter** | `^2.11.1` | Connects NextAuth to Prisma for persisting sessions and accounts |
| **bcryptjs** | `^3.0.3` | Password hashing (used at login & registration) |
| **bcrypt** | `^6.0.0` | Native bcrypt binding (server-only) |

**OAuth Providers currently configured:**
- `next-auth/providers/google` — Google OAuth
- `next-auth/providers/github` — GitHub OAuth
- `next-auth/providers/credentials` — Email/password + Face

---

### Face Recognition (Current)

| Library | Version | Purpose |
|---|---|---|
| **face-api.js** | `^0.22.2` | Client-side face detection, landmark detection, and 128-dim face descriptor extraction using TinyFaceDetector + FaceRecognitionNet models |

**How it works:**
1. Models (`tinyFaceDetector`, `faceLandmark68Net`, `faceRecognitionNet`) are loaded from `/public/models/`.
2. `detectSingleFace()` runs entirely **in the browser** — no image data leaves the client.
3. The resulting `Float32Array(128)` descriptor is serialized to JSON and sent to the server.
4. Server compares descriptors using **Euclidean distance** with threshold `0.55`.
5. The descriptor is stored as a `TEXT` column in `User.faceDescriptor` — raw images are **never stored**.

---

### Database & ORM

| Library | Version | Purpose |
|---|---|---|
| **Prisma** | `^7.7.0` | ORM — schema-first, type-safe database access, migrations |
| **@prisma/client** | `^7.7.0` | Auto-generated query client |
| **@prisma/adapter-neon** | `^7.1.0` | Serverless PostgreSQL adapter for Neon |
| **@prisma/adapter-pg** | `^7.1.0` | Standard node-postgres adapter (local dev) |
| **@neondatabase/serverless** | `^1.0.2` | Neon's WebSocket-based serverless Postgres driver |
| **pg** | `^8.16.3` | Standard PostgreSQL client (local dev) |
| **ws** | `^8.18.3` | WebSocket implementation for Neon's serverless mode |

**Database:** PostgreSQL (hosted on [Neon](https://neon.tech) — serverless, scales to zero)

---

### UI & Styling

| Library | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | `^4` | Utility-first CSS framework |
| **tw-animate-css** | `^1.4.0` | CSS animation utilities for Tailwind |
| **@tailwindcss/postcss** | `^4` | PostCSS plugin for Tailwind v4 |
| **@radix-ui/react-avatar** | `^1.1.11` | Accessible avatar component |
| **@radix-ui/react-dialog** | `^1.1.15` | Modal/dialog primitive |
| **@radix-ui/react-dropdown-menu** | `^2.1.16` | Dropdown menu primitive |
| **@radix-ui/react-icons** | `^1.3.2` | Icon set from Radix |
| **@radix-ui/react-label** | `^2.1.8` | Accessible label primitive |
| **@radix-ui/react-select** | `^2.2.6` | Select/combobox primitive |
| **@radix-ui/react-slot** | `^1.2.4` | Polymorphic slot component |
| **@radix-ui/react-switch** | `^1.2.6` | Toggle switch primitive |
| **class-variance-authority** | `^0.7.1` | Type-safe variant management for UI components (used with shadcn/ui) |
| **clsx** | `^2.1.1` | Conditional className utility |
| **tailwind-merge** | `^3.4.0` | Merge Tailwind classes without conflicts |
| **lucide-react** | `^0.553.0` | Icon library (modern, tree-shakeable) |
| **react-icons** | `^5.5.0` | Popular icon packs (FontAwesome, etc.) |
| **react-spinners** | `^0.17.0` | Loading spinner components |
| **next-themes** | `^0.4.6` | Dark/light mode theme provider |
| **sonner** | `^2.0.7` | Toast notification system |

---

### Forms & Validation

| Library | Version | Purpose |
|---|---|---|
| **react-hook-form** | `^7.66.0` | Performant form state management with minimal re-renders |
| **@hookform/resolvers** | `^5.2.2` | Connects Zod schemas to react-hook-form for automatic validation |
| **zod** | `^4.1.12` | Schema declaration and runtime validation (used on both client and server) |

---

### Email

| Library | Version | Purpose |
|---|---|---|
| **resend** | `^6.6.0` | Transactional email delivery (verification emails, password reset, 2FA OTPs) |

---

### Utilities

| Library | Version | Purpose |
|---|---|---|
| **uuid** | `^13.0.0` | Generate unique IDs for tokens |
| **dotenv** | `^17.4.2` | Environment variable loading |

---

## Database Schema

```
User
├── id, name, email, emailVerified, image, password
├── role: ADMIN | USER
├── isTwoFactorEnabled: boolean
├── isFaceAuthEnabled: boolean
├── faceDescriptor: String (128-dim JSON float array)
├── wallet: Wallet?
├── sentTransactions: Transaction[]
└── receivedTransactions: Transaction[]

Wallet
├── id, userId (unique — 1 wallet per user)
├── balance: Decimal(28,8)   ← high precision for crypto amounts
├── createdAt, updatedAt
└── transactions: Transaction[]

Transaction
├── id, walletId, senderId, receiverId
├── amount: Decimal(28,8)
├── type: SEND | RECEIVE
├── description: String?
└── createdAt

Account              ← OAuth provider account links
VerificationToken    ← Email verification
PasswordResetToken   ← Password reset
TwoFactorToken       ← 2FA OTP
TwoFactorConfirmation ← Consumed after successful 2FA
```

---

## Core Feature Flows

### Face Enrollment Flow

```
User (Settings Page)
  → clicks "Enable Face Auth"
  → webcam starts (browser MediaDevices API)
  → face-api.js loads 3 neural net models from /public/models
  → detectSingleFace() → withFaceLandmarks() → withFaceDescriptor()
  → Float32Array(128) → JSON.stringify → sent to server action
  → enrollFace() server action: validates length === 128
  → DB: user.faceDescriptor = json, user.isFaceAuthEnabled = true
```

### Face Login Flow

```
Login Page (email entered, "Login with Face" clicked)
  → webcam starts
  → face-api.js detects face → 128-dim descriptor
  → verifyFaceDescriptor(email, descriptorJson) server action:
      → fetch stored descriptor from DB
      → compute Euclidean distance
      → distance < 0.55 → match
  → signIn() called with credentials { email, faceVerified: "true" }
  → NextAuth signIn callback: isFaceAuth === true → skip 2FA check
  → Session granted
```

### Coin Transfer (Face-Authorized) Flow

```
Dashboard → Send Coins form
  → Zod validates { recipientEmail, amount, description }
  → sendCoins() server action:
      → lookup recipient by email
      → transferCoins(senderId, receiverId, amount)
          → getOrCreateWallet for both users
          → check sender balance >= amount
          → db.$transaction([
              decrement sender balance,
              increment receiver balance,
              create SEND transaction record,
              create RECEIVE transaction record
            ]) ← atomic, either all succeed or all fail
  → return { transactionId, newBalance, recipientName }
```

---

## Future Roadmap & Libraries

### 1. Liveness Detection & Anti-Spoofing

**Problem:** Current face auth uses static descriptor matching — a photo or video of the user could fool it.

**Planned approach:** Detect that the face is live before accepting the descriptor.

| Library / Service | Purpose |
|---|---|
| **`@mediapipe/face_mesh`** | Google's MediaPipe — 468 facial landmark tracking in real-time; enables blink detection, head-pose estimation, and micro-expression analysis to prove liveness |
| **`@vladmandic/face-api`** | A modern, actively maintained fork of face-api.js with better model support |
| **AWS Rekognition** (`@aws-sdk/client-rekognition`) | Cloud-based liveness detection — `StartFaceLivenessSession` API; production-grade with built-in spoof detection |
| **Azure Face API** (`@azure/cognitiveservices-face`) | Microsoft's face liveness API — alternative to AWS |
| **FaceTec SDK** | Industry-leading 3D liveness detection (iBeta Level 1 & 2 certified) — used in KYC/AML pipelines |

**Simple browser-based liveness tricks to implement first:**
- **Blink detection** using `@mediapipe/face_mesh` — ask user to blink before accepting
- **Random head-pose challenge** — nod left/right — prove it's a real person responding

---

### 2. Real Crypto Integration (Custodial Wallets)

**Problem:** Current wallets are internal platform credits, not real crypto on a blockchain.

| Library / Service | Purpose |
|---|---|
| **`ethers`** (`ethers.js` v6) | Ethereum wallet generation, signing, and interaction with ERC-20 tokens and smart contracts |
| **`viem`** | TypeScript-first alternative to ethers.js — more modular, better tree-shaking |
| **`@solana/web3.js`** | Solana blockchain interaction — faster/cheaper transactions suitable for payments |
| **`@bitgo/sdk-core`** | BitGo custodial wallet API — enterprise-grade multi-sig custodial infrastructure |
| **`fireblocks-sdk`** | Fireblocks MPC (Multi-Party Computation) wallet SDK — industry standard for custodial crypto |
| **`web3.js`** | Lower-level Ethereum library (alternative to ethers.js) |
| **Infura / Alchemy** SDK | RPC provider SDKs for connecting to Ethereum/Polygon/Arbitrum nodes without running your own |

**Smart contracts (if going on-chain):**
- OpenZeppelin contracts (`@openzeppelin/contracts`) — secure, audited ERC-20 base contracts
- Hardhat (`hardhat`) — smart contract development, testing, and deployment framework

---

### 3. On-Ramp / Off-Ramp (Fiat ↔ Crypto)

**Problem:** Users need a way to deposit fiat money and get crypto, and vice versa.

| Library / Service | Purpose |
|---|---|
| **Stripe** (`stripe`, `@stripe/stripe-js`) | Fiat payment processing — charge cards, bank transfers (ACH); used for on-ramp deposits |
| **MoonPay SDK** | Embedded crypto on-ramp widget — users buy crypto with credit card directly |
| **Transak SDK** (`@transak/transak-sdk`) | Another popular on-ramp/off-ramp SDK |
| **Razorpay** (`razorpay`) | For Indian market — UPI, Net Banking, Wallets support; very relevant for INR-based users |
| **Coinbase Commerce** (`coinbase-commerce-node`) | Accept crypto payments; Coinbase-managed |

---

### 4. QR Code Payments

**Problem:** Scanning a QR code should identify the recipient without typing an email.

| Library | Purpose |
|---|---|
| **`qrcode`** | Generate QR codes server-side (Node.js) — for displaying user's payment QR |
| **`qrcode.react`** | React component to render QR codes client-side |
| **`@zxing/browser`** | ZXing barcode/QR scanner using the device camera — for scanning QR to pay |
| **`html5-qrcode`** | Simple QR scanner library with webcam support |
| **`jsQR`** | Lightweight, pure-JS QR code reader |

**Flow:** Each user gets a unique QR code encoding their `userId` or wallet address. Sender scans → auto-fills recipient → face auth → send.

---

### 5. Push Notifications

**Problem:** Users should receive real-time alerts for incoming transactions.

| Library / Service | Purpose |
|---|---|
| **`web-push`** | Browser Push API (Web Push Protocol) — send push notifications to users without an app |
| **`@pusher/push-notifications-web`** | Pusher Beams — managed push notification service |
| **Firebase Cloud Messaging** (`firebase/messaging`) | FCM — Google's free push notification service (web + mobile) |
| **`socket.io`** | WebSockets for real-time in-app notifications (already have `ws` installed — upgrade path) |
| **Knock** (`@knocklabs/client`) | Notification infrastructure platform — multi-channel (email, SMS, push, in-app) |

---

### 6. Rate Limiting & Fraud Detection

**Problem:** Prevent brute-force face matching attempts and transaction abuse.

| Library / Service | Purpose |
|---|---|
| **`@upstash/ratelimit`** | Redis-backed rate limiter — limit face auth attempts, transaction requests per user per time window |
| **`@upstash/redis`** | Upstash serverless Redis — pairs with rate limiter; edge-compatible |
| **`ioredis`** | Full Redis client for server-side caching and rate limiting |
| **Arcjet** (`@arcjet/next`) | Application security for Next.js — bot detection, rate limiting, email validation |
| **Checkly** / **Sift** | Fraud detection APIs for transaction anomaly detection |

---

### 7. Analytics & Monitoring

| Library / Service | Purpose |
|---|---|
| **Sentry** (`@sentry/nextjs`) | Error tracking and performance monitoring — catch bugs in production |
| **PostHog** (`posthog-js`) | Product analytics — user funnels, feature flags, session recordings |
| **Vercel Analytics** (`@vercel/analytics`) | Core web vitals and page view analytics (if deploying on Vercel) |
| **`pino`** | Fast, structured server-side logging (structured JSON logs for observability) |
| **OpenTelemetry** (`@opentelemetry/sdk-node`) | Distributed tracing for understanding performance bottlenecks |

---

### 8. Mobile App (React Native)

**Problem:** Face auth is much more natural on mobile — device biometrics + camera.

| Library | Purpose |
|---|---|
| **React Native** + **Expo** | Cross-platform mobile app (iOS + Android) sharing business logic with the web app |
| **`expo-face-detector`** | On-device face detection using Google ML Kit / Apple Vision |
| **`expo-camera`** | Camera access for QR scanning and face capture |
| **`expo-local-authentication`** | Device biometrics (FaceID on iOS, fingerprint on Android) as secondary auth factor |
| **`@react-native-async-storage/async-storage`** | Persistent storage for session tokens on mobile |
| **React Native MMKV** | Fast key-value storage alternative to AsyncStorage |

---

### 9. Audit Logging & Compliance

**Problem:** Financial platforms need tamper-evident logs for compliance (AML/KYC).

| Library / Service | Purpose |
|---|---|
| **`@supabase/supabase-js`** | Supabase — append-only audit log table with row-level security |
| **AWS CloudTrail** | Full API audit trail (if deployed on AWS) |
| **Persona** (`@persona/embedded`) | Identity verification (KYC) — government ID + selfie matching for regulatory compliance |
| **Onfido** | KYC/AML verification API — document + biometric check |
| **`zod-to-json-schema`** | Auto-generate JSON schema from Zod for API documentation |

---

### 10. Improved Face AI Pipeline

**Problem:** `face-api.js` is older (TensorFlow.js v2 based) and has limited liveness/anti-spoof capability.

| Library | Purpose |
|---|---|
| **`@tensorflow/tfjs`** | Core TensorFlow.js — run custom trained liveness models in browser |
| **`@tensorflow-models/blazeface`** | Google's BlazeFace — faster, more accurate face detection than TinyFaceDetector |
| **`@mediapipe/tasks-vision`** | MediaPipe's modern API — FaceDetector, FaceLandmarker, FaceStyler; replaces face-api.js entirely |
| **ONNX Runtime Web** (`onnxruntime-web`) | Run ONNX models (e.g., InsightFace, ArcFace) directly in the browser for state-of-the-art face embeddings |

**Recommended migration path:**  
`face-api.js` → `@mediapipe/tasks-vision` (for detection + landmarks) + `onnxruntime-web` with ArcFace model (for embeddings) + custom liveness classifier.

---

## Security Architecture

```
Layer 1 — Transport
  └── HTTPS everywhere (TLS 1.3)
  └── HSTS headers (via Next.js middleware)

Layer 2 — Authentication
  └── JWT sessions (stateless, signed HS256)
  └── bcrypt password hashing (cost factor 12)
  └── Email verification required before any login
  └── 2FA via TOTP (one-time token, single-use, DB-deleted after use)
  └── Face auth: Euclidean distance < 0.55 threshold

Layer 3 — Authorization
  └── Middleware route protection (routes.ts)
  └── Role-based access (USER | ADMIN) checked in Server Actions
  └── Session user ID always fetched fresh from JWT (no client trust)

Layer 4 — Transaction Safety
  └── Prisma $transaction (atomic — no partial transfers)
  └── Decimal(28,8) precision — no floating-point rounding errors
  └── Server-side amount validation (min/max limits)
  └── Self-transfer prevention
  └── Balance check before decrement

Layer 5 — Data Privacy
  └── Face descriptors stored as opaque float arrays — not reconstructible into images
  └── No raw biometric images persisted anywhere
  └── OAuth tokens stored encrypted via NextAuth adapter

Future Layers (planned)
  └── Rate limiting on face auth attempts (Upstash Redis)
  └── Liveness detection (MediaPipe / FaceTec)
  └── KYC verification for large withdrawals (Persona / Onfido)
  └── Transaction anomaly detection (Sift)
  └── Audit log (append-only, tamper-evident)
```

---

## Environment Variables

```env
# Database
DATABASE_URL=                    # Neon PostgreSQL connection string

# NextAuth
AUTH_SECRET=                     # Random secret for JWT signing (openssl rand -base64 32)
NEXTAUTH_URL=                    # Your app URL (e.g. http://localhost:3000)

# OAuth Providers
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email
RESEND_API_KEY=                  # Resend.com API key for transactional emails
RESEND_FROM_EMAIL=               # Sender email address

# Future
UPSTASH_REDIS_REST_URL=          # Rate limiting
UPSTASH_REDIS_REST_TOKEN=
STRIPE_SECRET_KEY=               # Fiat on-ramp
STRIPE_WEBHOOK_SECRET=
```

---

*Last updated: June 2026*
