# ApexStore

A complete, full-stack e-commerce web application built with Node.js, Express, and vanilla JavaScript.

## ✨ Features

| Feature | Details |
|---|---|
| **Home Page** | Hero, featured products, categories, testimonials, footer |
| **Products Page** | Grid, search, category filter, price filter, sort |
| **Product Detail** | Images, description, price, add-to-cart with quantity |
| **Shopping Cart** | Add/remove items, quantity control, order summary, checkout |
| **Authentication** | Register, login, logout, password hashing (bcrypt), input validation |
| **User Dashboard** | Profile, order history, account stats |
| **Admin Dashboard** | Add/edit/delete products, view & manage orders, view & delete users |
| **Contact Page** | Validated contact form with success state |
| **About Page** | Team, values, company story |
| **404 Page** | Custom not-found with quick links |

## 🔐 Security

- Passwords hashed with **bcrypt** (10 rounds)
- **Helmet** middleware (CSP, XSS, HSTS headers)
- **Rate limiting** (300 req/15min global, 20 req/15min on auth routes)
- **Input validation** with `express-validator`
- HTTP-only session cookies
- CSRF-safe (same-site session handling)

## 🗂 Project Structure

```
apexstore/
├── server.js           # Express app entry point
├── package.json
├── .env                # Environment variables
├── database/
│   └── data.json       # JSON flat-file database
├── models/
│   ├── User.js         # User CRUD + bcrypt auth
│   ├── Product.js      # Product CRUD with filtering
│   └── Order.js        # Order CRUD
├── middleware/
│   ├── auth.js         # requireAuth / requireGuest
│   └── admin.js        # requireAdmin
├── routes/
│   ├── auth.js         # POST /api/auth/register|login|logout, GET /api/auth/me
│   ├── products.js     # Full product CRUD
│   ├── orders.js       # Order placement & management
│   └── users.js        # User profile & admin user management
├── public/
│   ├── css/style.css   # Complete responsive stylesheet
│   └── js/
│       ├── main.js     # Shared utilities, navbar, auth state, products
│       ├── cart.js     # CartStore (localStorage) + cart page UI
│       └── auth.js     # Login/register form logic
└── views/              # HTML pages (served by Express)
    ├── index.html      products.html   product.html
    ├── cart.html       login.html      register.html
    ├── dashboard.html  admin.html      contact.html
    ├── about.html      404.html
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or pnpm

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file (already provided, edit if needed)
# .env is pre-configured for development

# 3. Start the server
npm start
```

The app runs at **http://localhost:3000**

For development with auto-reload:
```bash
npm run dev   # requires nodemon (installed as devDependency)
```

## 🧪 Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@apexstore.com | Password1 |
| **User** | jane@example.com | Password1 |

> Passwords in `data.json` are pre-hashed with bcrypt.

## 📡 API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |

### Products (Public)
| Method | Path | Description |
|---|---|---|
| GET | /api/products | List all (supports ?search, ?category, ?sort, ?minPrice, ?maxPrice) |
| GET | /api/products/featured | Featured products |
| GET | /api/products/categories | All categories |
| GET | /api/products/:id | Single product |

### Products (Admin only)
| Method | Path | Description |
|---|---|---|
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |

### Orders
| Method | Path | Description |
|---|---|---|
| GET | /api/orders/mine | My orders (auth) |
| POST | /api/orders | Place order (auth) |
| GET | /api/orders | All orders (admin) |
| PUT | /api/orders/:id/status | Update status (admin) |

### Users
| Method | Path | Description |
|---|---|---|
| GET | /api/users/me | My profile (auth) |
| PUT | /api/users/me | Update profile (auth) |
| GET | /api/users | All users (admin) |
| DELETE | /api/users/:id | Delete user (admin) |

## 🌐 Deployment (Replit)

1. Upload all files to your Replit project
2. In the Replit shell: `npm install`
3. Set the `SESSION_SECRET` environment variable in Replit Secrets
4. Click **Run** — the server starts on the port Replit assigns

For other platforms (Railway, Render, Heroku):
- Set `PORT` (auto-detected) and `SESSION_SECRET` environment variables
- Set `NODE_ENV=production`
- Run `npm start`

## 🔧 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | 3000 | Server port |
| `SESSION_SECRET` | dev fallback | Change in production! |
| `NODE_ENV` | development | Set to `production` in prod |
