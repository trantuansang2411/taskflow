# TaskFlow — Todo List App

Ứng dụng quản lý công việc (Todo List) với hệ thống phân quyền **Admin / Employee**, xác thực JWT, và giao diện React hiện đại.

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Backend | Node.js 20 + Express.js |
| Database | PostgreSQL 16 |
| Auth | JWT (Access Token 5m + Refresh Token 7d) |
| Frontend | React 19 + TypeScript + Vite |
| Container | Docker + Docker Compose |

## Phân quyền

| Role | Quyền |
|---|---|
| **Admin** | Tạo, sửa, xóa, giao việc cho nhân viên |
| **Employee** | Xem công việc được giao, tích hoàn thành |

> Tài khoản Admin được **cấp sẵn** — không thể đăng ký qua API.

---

## Cấu trúc Project

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Entry point
│   │   ├── config/database.js      # PostgreSQL connection
│   │   ├── controllers/            # HTTP handlers
│   │   ├── services/               # Business logic
│   │   ├── repositories/           # Database queries
│   │   ├── models/                 # Data schemas
│   │   ├── routes/                 # Route definitions
│   │   ├── middleware/             # auth, authorize, errorHandler
│   │   └── utils/                  # AppError, logger
│   ├── database/init.sql           # Schema + seed admin
│   ├── .env.example
│   ├── Dockerfile
│   └── docker-compose.yml
└── frontend/
    └── src/
        ├── api/                    # axios client + API calls
        ├── components/             # TodoCard, Modals
        ├── context/AuthContext.tsx
        ├── layouts/MainLayout.tsx
        └── pages/                  # Login, Register, AdminDashboard, EmployeeDashboard
```

---

## Yêu cầu hệ thống

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (khuyến nghị)
- **Hoặc** Node.js 20+ và PostgreSQL 16+ nếu chạy thủ công

---

## Cách 1: Chạy bằng Docker (Khuyến nghị)

> Không cần cài Node.js hay PostgreSQL — Docker lo tất cả.

### Bước 1 — Clone project

```bash
git clone <repo-url>
cd taskflow
```

### Bước 2 — Tạo file `.env` cho backend

```bash
cd backend
cp .env.example .env
```

Mở `backend/.env` và chỉnh các giá trị quan trọng:

```env
DB_PASSWORD=postgres123
JWT_SECRET=your_super_secret_key        # Đổi trước khi deploy!
JWT_REFRESH_SECRET=your_refresh_key     # Đổi trước khi deploy!
```

### Bước 3 — Build và khởi động

```bash
# Chạy từ thư mục backend/
cd backend
docker compose up --build
```

Lần đầu sẽ mất vài phút. Khi thấy log sau là sẵn sàng:

```
todo_app      | Server running on port 3000
todo_postgres | database system is ready to accept connections
```

Backend: **http://localhost:3000**

### Bước 4 — Chạy Frontend

Mở terminal mới:

```bash
cd frontend
npm install
npm run dev
```

Frontend: **http://localhost:5173**

### Dừng ứng dụng

```bash
cd backend

# Dừng containers nhưng giữ dữ liệu
docker compose down

# Dừng và XÓA toàn bộ dữ liệu (reset sạch)
docker compose down -v
```

> **Lưu ý:** Nếu thêm cột mới vào `init.sql`, phải chạy `docker compose down -v` để PostgreSQL đọc lại schema.

---

## Cách 2: Chạy thủ công (Không dùng Docker)

> Cần cài sẵn Node.js 20+ và PostgreSQL 16+.

### Bước 1 — Tạo database

Đăng nhập PostgreSQL và tạo database:

```sql
CREATE DATABASE todo_db;
```

Chạy file schema:

```bash
psql -U postgres -d todo_db -f backend/database/init.sql
```

### Bước 2 — Cài đặt backend

```bash
cd backend
cp .env.example .env
# Chỉnh .env cho đúng với cài đặt PostgreSQL local của bạn
npm install
npm run dev      # hoặc npm start cho production
```

Backend chạy tại: **http://localhost:3000**

### Bước 3 — Cài đặt frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại: **http://localhost:5173**

---

## Tài khoản mặc định

Khi khởi động lần đầu, hệ thống tự tạo sẵn 1 tài khoản Admin:

| Trường | Giá trị |
|---|---|
| Email | `admin@example.com` |
| Password | `Admin@123` |
| Role | `admin` |

> **Bảo mật:** Đổi mật khẩu này ngay sau khi deploy lên production bằng cách sửa `database/init.sql` rồi `docker compose down -v && docker compose up --build`.

Nhân viên tự đăng ký tài khoản tại `/register` — role mặc định là `employee`.

---

## API Endpoints

Base URL: `http://localhost:3000/api`

