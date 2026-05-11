# Bookly Bookstore E-Commerce Platform

A full-stack e-commerce application for an online bookstore, built with Node.js, Express, and SQLite. This project demonstrates a complete MVC architecture with secure user authentication, robust product management, and a seamless checkout functionality.

## 🏗️ Architecture Overview

### Backend (Node.js + Express)
- **Framework**: Express.js for RESTful API development
- **Database**: SQLite for lightweight, file-based data storage (abstracted via a service layer)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt for secure password hashing
- **Security**: strict rate-limiting, Helmet security headers, CORS policies, and comprehensive input validation
- **Architecture Pattern**: MVC (Model-View-Controller) with a clear service layer for business logic

### Frontend
- **Static HTML/CSS/JS**: Client-side interface
- **Styling**: Custom CSS with Bootstrap 5
- **Interactivity**: Vanilla JavaScript services (e.g., `cartService.js`, `productLoadService.js`, `loginService.js`) handling dynamic DOM updates and secure API communication.

### Project Structure
```
├── src/
│   ├── app.js                 # Main Express application
│   ├── config.js              # Centralized environment configuration
│   ├── controllers/           # Request handlers (Auth, Products, Checkout)
│   ├── routes/                # API route definitions
│   └── services/              # Business logic and database operations
├── public/                    # Static frontend files (HTML, CSS, JS)
├── data/                      # SQLite database files
└── package.json               # Dependencies and scripts
```

## 🚀 Features

- **User Authentication**: Secure registration, login, and JWT-based session management with strict password complexity enforcement.
- **Product Catalog**: Browse, search, and filter books seamlessly with dynamic DOM rendering.
- **Shopping Cart**: Client-side persistent cart state with server-side validation during checkout to prevent tampering.
- **Checkout System**: Tokenized payment processing (simulated) and order history management.
- **Security-First**: Protections against Brute Force, XSS, SQL Injection, and IDOR vulnerabilities.

---

## 🛠️ Setup Instructions

Follow these simple steps to run the project locally.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` (comes with Node.js)

### 1. Install Dependencies
Open your terminal in the root directory of the project and run:
```bash
npm install
```

### 2. Environment Configuration
The project uses environment variables for configuration. We have provided a template for you.
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `.env` file looks something like this (you can leave the defaults for local testing):
```env
PORT=3000
BASE_URL=http://localhost:3000
NODE_ENV=development
DB_PATH=./data/store.db
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5501,http://localhost:5501
```

### 3. Database Initialization
You **do not** need to install a separate database server. The application uses a local SQLite database file. 
On the first run, the system will automatically create the `store.db` file in the `data/` folder and populate the necessary tables (users, products, orders, order items).

### 4. Start the Server
Start the backend API server by running:
```bash
npm start
```
You should see: `Bookly Architect: Server running on http://localhost:3000`

### 5. Access the Application
The backend API is now running on port 3000. 

To use the application frontend:
1. You can serve the static frontend files using an extension like **Live Server** in VSCode or any simple static server.
2. Open `index.html` in your browser via the local server (e.g., `http://127.0.0.1:5501`).
3. The frontend is pre-configured to securely communicate with the backend running on `localhost:3000`.

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration (requires strict password complexity)
- `POST /api/auth/login` - User login (returns JWT token)

### Products
- `GET /api/products` - Get all products (supports pagination and category filtering)
- `GET /api/products/:id` - Get product by ID

### Checkout (Requires Authentication)
- `POST /api/checkout` - Process order (requires `Authorization: Bearer <token>` header)

---

## 🔒 Security Posture

This project was built with a strong emphasis on security:

- **Password Storage**: Uses `bcrypt` with a strong salt round for password hashing.
- **Stateless Authentication**: Uses `JWT` for session management to prevent session hijacking.
- **XSS Prevention**: Frontend services utilize an `escapeHtml` utility to sanitize dynamic content before injecting it into the DOM.
- **Rate Limiting**: `express-rate-limit` protects authentication endpoints against brute-force and credential-stuffing attacks.
- **Anti-Injection**: All database queries use parameterized SQLite statements to completely mitigate SQL Injection.
- **Data Integrity**: The checkout process strictly re-verifies cart totals, prices, and quantities against the database to prevent parameter tampering.

---

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the ISC License.