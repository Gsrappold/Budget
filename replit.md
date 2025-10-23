# BudgetFlow - Personal Finance Management Platform

## Overview

BudgetFlow is a comprehensive personal finance management application that enables users to track expenses, manage budgets, set financial goals, and visualize their financial health. The platform combines a modern React frontend with a Node.js/Express backend, using Firebase for authentication and PostgreSQL (via Neon) for data persistence.

The application provides financial tracking capabilities including transaction management, budget monitoring, savings goals, and analytics dashboards with visual charts. It features an admin panel for user management and follows Material Design principles combined with financial dashboard best practices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing

**UI Component System**
- shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- Tailwind CSS with custom design tokens for consistent styling
- Design follows hybrid approach: Financial dashboard patterns (Mint, YNAB) + Material Design principles
- Typography system uses Inter/DM Sans for data clarity and JetBrains Mono for numerical values
- Custom CSS variables for theme support (light/dark mode)

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management, caching, and synchronization
- Context API for global state (authentication, theme)
- Form state managed by React Hook Form with Zod validation

**Data Visualization**
- Recharts library for financial charts (pie charts, line charts, bar charts)
- Responsive charts that adapt to container sizing

### Backend Architecture

**Server Framework**
- Express.js running on Node.js with TypeScript
- ESM module system for modern JavaScript support
- Session management using connect-pg-simple for PostgreSQL-backed sessions

**API Design**
- RESTful API endpoints organized by resource type (users, transactions, budgets, goals, categories)
- Authentication middleware validates Firebase ID tokens on protected routes
- Admin-only routes protected by role-based middleware
- Standardized error handling and response formatting

**Authentication & Authorization**
- Firebase Authentication for user identity management
- Token-based authentication using Firebase ID tokens
- Backend validates tokens via Firebase Admin SDK
- Role-based access control with admin privileges for specific users
- User synchronization endpoint creates/updates database records on login

### Data Storage

**Database**
- PostgreSQL database hosted on Neon (serverless PostgreSQL)
- Drizzle ORM for type-safe database queries and schema management
- WebSocket connection pooling via @neondatabase/serverless

**Schema Design**
- Users table stores Firebase UID, email, display name, and admin status
- Categories table for income/expense categorization with icons and colors
- Transactions table tracks all financial transactions with support for recurring entries
- Budgets table manages spending limits per category with rollover support
- Goals table tracks savings objectives with progress monitoring
- Admin logs table for audit trail of administrative actions
- Foreign key relationships with cascade deletes maintain data integrity

**Data Validation**
- Drizzle-Zod integration generates runtime validation schemas from database schema
- Client and server both validate data using shared Zod schemas
- Type safety enforced across the full stack

### External Dependencies

**Authentication Service**
- Firebase Authentication provides OAuth (Google) and email/password authentication
- Firebase Admin SDK validates tokens server-side
- Environment variables configure Firebase project settings

**Database Provider**
- Neon serverless PostgreSQL for scalable, managed database hosting
- Connection via DATABASE_URL environment variable
- WebSocket support for efficient connection pooling

**Third-Party Libraries**
- Radix UI primitives for accessible component foundations
- Lucide React for consistent iconography
- date-fns for date manipulation and formatting
- Recharts for data visualization

**Development Tools**
- Replit-specific plugins for development environment integration
- TypeScript for static type checking
- ESBuild for fast production builds
- Drizzle Kit for database migrations

### Design System

**Visual Design Principles**
- Clarity over decoration - financial data must be scannable
- Consistent information hierarchy across views
- Professional trust signals throughout interface
- Efficient use of screen space for data-dense interfaces
- Minimal decorative animation for stable interactions

**Typography Scale**
- Tabular numbers for proper alignment of currency values
- Monospace font for numerical data consistency
- Clear hierarchy from dashboard headers (text-3xl) to helper text (text-xs)

**Spacing System**
- Primary spacing units: 2, 3, 4, 6, 8, 12, 16
- Consistent component padding and section spacing
- Grid gaps optimized for financial data presentation