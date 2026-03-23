# Overthinker Action Tracker - Technical Build Plan

## 1. Mục tiêu tài liệu

Tài liệu này mô tả kế hoạch kỹ thuật để xây dựng sản phẩm **Overthinker Action Tracker** theo kiến trúc **3 source tách biệt**:

1. **API source**: cung cấp backend services, business logic, authentication, dashboard aggregation, và kết nối database.
2. **CMS source**: ứng dụng **React** dành cho admin / operator để quản trị users, challenges, sessions, categories, audit, và theo dõi hệ thống.
3. **User App source**: ứng dụng **Next.js** dành cho end users để sử dụng sản phẩm chính.

Ngoài ra hệ thống dùng:
- **PostgreSQL** làm database
- **Docker + Docker Compose** để chạy toàn bộ môi trường local / staging / production

---

## 2. Product scope

Sản phẩm giúp người dùng theo dõi thời gian họ dành cho:
- **Thinking**
- **Executing**

trên từng **Challenge** trong 4 category cố định:
- **Health**
- **Career**
- **Relationships**
- **Personal Growth**

Mỗi challenge có status:
- **Pending**
- **In Progress**
- **Completed**

Mỗi session gồm:
- session type: Thinking / Executing
- session date
- start time
- end time
- total minutes
- note tối đa 100 ký tự

Hệ thống phải cập nhật dashboard ngay sau khi session được tạo, sửa, hoặc xóa.

---

## 3. Kiến trúc tổng thể

### Kiến trúc solution đề xuất

```text
overthinker-action-tracker/
  README.md
  docker-compose.yml
  .env.example
  infra/
    nginx/
    scripts/
  api/
    src/
    prisma/
    tests/
    Dockerfile
    package.json
  cms/
    src/
    public/
    Dockerfile
    package.json
  user-app/
    app/
    components/
    public/
    Dockerfile
    package.json
```

### Lý do tách 3 source

#### API source riêng
- tách toàn bộ business logic khỏi UI
- cho phép CMS và User App dùng chung cùng một API
- dễ scale độc lập
- dễ bảo trì và test

#### CMS source riêng
- admin interface có nghiệp vụ khác user app
- không nên nhét màn hình quản trị vào cùng codebase với end-user UI
- có thể release độc lập với user app

#### User App source riêng
- tối ưu trải nghiệm cho người dùng cuối
- phù hợp với Next.js để có routing tốt, layout tốt, và mở rộng web/mobile web dễ hơn

---

## 4. Technology stack

### API source
- Node.js
- TypeScript
- NestJS hoặc Express theo modular architecture
- Prisma ORM
- PostgreSQL
- JWT hoặc cookie-based auth
- Zod / class-validator cho request validation

### CMS source
- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- TanStack Query
- React Hook Form + Zod
- Recharts cho dashboard admin

### User App source
- Next.js
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form + Zod
- Recharts cho dashboard user

### Database / Infra
- PostgreSQL
- Docker
- Docker Compose
- Nginx reverse proxy khi deploy

---

# 5. API SOURCE PLAN

## 5.1 Mục tiêu của API source

API là trung tâm của toàn bộ hệ thống. API phải chịu trách nhiệm cho:
- authentication
- user management
- challenge CRUD
- session CRUD
- dashboard aggregation
- CMS admin operations
- data validation
- authorization
- auditability cơ bản

API phải được thiết kế để cả **CMS** và **User App** đều dùng được.

---

## 5.2 Cấu trúc source đề xuất

```text
api/
  src/
    main.ts
    app.module.ts
    config/
      env.ts
      database.ts
      auth.ts
    common/
      guards/
      interceptors/
      filters/
      decorators/
      dto/
      utils/
      constants/
    modules/
      auth/
      users/
      admin/
      challenges/
      sessions/
      dashboards/
      health/
    prisma/
      prisma.service.ts
    types/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  tests/
    unit/
    integration/
  Dockerfile
  package.json
  tsconfig.json
```

---

## 5.3 Domain modules cần có

### Auth module
Chức năng:
- register
- login
- logout
- current user profile
- token validation
- refresh token nếu cần sau này

