# PingSpot

> **⚠️ Status: Under Active Development**  
> This project is currently in active development. Features and APIs may change as we continue to improve the platform.

**PingSpot** is a real-time, community-powered platform for reporting and tracking local issues on an interactive map. Whether it's a traffic jam, road hazard, flooding, or a broken streetlight, PingSpot empowers citizens to quickly share what's happening in their neighborhoods, helping communities and local authorities respond smarter and faster.

With live updates, instant notifications, and an engaging map interface, PingSpot turns every user into a valuable source of local information. Users can add reports with geolocation, photos, and descriptions, discuss issues in comment threads, and filter the map to find what matters most to them. Moderators and authorities can track trends, respond to urgent situations, and visualize community needs in real time.

## 🌟 Key Features

- **📍 Interactive Map Interface** - View and report community issues with geolocation support
- **💬 Discussion** - Threaded comment system with replies, mentions, and media support
- **🔔 Live Updates** - notifications for new or nearby reports
- **📊 Community Voting** - Track issue status through community voting (Resolved/On Progress/Not Resolved)
- **❤️ Reactions** - Like and react to reports
- **🔍 Advanced Filtering** - Filter by type, status, location, and date range
- **📱 Responsive Design** - Fully functional on desktop and mobile devices
- **🔐 Secure Authentication** - Email/Password and OAuth (Google) authentication
- **🖼️ Media Support** - Upload and view images for reports and comments
- **📈 Progress Tracking** - Visual timeline for report status updates

## 🏗️ Tech Stack

### Frontend (Client)
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Framework**: React 19
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Maps**: React Leaflet
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form + Zod validation
- **Date Handling**: date-fns

### Backend (Server)
- **Language**: Go 1.24
- **Framework**: Fiber v2
- **Database**: PostgreSQL (with PostGIS for geospatial data)
- **Cache**: Redis
- **NoSQL**: MongoDB
- **ORM**: GORM
- **Authentication**: JWT + OAuth (Google)
- **Background Jobs**: Asynq (Redis-based task queue)
- **Logging**: Uber Zap

## 📁 Project Structure

```
pingspot/
├── client/                    # Next.js frontend application
│   ├── public/               # Static assets
│   │   ├── fonts/           # Custom fonts
│   │   └── images/          # Image assets
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   │   ├── api/         # API proxy routes
│   │   │   ├── auth/        # Authentication pages
│   │   │   └── main/        # Main application pages
│   │   ├── components/      # Reusable React components
│   │   │   ├── feedback/    # Loading, error components
│   │   │   ├── form/        # Form inputs and validation
│   │   │   ├── layouts/     # Layout components
│   │   │   └── UI/          # UI primitives
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── auth/        # Authentication hooks
│   │   │   ├── main/        # Report and comment hooks
│   │   │   ├── toast/       # Toast notification hooks
│   │   │   └── user/        # User profile hooks
│   │   ├── lib/             # Utility libraries
│   │   ├── provider/        # Context providers
│   │   ├── services/        # API service functions
│   │   ├── stores/          # Zustand state stores
│   │   ├── types/           # TypeScript type definitions
│   │   │   ├── api/         # API response types
│   │   │   ├── global/      # Global types
│   │   │   └── model/       # Data model types
│   │   └── utils/           # Helper functions
│   └── package.json
│
└── server/                   # Go backend application
    ├── cmd/
    │   └── main.go          # Application entry point
    ├── internal/
    │   ├── config/          # Configuration management
    │   ├── domain/          # Domain services
    │   │   ├── authService/      # Authentication logic
    │   │   ├── reportService/    # Report management
    │   │   ├── searchService/    # Search functionality
    │   │   ├── taskService/      # Background tasks
    │   │   └── userService/      # User management
    │   ├── infrastructure/   # Infrastructure layer
    │   │   ├── cache/       # Redis cache
    │   │   └── database/    # Database connections
    │   ├── middleware/      # HTTP middlewares
    │   ├── migration/       # Database migrations
    │   ├── repository/      # Data access layer
    │   ├── router/          # Route definitions
    │   ├── server/          # Server setup
    │   └── worker/          # Background workers
    │       ├── asynqWorker/ # Async task workers
    │       └── cronWorker/  # Scheduled jobs
    ├── pkg/                 # Public packages
    │   ├── appError/        # Error handling
    │   ├── logger/          # Logging utilities
    │   └── utils/           # Helper utilities
    ├── uploads/             # File upload storage
    ├── docker-compose.yml   # Docker services
    ├── Makefile            # Build commands
    └── go.mod              # Go dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and npm/yarn/pnpm
- **Go** 1.24+
- **Docker** and Docker Compose (for databases)
- **PostgreSQL** 15+ (or use Docker)
- **Redis** (or use Docker)
- **MongoDB** (or use Docker)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pingspot
```

### 2. Setup Backend

#### Start Required Services

```bash
cd server

# Copy environment file
cp .env.example .env.dev

# Edit .env.dev with your configuration
# Update database credentials, API keys, etc.

# Start Docker services (PostgreSQL, Redis, MongoDB)
make up-dev
```

#### Install Dependencies & Run

```bash
# Install Go dependencies
go mod download

# Run database migrations (automatically on startup)

# Development mode (with hot reload using Air)
make run-dev

# Production mode
make run-prod

# Run tests
make test
```

