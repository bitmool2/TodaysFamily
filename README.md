# 오늘의가족 (Today's Family) 🏠❤️

> 어린이집 사진을 가족 단톡방에 매번 보내지 마세요.  
> 오늘의가족이 앨범으로 정리해드려요.

Private family-sharing app — auto-detect KidsNote photos, separate groups for maternal/paternal families, and AI-generated captions.

---

## 📁 Project Structure

```
TodaysFamily/
├── mobile/          # React Native (Expo) app
│   └── src/
│       ├── screens/
│       ├── components/
│       ├── navigation/
│       ├── store/
│       ├── hooks/
│       ├── theme/
│       └── types/
└── backend/         # NestJS API
    ├── src/
    │   ├── auth/
    │   ├── families/
    │   ├── groups/
    │   ├── posts/
    │   ├── comments/
    │   ├── reactions/
    │   ├── family-members/
    │   ├── children/
    │   ├── upload/
    │   ├── ai/
    │   └── notifications/
    └── prisma/
        ├── schema.prisma
        └── seed.ts
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Expo CLI (`npm i -g expo-cli eas-cli`)

### 1. Backend

```bash
# Copy env
cp backend/.env.example backend/.env
# Edit backend/.env with your keys

# Start MySQL
docker compose up mysql -d

# Install & migrate
cd backend
npm install
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts

# Run dev server
npm run start:dev
# API → http://localhost:3031/api/v1
# Swagger → http://localhost:3031/docs
```

### 2. Mobile

```bash
cd mobile
npm install
npx expo start
```

---

## 🔑 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | 회원가입 |
| POST | `/api/v1/auth/login` | 이메일 로그인 |
| POST | `/api/v1/auth/social` | 카카오/Google 로그인 |
| GET  | `/api/v1/auth/me` | 내 정보 |
| POST | `/api/v1/families` | 가족 생성 (3그룹 자동생성) |
| GET  | `/api/v1/families/:id` | 가족 상세 |
| GET  | `/api/v1/families/:id/groups` | 그룹 목록 |
| POST | `/api/v1/posts` | 게시물 작성 |
| GET  | `/api/v1/posts?group=ALL&page=1` | 피드 조회 |
| POST | `/api/v1/comments` | 댓글 |
| POST | `/api/v1/reactions/toggle` | 반응 토글 |
| POST | `/api/v1/family-members/invite` | 초대 링크 생성 |
| POST | `/api/v1/family-members/accept` | 초대 수락 |
| POST | `/api/v1/upload/presigned-url` | S3 업로드 URL |
| POST | `/api/v1/ai/caption` | AI 캡션 생성 |

---

## 🗄️ Database (MySQL + Prisma)

```
User ──< FamilyMember >── Family ──< Group ──< Post ──< Comment
                                           │            └──< Reaction
                                           └──< Child
```

### Run migrations
```bash
cd backend
npx prisma migrate dev
npx prisma studio   # GUI browser
```

---

## ☁️ Infrastructure

| Service | Purpose |
|---------|---------|
| Render | NestJS backend hosting |
| MySQL 8 | Primary database |
| AWS S3 | Image storage (presigned URLs) |
| Firebase FCM | Push notifications |
| GPT-4o Vision | AI caption generation |
| Expo EAS | App build & OTA updates |

---

## 🔧 Environment Variables

See `backend/.env.example` for all required keys:
- `DATABASE_URL` — MySQL connection string
- `JWT_SECRET` — JWT signing key
- `AWS_*` — S3 credentials
- `OPENAI_API_KEY` — GPT-4o Vision
- `FIREBASE_SERVICE_ACCOUNT` — FCM credentials

---

## 📲 Share Intent (KidsNote → 오늘의가족)

### How it works

```
KidsNote (share button)
  │
  ├─ Android ─ ACTION_SEND intent ──► MainActivity.onNewIntent
  │                                      └─ ShareIntentModule.kt
  │                                           └─ getShareIntent() [JS]
  │                                                └─ navigate → Preview
  │
  └─ iOS ──── Share Extension ──────► ShareViewController.swift
                                         └─ writes to App Group UserDefaults
                                              └─ opens todaysfamily://share
                                                   └─ ShareIntentModule.swift
                                                        └─ getShareIntent() [JS]
                                                             └─ navigate → Preview
```

### Native setup (after cloning / first prebuild)

```bash
cd mobile
npm install
npx expo prebuild --clean    # generates ios/ and android/ with patches applied
```

#### Android — register the package
In `android/app/src/main/java/com/todaysfamily/MainApplication.kt`, add:
```kotlin
import com.todaysfamily.ShareIntentPackage

// inside getPackages():
packages.add(ShareIntentPackage())
```

#### iOS — Xcode
1. Open `ios/todaysfamily.xcworkspace`
2. Select the **ShareExtension** target → **Signing & Capabilities**
3. Add **App Groups** capability → `group.com.todaysfamily.app`
4. Repeat for the **todaysfamily** (main) target
5. Build → both targets share the same App Group container



1. **Auto Photo Detection** — Detects batch-saved KidsNote photos when app enters foreground (`usePhotoDetection` hook)
2. **Family Groups** — Separate sharing to 전체/친정/시댁
3. **S3 Direct Upload** — Mobile uploads directly to S3 via presigned URL (no backend bandwidth)
4. **AI Captions** — GPT-4o Vision analyzes child photos and writes warm Korean captions
5. **Push Notifications** — FCM notifies family on new posts/comments

---

## 🌱 Seed Data

```bash
cd backend && npx ts-node prisma/seed.ts
```

Creates: 4 users (엄마/아빠/외할머니/할머니), 1 family, 3 groups, 1 child (민준), 5 posts with comments and reactions.

Login: `mom@todaysfamily.app` / `password123`