### Users module
Chức năng:
- lấy profile user
- cập nhật thông tin cơ bản
- admin xem danh sách users
- admin khóa / mở user sau này nếu cần

### Challenges module
Chức năng:
- tạo challenge
- lấy danh sách challenge
- lấy challenge detail
- update challenge
- delete challenge

### Sessions module
Chức năng:
- tạo session
- sửa session
- xóa session
- lấy sessions theo challenge
- validate note <= 100 ký tự
- trigger recalculation

### Dashboards module
Chức năng:
- all-challenges dashboard
- challenge dashboard
- category dashboard
- admin summary dashboard cho CMS

### Admin module
Chức năng:
- admin-only endpoints
- user listing
- challenge / session moderation nếu cần
- operational metrics

### Health module
Chức năng:
- health check endpoint
- readiness / liveness để chạy Docker / deployment dễ hơn

---

## 5.4 Database design với PostgreSQL

### Table: users
Các field đề xuất:
- id
- full_name
- email
- password_hash
- role
- status
- created_at
- updated_at
- last_login_at nullable

### Table: challenges
Các field đề xuất:
- id
- user_id
- name
- category
- status
- total_thinking_minutes
- total_executing_minutes
- created_at
- updated_at
- completed_at nullable

### Table: sessions
Các field đề xuất:
- id
- challenge_id
- user_id
- category
- session_type
- session_date
- start_time nullable
- end_time nullable
- total_minutes
- note varchar(100) nullable
- created_at
- updated_at

### Table: audit_logs (khuyến nghị cho CMS)
Các field đề xuất:
- id
- actor_user_id nullable
- actor_role
- action
- entity_type
- entity_id
- metadata jsonb
- created_at

---

## 5.5 Enum design

### category
- health
- career
- relationships
- personal_growth

### challenge_status
- pending
- in_progress
- completed

### session_type
- thinking
- executing

### user_role
- user
- admin

### user_status
- active
- suspended

---

## 5.6 Business rules

### Challenge rules
- challenge name là bắt buộc
- category là bắt buộc và chỉ được thuộc 1 trong 4 giá trị cố định
- status mặc định là `pending`
- khi challenge chuyển sang `completed` thì set `completed_at`
- khi challenge rời khỏi `completed` thì clear `completed_at`

### Session rules
- session phải thuộc challenge của đúng user
- note là optional nhưng không quá 100 ký tự
- total_minutes phải > 0
- chỉ có 2 session types: thinking / executing
- tạo / sửa / xóa session phải trigger recalculation cho challenge totals
- nếu challenge đang `pending` và có session đầu tiên thì auto-update sang `in_progress`

### Dashboard rules
- mọi dashboard user chỉ đọc dữ liệu của chính user đó
- CMS admin dashboard có thể đọc toàn hệ thống hoặc filtered subsets
- dashboard totals ưu tiên dùng `challenge summary fields` + query aggregation để tối ưu

---

## 5.7 Dashboard formulas

### Per challenge
- Total Thinking Time = tổng total_minutes của các thinking sessions
- Total Executing Time = tổng total_minutes của các executing sessions
- Total Time = Total Thinking Time + Total Executing Time
- Thinking % = Total Thinking Time / Total Time * 100
- Executing % = Total Executing Time / Total Time * 100
- Ratio = Total Thinking Time / Total Executing Time
- Total Sessions = số session của challenge
- Last Session Date = session date mới nhất

### Per category
- tổng hợp toàn bộ challenges trong category của user
- tính total thinking, total executing, total time, percentages, ratio, challenge count, completed count

### All challenges
- tổng hợp toàn bộ challenges của user
- tính total thinking, total executing, total time, percentages, ratio, total challenges, completed challenges, total sessions

### CMS admin metrics
- total users
- active users
- total challenges
- total sessions
- total thinking minutes toàn hệ thống
- total executing minutes toàn hệ thống
- challenges created by date
- sessions created by date

---

## 5.8 Recalculation strategy

### MVP strategy
Mỗi lần create / update / delete session:
1. lấy tất cả sessions của challenge
2. tính lại total_thinking_minutes
3. tính lại total_executing_minutes
4. update row trong `challenges`
5. trả về challenge summary mới nhất