### Auth

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/auth/register` | Đăng ký tài khoản employee | Không |
| POST | `/auth/login` | Đăng nhập, trả về tokens | Không |
| POST | `/auth/refresh` | Lấy access token mới | Không |
| POST | `/auth/logout` | Đăng xuất, xóa refresh token | Bearer token |

### Todos

| Method | Endpoint | Mô tả | Role |
|---|---|---|---|
| GET | `/todos` | Lấy danh sách todos (có phân trang) | Admin + Employee |
| POST | `/todos` | Tạo todo mới | Admin only |
| PUT | `/todos/:id` | Cập nhật todo | Admin only |
| DELETE | `/todos/:id` | Xóa todo | Admin only |
| PATCH | `/todos/:id/status` | Toggle trạng thái (pending ↔ completed) | Employee only |
| PATCH | `/todos/:id/assign` | Giao việc cho nhân viên | Admin only |
| GET | `/todos/meta/employees` | Lấy danh sách nhân viên | Admin only |

### Query Parameters cho GET `/todos`

```
?page=1          # Trang hiện tại (mặc định: 1)
?limit=5         # Số todo mỗi trang (mặc định: 5)
?status=pending  # Lọc theo trạng thái (pending / completed)
?search=keyword  # Tìm kiếm theo tiêu đề
```

### Response mẫu — Đăng nhập thành công

```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

---

## Hướng dẫn sử dụng

### Đăng nhập Admin

1. Mở **http://localhost:5173/login**
2. Nhập email `admin@example.com`, mật khẩu `Admin@123`
3. Vào **Admin Dashboard** với đầy đủ quyền quản lý

### Đăng ký tài khoản nhân viên

1. Mở **http://localhost:5173/register**
2. Điền username, email, mật khẩu
3. Đăng nhập để xem công việc được giao

### Quy trình Admin

1. **Tạo công việc** → Nhấn "Create Task", điền tiêu đề + mô tả
2. **Giao việc** → Nhấn icon giao việc trên card, chọn nhân viên
3. **Sửa / Xóa** → Nút Edit (chỉ task chưa hoàn thành) hoặc Delete
4. **Theo dõi** → Stats row trên đầu dashboard

### Quy trình Employee

1. Đăng nhập → thấy danh sách công việc được giao
2. Nhấn icon ✓ để đánh dấu hoàn thành hoặc quay lại pending

---

## Biến môi trường

File `backend/.env`:

| Biến | Mặc định | Mô tả |
|---|---|---|
| `PORT` | `3000` | Port backend |
| `DB_HOST` | `localhost` | Host PostgreSQL |
| `DB_PORT` | `5432` | Port PostgreSQL |
| `DB_NAME` | `todo_db` | Tên database |
| `DB_USER` | `postgres` | User PostgreSQL |
| `DB_PASSWORD` | `postgres123` | Mật khẩu PostgreSQL |
| `JWT_SECRET` | — | Khóa ký access token (**bắt buộc đổi!**) |
| `JWT_EXPIRES_IN` | `15m` | Thời hạn access token |
| `JWT_REFRESH_SECRET` | — | Khóa ký refresh token (**bắt buộc đổi!**) |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Thời hạn refresh token |
| `BCRYPT_ROUNDS` | `10` | Độ phức tạp hash mật khẩu |

---

## Lưu ý khi deploy Production

- Đổi `JWT_SECRET` và `JWT_REFRESH_SECRET` thành chuỗi ngẫu nhiên dài (>= 32 ký tự)
- Đổi mật khẩu admin trong `database/init.sql` trước khi build
- Đặt `NODE_ENV=production`
- Không commit file `.env` lên Git
