# BudgetFlow - Personal Finance Management Platform

BudgetFlow is a comprehensive personal finance management application that enables users to track expenses, manage budgets, set financial goals, and visualize their financial health.

## Features

- 💰 **Transaction Tracking** - Record and categorize income and expenses
- 📊 **Budget Management** - Set monthly budgets by category with real-time tracking
- 🎯 **Financial Goals** - Create and monitor savings goals
- 📈 **Analytics Dashboard** - Visualize spending patterns with interactive charts
- 🔐 **Secure Authentication** - Firebase-powered user authentication
- 👥 **Admin Panel** - User management and system monitoring
- 🌓 **Dark/Light Mode** - Customizable theme preferences

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS + shadcn/ui components
- TanStack Query for data fetching
- Recharts for data visualization
- Wouter for routing

### Backend
- Node.js with Express
- TypeScript
- Firebase Admin SDK for authentication
- Drizzle ORM for database management
- PostgreSQL (Neon) database

## 📚 Documentation

- **[Pre-Deployment Checklist](CHECKLIST.md)** - ✅ Step-by-step checklist before deploying
- **[Deployment Guide](DEPLOYMENT.md)** - Complete deployment instructions for Netlify and traditional servers
- **[Customization Guide](CUSTOMIZE.md)** - How to customize branding, colors, and features

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL database (recommend [Neon](https://neon.tech) for serverless PostgreSQL)
- Firebase project with Authentication enabled

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd budgetflow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- `DATABASE_URL` - Your PostgreSQL connection string
- `VITE_FIREBASE_API_KEY` - Firebase Web API key
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Deployment

> **📖 For complete deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

### Quick Start - Netlify Deployment

1. **Prepare Services**
   - Create [Neon](https://neon.tech) PostgreSQL database
   - Set up [Firebase](https://firebase.google.com) project with Authentication
   - Run database migration: `DATABASE_URL="your-url" npm run db:push`

2. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

3. **Deploy on Netlify**
   - Import project from GitHub
   - Add environment variables (see [.env.example](.env.example))
   - Deploy!

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed step-by-step instructions.

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `NODE_ENV` | Environment (production/development) | Yes |
| `PORT` | Server port (default: 5000) | No |

## Project Structure

```
budgetflow/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React contexts (Auth, Theme)
│   │   ├── lib/         # Utilities and configurations
│   │   ├── pages/       # Application pages
│   │   └── main.tsx     # Entry point
│   └── index.html
├── server/              # Backend Express application
│   ├── auth.ts         # Firebase authentication middleware
│   ├── routes.ts       # API routes
│   ├── storage.ts      # Database interface
│   └── index.ts        # Server entry point
├── shared/             # Shared types and schemas
│   └── schema.ts       # Database schema (Drizzle)
└── vite.config.ts      # Vite configuration
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push database schema changes

### Database Migrations

This project uses Drizzle ORM with schema push (not migrations):

```bash
npm run db:push
```

⚠️ **Warning**: Schema push will directly modify your database. Always backup production data before running.

## Admin Access

The first user to register with the email `gabe.rappold@gmail.com` will automatically receive admin privileges. You can modify this email in `server/routes.ts` before deploying.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