**Server will run on**: `http://localhost:4000` (or your configured port)

### 3. Setup Frontend

```bash
cd client

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Create environment file
cp .env.example .env.local

# Edit .env.local
# Add your API URL and other configurations

# Run development server
npm run dev

# Build for production
npm run build
npm run start
```

**Client will run on**: `http://localhost:3000`

## ⚙️ Environment Configuration

### Backend (.env.dev) -> you can put it in (.env.prod) / (.env.test)

```env.dev:

# Application
PORT=4000
HOST=localhost
LOG_LEVEL=debug
NODE_ENV=development
IS_PRODUCTION=false
HTTP_ONLY=true

CLIENT_URL=http://localhost:3000

GITHUB_REPO_URL=your_github_repo_URL

# Database
POSTGRE_HOST=localhost
POSTGRE_PORT=5432
POSTGRE_USER=postgres
POSTGRE_PASSWORD=your_password
POSTGRE_DB=pingspot

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# MongoDB
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USER=admin
MONGO_PASSWORD=your_password
MONGO_DB=pingspot

# JWT
JWT_SECRET=your_jwt_secret_key
EMAIL_PASSWORD=your_email_password_app
EMAIL_EMAIL=your_email

# OAuth Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

ACCESS_TOKEN_AGE=500
REFRESH_TOKEN_AGE=100
```

### Client/Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=your_main_backend_API_URL
NEXT_PUBLIC_GOOGLE_AUTH_URL=backend_API_URL_for_auth_google_URL
NEXT_PUBLIC_REVERSE_LOCATION_URL=reverse_location_url
NEXT_PUBLIC_USER_STATIC_URL=backend_API_user_URL
NEXT_PUBLIC_MAIN_STATIC_URL=backend_API_main_url
```

## 📖 API Documentation

The backend provides RESTful API endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verification` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google callback OAuth login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password/email-verification` - Email verification for forgot password
- `POST /api/auth/forgot-password/link-verification` - Link verification for forgot password
- `POST /api/auth/forgot-password/reset-password` - Reset password for forgot password
- `POST /api/auth/refresh-token` - Refresh access token

### Report
- `POST /api/report` - Create new report
- `PUT /api/report/:reportID` - Update report
- `GET /api/report` - Get all reports (with filters)
- `DELETE /api/report/:reportID` - Delete report
- `POST /api/report/:reportID/reaction` - Give reaction to report
- `POST /api/report/:reportID/comment` - Upload comment to report
- `GET /api/report/:reportID/comment` - Get report comment
- `GET /api/report/:reportID/comment/replies/:commentID` - Get report comment's replies
- `POST /api/report/:reportID/vote` - Vote on report status
- `POST /api/report/:reportID/progress` - Create progress on report
- `GET /api/report/:reportID/progress` - Get report progress

### User
- `GET /api/user/profile` - Get user profile
- `GET /api/user/profile/:username` - Get user profile by username
- `POST /api/user/profile` - Save user profile
- `POST /api/user/security` - Save user security data

### Search
- `GET /api/search` - Search reports by keyword


## 🎨 Key Features Implementation

### Comment System with Threaded Replies

The comment system supports:
- **Root comments** and **nested replies**
- **Pagination** with infinite scroll (10 items per page)
- **Optimistic updates** for immediate UI feedback
- **Smart cache management** - avoids refetch when many replies exist
- **Auto-scroll** to load more button after replying
- **Mentions** support (@username)
- **Media attachments** (images)
- **Edit and delete** functionality

### Real-time Updates

- **TanStack Query** for efficient data synchronization
- **Optimistic updates** for instant feedback
- **Query invalidation** strategies for data freshness
- **Infinite queries** for pagination

### Map Integration

- **Leaflet** for interactive maps
- **Geolocation** support for automatic location detection
- **Markers** for report locations
- **Clustering** for better performance with many reports
- **Custom popups** with report preview


## 🧪 Testing

### Backend Tests
```bash
cd server
make test
```

### Frontend Tests
```bash
cd client
npm run test
```

## 🐳 Docker Deployment

```bash
cd server
docker-compose up -d

cd client
docker build -t pingspot-client .
docker run -p 3000:3000 pingspot-client
```

## 🔒 Security Features

- **JWT** authentication with refresh tokens
- **Password hashing** using bcrypt
- **OAuth 2.0** integration (Google)
- **CORS** configuration
- **Rate limiting** (Redis-based)
- **Input validation** (Zod on frontend, validator on backend)
- **SQL injection protection** (parameterized queries with GORM)
- **XSS protection** (sanitized inputs)

## 📊 Database Schema

### Main Tables
- **users** - User accounts and profiles
- **reports** - Community issue reports
- **report_comments** - Comments and replies
- **report_votes** - Status voting
- **report_reactions** - Likes and reactions
- **report_progress** - Status update timeline
- **sessions** - User sessions

## 🔧 Available Make Commands (Backend)

```bash
make run-dev     # Run with hot reload (Air)
make build       # Build the application
make run         # Run the application
make run-prod    # Run in production mode
make run-test    # Run in test mode
make test        # Run all tests
make up-dev      # Start Docker services
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Andrean Gusman Djabbar - Github: https://github.com/AndreanDjabbar

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Fiber team for the fast Go web framework
- All open source contributors

---

**PingSpot** - Bridging the gap between citizens and local responders, creating safer, smarter, and more connected communities.