### Lý do chọn cách này cho MVP
- đơn giản
- ít bug hơn
- dễ test
- đủ nhanh ở giai đoạn đầu

Sau này nếu scale lớn hơn, có thể tối ưu bằng:
- incremental updates
- event-driven recalculation
- materialized views

---

## 5.9 API endpoint design

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### User App endpoints
- `GET /api/v1/challenges`
- `POST /api/v1/challenges`
- `GET /api/v1/challenges/:id`
- `PATCH /api/v1/challenges/:id`
- `DELETE /api/v1/challenges/:id`
- `GET /api/v1/challenges/:id/sessions`
- `POST /api/v1/challenges/:id/sessions`
- `PATCH /api/v1/sessions/:sessionId`
- `DELETE /api/v1/sessions/:sessionId`
- `GET /api/v1/dashboard/overview`
- `GET /api/v1/dashboard/challenges/:id`
- `GET /api/v1/dashboard/categories/:category`

### CMS admin endpoints
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/:id`
- `PATCH /api/v1/admin/users/:id/status`
- `GET /api/v1/admin/challenges`
- `GET /api/v1/admin/sessions`
- `GET /api/v1/admin/dashboard/summary`
- `GET /api/v1/admin/audit-logs`

---

## 5.10 Authentication và authorization

### MVP authentication
- email + password
- password hash bằng bcrypt
- access token bằng JWT hoặc session cookie
- khuyến nghị dùng **HTTP-only cookie** cho web apps

### Authorization
- `user` chỉ thao tác dữ liệu của chính mình
- `admin` truy cập CMS endpoints
- guard / middleware phải tách rõ role-based access

---

## 5.11 Validation strategy

Validate tại API cho:
- request body
- params
- query string
- enum values
- note length
- ownership
- role access

Response error nên nhất quán:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload"
  }
}
```

---

## 5.12 Testing plan cho API

### Unit tests
- auth service
- challenge service
- session recalculation service
- dashboard aggregation service

### Integration tests
- register / login flow
- create challenge
- create session
- edit session
- delete session
- verify totals recalculated

### Security / access tests
- user không xem được challenge của user khác
- non-admin không truy cập được admin endpoints

---

## 5.13 Docker plan cho API

### API Dockerfile
Phải làm được các bước:
- install dependencies
- generate Prisma client
- build TypeScript
- start API server

### API environment variables
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV`
- `CORS_ORIGIN_USER_APP`
- `CORS_ORIGIN_CMS`

---

# 6. CMS SOURCE PLAN (React Admin)

## 6.1 Mục tiêu của CMS

CMS là ứng dụng quản trị riêng cho admin / operator, không dành cho end users.

CMS dùng để:
- quản lý users
- xem challenges
- xem sessions
- xem dashboard tổng quan toàn hệ thống
- theo dõi health của sản phẩm
- hỗ trợ troubleshooting cơ bản

CMS **không** nên dùng Next.js trong yêu cầu mới. CMS sẽ là **React app riêng**, build bằng **React + Vite**.

---

## 6.2 Cấu trúc source đề xuất

```text
cms/
  src/
    main.tsx
    App.tsx
    routes/
    pages/
      login/
      dashboard/
      users/
      challenges/
      sessions/
      audit-logs/
      settings/
    components/
      layout/
      tables/
      forms/
      charts/
      ui/
    services/
      api/
    hooks/
    store/
    types/
    utils/
    validations/
  public/
  Dockerfile
  package.json
  vite.config.ts
