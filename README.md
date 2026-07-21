# BodyMart Website

BodyMart Website is a Vite + React storefront for a fitness brand. It includes a marketing homepage, a product shop connected to a backend API, a membership signup flow, and an about page that surfaces store highlights from the backend.

## Features

- Landing page with brand messaging and calls to action
- Shop page with live product loading, search, and category filtering
- Simple cart flow with checkout submission to the backend
- Membership request form that sends new signups to the backend
- About page with live store highlight data
- Admin login link configurable through environment variables

## Tech Stack

- React 18
- React Router DOM
- Vite
- Axios

## Routes

- `/` - homepage
- `/shop` - product listing and cart entry point
- `/membership` - membership plans and signup form
- `/about` - brand details and store highlights

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_ADMIN_URL=http://localhost:5173/login
```

### Variable Notes

- `VITE_API_BASE_URL`: Base URL for the backend API used by the storefront
- `VITE_ADMIN_URL`: URL for the admin dashboard login page shown in the header

## Expected API Endpoints

The frontend expects the backend to expose these routes under `VITE_API_BASE_URL`:

- `GET /store/products`
- `GET /store/highlights`
- `POST /store/memberships`
- `POST /store/orders`

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

5. Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```text
src/
  components/    Shared layout components
  hooks/         Cart state and checkout logic
  pages/         Route-level pages
  services/      Axios client and API helpers
  styles/        Global styling
```

## Notes

- Product and membership data are loaded from a backend service and are not hardcoded in the UI.
- Checkout uses a lightweight in-memory cart and submits orders directly to the backend.
- The admin dashboard itself is a separate application linked from this frontend.
