# BodyMart Admin Frontend

BodyMart Admin Frontend is a React + Vite dashboard for managing gym and retail operations from a single interface. It connects to a backend API for authentication, dashboard analytics, products, inventory, users, memberships, orders, deliveries, and reports.

## Features

- Authentication with login and registration flows
- Persistent session handling with token storage in `localStorage`
- Role-based navigation for `admin`, `stock_manager`, and `delivery_personnel`
- Dashboard overview with sales and order insights
- CRUD-ready modules for products, inventory, users, memberships, orders, deliveries, and reports
- Report analytics and CSV export support
- Light and dark theme toggle

## Tech Stack

- React 18
- React Router DOM 6
- Vite 5
- Axios

## Project Structure

```text
src/
  components/    Shared layout and navigation
  context/       Authentication and theme providers
  pages/         Route-level screens
  services/      API clients for each module
  styles/        Global styling
```

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm
- A running backend API

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Set the backend API base URL in `.env`:

   ```env
   VITE_API_BASE_URL=http://localhost:4000/api
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` starts the Vite development server
- `npm run build` creates a production build in `dist/`
- `npm run preview` serves the production build locally

## Routes and Modules

Public routes:

- `/login`
- `/register`

Protected modules:

- `/dashboard`
- `/products`
- `/inventory`
- `/users`
- `/memberships`
- `/orders`
- `/deliveries`
- `/reports`

Available modules depend on the signed-in user's role.

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL for the backend API | `http://localhost:4000/api` |

## API Notes

The frontend expects the backend to expose endpoints such as:

- `/auth/login`
- `/auth/register`
- `/dashboard`
- `/products`
- `/inventory`
- `/users`
- `/memberships`
- `/orders`
- `/deliveries`
- `/reports`

Authentication tokens are attached as a Bearer token after login or registration.

## Build Output

Production assets are generated in `dist/`.