```

---

## 6.3 Vai trò của CMS trong solution

CMS không phải là nơi user chính sử dụng sản phẩm. Nó là công cụ vận hành.

### CMS phải hỗ trợ:
- admin login
- user management
- system metrics
- view data by user
- filter / search / inspect sessions
- basic moderation hoặc disable user nếu cần

### CMS không nên chứa:
- end-user timer UX
- end-user personal dashboard UX
- public landing pages

---

## 6.4 Các màn hình chính của CMS

### 1. Admin Login
Fields:
- email
- password

### 2. Admin Dashboard
Summary cards:
- Total Users
- Active Users
- Total Challenges
- Total Sessions
- Total Thinking Minutes
- Total Executing Minutes

Charts:
- new users by date
- challenges by category
- sessions by type
- thinking vs executing overall

### 3. Users Management Page
Table columns:
- User Name
- Email
- Role
- Status
- Total Challenges
- Total Sessions
- Created At
- Actions

Actions:
- view user detail
- suspend / activate user

### 4. Challenges Management Page
Table columns:
- Challenge Name
- User
- Category
- Status
- Total Thinking Time
- Total Executing Time
- Created At
- Updated At

### 5. Sessions Management Page
Table columns:
- User
- Challenge
- Category
- Type
- Session Date
- Total Minutes
- Note
- Created At

### 6. Audit Logs Page
Table columns:
- Actor
- Role
- Action
- Entity Type
- Entity ID
- Timestamp

---

## 6.5 UI principles cho CMS

CMS nên rõ ràng, chức năng mạnh, nhưng không cần quá “consumer friendly”.

Ưu tiên:
- data dense nhưng dễ đọc
- filter và search rõ ràng
- table-first design
- permission-aware UI
- reusable admin components

---

## 6.6 State và data strategy cho CMS

### Client state
- filter state
- modal state
- table row selection

### Server state
Dùng **TanStack Query** cho:
- users list
- challenge list
- sessions list
- admin dashboard
- audit logs

### Forms
Dùng **React Hook Form + Zod** cho:
- login
- edit user status
- admin filters nếu cần advanced mode

---

## 6.7 API integration cho CMS

CMS sẽ gọi các endpoint `/api/v1/admin/*` và một phần `/api/v1/auth/*`.

Ví dụ service functions:
- `adminLogin()`
- `getAdminDashboardSummary()`
- `getUsers()`
- `getUserById()`
- `updateUserStatus()`
- `getAdminChallenges()`
- `getAdminSessions()`
- `getAuditLogs()`

---

## 6.8 Docker plan cho CMS

### CMS Dockerfile
Phải làm được các bước:
- install dependencies
- build React app
- serve production build

### CMS environment variables
- `VITE_API_BASE_URL`

---

## 6.9 Build phases cho CMS

### Phase 1
- setup React + Vite + TypeScript
- setup routing
- setup auth flow admin
- setup layout shell

### Phase 2
- build admin dashboard
- build reusable table components
- build filters

### Phase 3
- build users page
- build challenges page
- build sessions page

### Phase 4
- build audit logs page
- add loading / empty / error states
- polish permissions and guards

---

# 7. USER APP SOURCE PLAN (Next.js for end users)

## 7.1 Mục tiêu của User App

Đây là ứng dụng chính dành cho người dùng cuối.

User App phải giúp user:
- tạo và quản lý challenges
- log Thinking sessions
- log Executing sessions
- xem dashboard theo challenge
- xem dashboard theo category
- xem all-challenges dashboard

User App phải tối ưu cho trải nghiệm calm, focused, ít friction.

---

## 7.2 Cấu trúc source đề xuất

```text
user-app/
  app/
    layout.tsx
    page.tsx
    login/page.tsx
    register/page.tsx
    dashboard/page.tsx
    challenges/page.tsx
    challenges/[id]/page.tsx
    categories/[category]/page.tsx
    profile/page.tsx
  components/
    layout/
    ui/
    forms/
    challenges/
    sessions/
    dashboards/
    charts/
  lib/
    api/
    hooks/
    utils/
    validations/
    constants/
  types/
  public/
  Dockerfile
  package.json
```

---

## 7.3 Các màn hình chính của User App

### 1. Authentication
#### Login page
- email
- password

#### Register page
- full name
- email
- password
- confirm password

### 2. Overview Dashboard
Summary cards:
- Total Thinking Time
- Total Executing Time
- Total Time
- Thinking %
- Executing %
- Overall Ratio
- Total Challenges
- Completed Challenges

Charts:
- overall thinking vs executing donut chart
- challenge comparison bar chart
- category comparison bar chart

Tables / panels:
- all challenges summary table
- recent activity list

### 3. Challenges List Page
Functions:
- list challenges
- search by name
- filter by category
- filter by status
- create challenge

Challenge card / row should show:
- challenge name
- category
- status
- total thinking time
- total executing time
- updated at

### 4. Challenge Detail Page
Header:
- challenge name
- category
- status
- edit challenge
- mark completed

Summary cards:
- Total Thinking Time
- Total Executing Time
- Total Time
- Thinking %
- Executing %
- Ratio
- Total Sessions
- Last Session Date

Charts:
- donut chart for thinking vs executing
- bar chart for total comparison

Actions:
- Start Thinking Timer
- Start Executing Timer
- Add Manual Session

Session table columns:
- Date
- Type
- Start Time
- End Time
- Total Minutes
- Note
- Actions

### 5. Category Dashboard Pages
Có 4 pages hoặc 1 dynamic page cho:
- Health
- Career
- Relationships
- Personal Growth

Summary cards:
- Total Thinking Time
- Total Executing Time
- Total Time
- Thinking %
- Executing %
- Ratio
- Number of Challenges
- Completed Challenges

Charts:
- category donut chart
- category challenge comparison chart

Table:
- challenge name
- status
- total thinking time
- total executing time
- total time
- percentages
- last session date

---

## 7.4 Session entry UX

### Live timer mode
Flow:
1. user chọn challenge
2. user chọn session type
3. click Start
4. timer chạy
5. click Stop
6. nhập note optional
7. save session

Rules:
- mỗi user chỉ có 1 active timer tại một thời điểm
- không có pause trong MVP
- nếu user quay lại app, có thể restore timer state nếu backend support

### Manual entry mode
Fields:
- challenge
- session type
- session date
- start time
- end time hoặc total minutes
- note tối đa 100 ký tự

---

## 7.5 UI principles cho User App

### Calm and low-friction
- ít lựa chọn thừa
- wording đơn giản
- action buttons rõ ràng
- forms ngắn

### Clear information hierarchy
- summary cards ở trên
- charts ở giữa
- tables bên dưới

### Responsive design
- mobile friendly ngay từ đầu
- desktop tối ưu cho dashboard và tables

---

## 7.6 API integration cho User App

Các service functions chính:
- `registerUser()`
- `loginUser()`
- `logoutUser()`
- `getCurrentUser()`
- `getOverviewDashboard()`
- `getChallenges()`
- `getChallengeById()`
- `createChallenge()`
- `updateChallenge()`
- `deleteChallenge()`
- `getChallengeSessions()`
- `createSession()`
- `updateSession()`
- `deleteSession()`
- `getCategoryDashboard()`

---

## 7.7 State strategy cho User App

### Local UI state
- modal open / close
- filters
- timer UI state
- forms

### Server state
Dùng **TanStack Query** cho:
- dashboard overview
- challenges list
- challenge detail
- category dashboards
- sessions list

### Form validation
Dùng **React Hook Form + Zod**

---

## 7.8 Docker plan cho User App

### User App Dockerfile
Phải làm được các bước:
- install dependencies
- build Next.js app
- run production server

### User App environment variables
- `NEXT_PUBLIC_API_BASE_URL`

---

## 7.9 Build phases cho User App

### Phase 1
- setup Next.js + TypeScript + Tailwind
- setup layouts và auth pages
- setup API client layer

### Phase 2
- build challenges list page
- build create / edit challenge flow
- build challenge detail shell

### Phase 3
- build timer widget
- build manual session form
- build session table

### Phase 4
- build overview dashboard
- build category dashboards
- build reusable charts và metric cards

### Phase 5
- responsive polish
- loading / empty / error states
- UX refinements

---

# 8. DOCKER & INFRASTRUCTURE PLAN

## 8.1 Services cần chạy trong Docker Compose

Hệ thống local nên chạy ít nhất 4 services:
- `api`
- `cms`
- `user-app`
- `db`

Có thể thêm sau:
- `nginx`
- `pgadmin`

### Docker Compose structure đề xuất

```yaml
services:
  api:
    build: ./api
    ports:
      - "4000:4000"
    depends_on:
      - db

  cms:
    build: ./cms
    ports:
      - "3001:3000"
    depends_on:
      - api

  user-app:
    build: ./user-app
    ports:
      - "3000:3000"
    depends_on:
      - api

  db:
    image: postgres:16
    ports:
      - "5432:5432"
```

---

## 8.2 Environment variables

### API
- `PORT=4000`
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET=...`
- `NODE_ENV=development`
- `CORS_ORIGIN_USER_APP=http://localhost:3000`
- `CORS_ORIGIN_CMS=http://localhost:3001`

### CMS
- `VITE_API_BASE_URL=http://localhost:4000/api/v1`

### User App
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1`

### PostgreSQL
- `POSTGRES_DB=overthinker`
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`

---

# 9. DEVELOPMENT ROADMAP

## Phase 1 - Foundation
- tạo monorepo / multi-app repo structure
- setup Docker Compose
- setup PostgreSQL
- setup Prisma schema và migration đầu tiên
- setup API app
- setup CMS app
- setup User App

## Phase 2 - Authentication & Roles
- register / login cho user app
- login cho admin CMS
- role-based guards ở API
- session / cookie strategy

## Phase 3 - Core Product Data
- challenges CRUD
- sessions CRUD
- recalculation logic
- note <= 100 chars validation
- auto-update status từ pending sang in_progress khi có session đầu tiên

## Phase 4 - User App Experience
- challenges list
- challenge detail
- live timer
- manual entry
- overview dashboard
- category dashboards

## Phase 5 - CMS Operations
- admin dashboard
- users management
- challenges list
- sessions list
- audit logs

## Phase 6 - Quality & Release Prep
- unit / integration tests
- error handling hardening
- loading / empty / error states
- environment review
- Docker production review
- deployment prep

---

# 10. MVP SCOPE

## Bao gồm trong MVP
- 3 source tách biệt: API, CMS, User App
- PostgreSQL database
- Dockerized local development
- user authentication
- admin authentication cơ bản
- 4 fixed categories
- challenge CRUD
- session CRUD
- live timer
- manual session entry
- note tối đa 100 ký tự
- all-challenges dashboard
- challenge dashboard
- category dashboard
- CMS admin dashboard
- users list trong CMS
- challenges list trong CMS
- sessions list trong CMS

## Chưa cần trong MVP
- social features
- notifications
- AI insights
- pause/resume timer
- custom categories
- advanced audit workflow
- multi-language support
- mobile native app

---

# 11. Kiến nghị triển khai

## Quyết định kỹ thuật khuyến nghị

### 1. Repo strategy
Có thể dùng:
- **1 monorepo** chứa 3 source: API, CMS, User App

Đây là lựa chọn khuyến nghị vì:
- dễ đồng bộ version
- dễ chạy Docker Compose
- dễ chia sẻ types / docs / scripts

### 2. API framework
Khuyến nghị **NestJS** nếu muốn cấu trúc rõ ràng, scalable, enterprise-friendly.
Nếu muốn đi nhanh hơn, có thể dùng Express + TypeScript + module pattern.

### 3. CMS framework
Khuyến nghị **React + Vite** vì nhanh, nhẹ, phù hợp admin app.

### 4. User app framework
Khuyến nghị **Next.js App Router** vì phù hợp routing, layouts, và long-term growth.

### 5. Database
Khuyến nghị **PostgreSQL + Prisma** vì rất phù hợp cho quan hệ:
- user -> challenges -> sessions
- dashboard aggregation
- migrations rõ ràng

---

# 12. Kết luận

Theo yêu cầu mới, solution nên được xây dựng theo mô hình:

- **1 source cho API**
- **1 source cho CMS bằng React**
- **1 source cho User App bằng Next.js**
- **1 PostgreSQL database**
- **1 Docker Compose để chạy tất cả cùng nhau**

Đây là kiến trúc hợp lý cho MVP nhưng vẫn đủ tốt để mở rộng về sau.
Nó giữ cho:
- backend độc lập
- admin UI độc lập
- end-user UI độc lập
- deployment và bảo trì rõ ràng

