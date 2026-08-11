# CoreStack - CA Firm ERP

CoreStack is a comprehensive Enterprise Resource Planning (ERP) platform designed specifically for Chartered Accountant (CA) firms and professional service organizations. It centralizes client management, employee workload, document storage, billing, and reporting into a single, cohesive workspace.

## Features

- **Role-Based Authentication**: Secure access with strict scoping for Super Admins, Admins, Managers, and Employees.
- **Client Management**: A centralized directory for all client information, documents, and associated personnel.
- **Employee Portal**: Dedicated workspaces for team members to manage their workload, assigned clients, and tasks.
- **Task Management (Kanban)**: Drag-and-drop task boards for tracking progress, deadlines, and responsibilities.
- **Document Vault**: Secure document storage with versioning and access control.
- **Billing & Invoicing**: Integrated tools for generating invoices, tracking payments, and managing outstanding balances.
- **Reports & Analytics**: Real-time dashboards providing insights into revenue, performance, and operational bottlenecks.
- **Audit Trails**: Comprehensive activity logging for compliance and transparency.
- **Responsive Design**: Fully optimized UI that adapts from ultra-wide desktop monitors down to mobile screens.

## Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management & Routing**: React Router DOM + Context API
- **Form Handling**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd CA-personal
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Start the local development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

The built assets will be available in the `dist` directory.

## Project Structure

- `/src/components` - Reusable UI components (buttons, modals, tables)
- `/src/context` - React contexts (Auth, Notifications)
- `/src/layouts` - Global layouts (AuthLayout, ProtectedLayout)
- `/src/modules` - Domain-specific feature modules (clients, billing, tasks, etc.)
- `/src/pages` - Public routing pages (LandingPage, Login, Register)
- `/src/services` - Mock data services (to be replaced with API calls)
- `/src/types` - TypeScript interfaces and types

## Current Status

This is currently a **frontend-only prototype**. Data persistence is managed via LocalStorage utilizing mock services located in `/src/services`. Backend integration for secure authentication, database persistence, and file storage will be implemented in future phases.

## License

© 2026 CoreStack. All rights reserved.
