# MERN E-Commerce App Documentation

This guide walks through building a full-stack MERN (MongoDB, Express, React, Node.js) e-commerce application with an admin panel. It covers project setup, directory structure, features, API design, frontend-backend integration, and deployment on Render. Citations to authoritative sources are included for key steps and best practices.

## 📦 Tech Stack

- **Frontend:** React (with Hooks), React Router DOM for client-side routing, Context API for state management, Tailwind CSS for styling, Axios for HTTP calls.
- **Backend:** Node.js with Express.js, MongoDB with Mongoose ODM, JSON Web Tokens (jsonwebtoken) for auth, bcryptjs for password hashing, and Express middleware for error handling and authorization.

This combination (the MERN stack) is popular for scalable web apps and is well-documented by the community.

## 🔹 Frontend Documentation

### 1. Overview

The React frontend implements the user interface and features such as:

- **Product listing and browsing:** Displays products and categories.
- **Cart management:** Users can add/remove products, update quantities, and view subtotal.
- **Authentication:** Users can register, log in, and manage their profile (using JWT tokens stored client-side).
- **Checkout:** A flow to review cart items, enter shipping details, and place orders.
- **Admin Dashboard:** Allows admin users to manage products, users, and orders (e.g. create/edit/delete products).

### 2. Project Setup

Initialize the React application and install dependencies:

- Use a tool like `npx create vite@latest frontend` (or similar scaffolding) to create the frontend folder.
- Navigate into the folder and install needed libraries, e.g.: React Router DOM (`react-router-dom`) for routing, Tailwind CSS for styling, and Axios for HTTP requests.
- Set up Tailwind by creating its config (`npx tailwindcss init`) and linking it in CSS.

The `create vite@latest` setup provides a development server (`npm start`), and it supports adding a `"proxy": "http://localhost:9000"` field in `package.json` to forward API calls to the Express server in development, avoiding CORS issues. For example:

```
"proxy": "http://localhost:9000"
```

This ensures calls to relative paths like `/api/products` are automatically proxied to the backend during development.

### 3. Folder Structure

A clear directory layout helps maintain the code. A common pattern is:

```
frontend/
└── src/
    ├── components/      # Reusable UI components (e.g. Header, Footer, ProductCard, Forms)
    ├── pages/           # Page components for each route (Home, ProductDetail, Cart, etc.)
    ├── context/         # React Context providers for global state (ProductContext, CartContext, etc.)
    ├── App.js           # Main app component with Routes defined
    ├── index.js         # Entry point
```

This mirrors standard React organization: all source files under `src/`, with separation of components, pages, and context. Each component file exports a React component (often one component per file). For example, `src/components/ProductCard.js` might define how a product preview looks.

### 4. Routing (React Router DOM)

Use React Router to map URLs to pages. Typical routes include:

- `/home` – **Home:** Lists all products (optionally with pagination and search).
- `/product/:id` – **Product Details:** Shows details for a single product by its ID.
- `/cart` – **Cart:** Shows items added to the cart; allows updating quantities or removing items.
- `/login` – **Login:** User login form.
- `/` – **Register:** User registration form.
- `/profile` – **Profile:** Shows user details and order history.
- `/admin/products` – **Admin Products:** Admin view to create/edit products.
- `/admin/users` – **Admin Users:** Admin view to manage users.
- `/admin/orders` – **Admin Orders:** Admin view to track all orders.

Each route loads the corresponding page component. React Router’s `<Route>` components in `App.js` can be nested or configured to match these paths. The UI (like navigation links) updates the URL and renders pages without full reloads.

### 5. State Management (Context API)

To manage application state (such as product data, cart contents, user info, and orders) across components, the Context API is used. Context lets components access shared state without passing props down many levels. Typical contexts:

- **ProductContext:** Holds product list and product-related actions (e.g. fetch products from API).
- **CartContext:** Tracks items in the shopping cart (add/remove/update), calculates totals, and stores cart state (often in localStorage for persistence).
- **UserContext:** Manages user authentication state (token, user info) and profile updates.
- **OrderContext:** Contains order history and current order info after checkout.

Using Contexts, any component (e.g. a product card, cart page, or admin dashboard) can access the global state and dispatch actions. For instance, adding an item to cart would call a function in `CartContext`, which updates the state and persists the new cart array. The Context API helps share state across components **without prop-drilling**, making the app easier to maintain. (Redux is an alternative for even larger apps, but Context is simpler for medium-sized apps like this.)

### 6. API Calls

All communication with the backend goes through Axios HTTP requests. Key points:

- **Base URL:** Configure Axios to point to the backend (e.g. `axios.defaults.baseURL = 'http://localhost:9000/api';`).
- **Auth Headers:** When the user logs in, receive a JWT token. Store it (e.g. in Context or localStorage) and attach it to subsequent requests (e.g. via an Axios interceptor or default header) for protected endpoints. For example, setting `axios.defaults.headers.common['Authorization'] = 'Bearer ' + token` ensures every request includes the token.
- **Error handling:** Use Axios interceptors or try/catch blocks to handle API errors (e.g. display messages on 4xx/5xx errors).

By centralizing Axios configuration (for base URL and headers) and interceptors, you avoid repeating code for each request. The interceptor can automatically add the token and handle refresh logic if needed (advanced). This simplifies calling endpoints like `GET /api/products`, `POST /api/orders`, etc., directly from the frontend code.

### 7. UI Components

Break down the UI into reusable components, for example:

- **Layout components:** `Header` and `Footer` appear on all pages. Header usually has navigation links and cart icon (with item count from context).
- **ProductCard:** Displays a product image, name, price, and “Add to Cart” button. Used on home and admin pages.
- **Forms:** Separate components for `LoginForm`, `RegisterForm`, `ProfileForm`, and admin product forms. These handle inputs, validations, and submit to API.
- **Loader and Alerts:** Visual feedback components (like a spinner during API calls, or an alert banner for errors).

Design the UI with Tailwind CSS for quick styling. Tailwind’s utility classes make it easy to craft responsive layouts (mobile-first) and adapt design quickly. For example, product grids can use Tailwind’s grid classes.

### 8. Cart & Checkout Flow

Implement these shopping features:

- **Add to Cart:** On a product page or listing, allow adding an item to the cart context with quantity.
- **View Cart:** The `/cart` page lists all cart items (with thumbnails, name, price, quantity). Users can update quantities or remove items. Recalculate subtotal (sum of price × qty) and total (including any taxes/shipping).
- **Checkout:** On the checkout page, show cart summary and form for shipping details. Upon confirmation, send a `POST /api/orders` request with order data (items, shipping address, total, and user ID). After success, clear the cart.

All calculations (like subtotal) are done on the frontend using data from the CartContext. For security, the backend should re-verify prices and totals (in case of tampering) before finalizing an order.

### 9. Admin Features

The admin panel provides CRUD operations:

- **Product Management:** Admin can create new products (`POST /api/products`), edit existing ones (`PUT /api/products/:id`), or delete them. Use a dedicated admin route component (e.g. `/admin/products`) listing all products with “Edit” and “Delete” buttons.
- **User Management:** View all registered users (`GET /api/users`) and promote or disable accounts.
- **Order Management:** List all orders (`GET /api/orders`) with details. Admin can update order status (e.g. mark as shipped).

Admin routes and actions should be protected by checking that the authenticated user’s `isAdmin` flag is true. The backend will verify the JWT token and authorize admin-only routes. On the frontend, you can also hide admin links unless the user context indicates an admin.

---

## 🔸 Backend Documentation

### 1. Overview

The backend is a RESTful API built with Node.js and Express. It uses MongoDB (via Mongoose) for data storage. Main responsibilities:

- Serve JSON data for products, users, and orders.
- Handle user authentication (registration/login with JWT).
- Enforce access control for protected and admin routes.
- Process orders and payments (if integrated later).
- Provide data to the admin panel.

### 2. Setup

Create the backend folder and initialize npm:

- `mkdir backend && cd backend && npm init -y`
- Install dependencies: `npm install express mongoose dotenv jsonwebtoken bcryptjs cors express-async-handler`.

  - **express:** Web server framework.
  - **mongoose:** MongoDB ODM (defining schemas/models).
  - **dotenv:** Load environment variables from `.env`.
  - **jsonwebtoken & bcryptjs:** For auth (tokens and password hashing).
  - **cors:** Middleware to allow cross-origin requests (for production).
  - **express-async-handler:** To simplify async error handling in routes.

### 3. Folder Structure

Organize the backend code:

```
backend/
├── config/        # Configuration files (e.g., db.js for DB connection)
├── controllers/   # Route handler functions (for users, products, orders)
├── models/        # Mongoose schemas/models (User, Product, Order)
├── routes/        # Express routers for each resource (/api/users, /api/products, /api/orders)
├── middleware/    # Custom middleware (auth checks, error handlers)
├── server.js      # App entry point (sets up Express, middleware, routes)
```

Example: `models/Product.js` defines the Product schema, `controllers/productController.js` implements logic for fetching products, and `routes/productRoutes.js` maps HTTP verbs to controller functions.

### 4. Models

Define Mongoose schemas for main entities:

- **User:** Fields might include `userName`, `email`, `password` (hashed), and `role` (Boolean). Add a method to the model to verify password (with bcrypt) and to generate JWT.
- **Product:** Fields include `name`, `price`, `brand`, `category`, `countInStock`, `image` URL, and `description`. Store necessary details for listing and cart.
- **Order:** Fields include a reference to the user (`user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }`), an array of items (with `product`, `qty`, `price`), shipping address, `totalPrice`, order `status`, and timestamps for created/paid/shipped dates.
- **Cart:** Fields include a reference to the user (`user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }`), an array of items (with `product`, `qty`, `price`), and calculated `totalPrice`.

Use Mongoose schema options (like `timestamps: true`) to auto-track creation dates. Ensure to index or optimize queries as needed for performance (for example, indexing product names for search).

### 5. Authentication

Implement routes for **Register** and **Login**:

- **POST /api/users/register:** Create a new user. Hash the password with bcrypt before saving. Respond with user info and a JWT token.
- **POST /api/users/login:** Verify email and password. If valid, respond with user data and JWT token.

JWT is signed with a secret (e.g. from `process.env.JWT_SECRET`) and includes the user ID. Store the token on the client to authorize protected requests. Use Express middleware to protect routes: e.g. a function that extracts the token from the `Authorization` header, verifies it, and attaches `req.user` to the request object. A separate middleware can check `req.user.isAdmin` for admin routes.

### 6. API Routes

Implement RESTful endpoints (conventionally under `/api`) such as:

- **Users:**

  - `POST /api/users/login` – Authenticate and get token.
  - `POST /api/users/register` – Create a new user.
  - `GET /api/users/profile` – Get logged-in user’s profile (protected).
  - `PUT /api/users/profile` – Update profile (protected).
  - _Admin-only:_ `GET /api/users` – List all users; `DELETE /api/users/:id` – Delete user; `GET /api/users/:id` – Get user by ID for admin.

- **Products:**

  - `GET /api/products` – Get all products (with optional filters or pagination).
  - `GET /api/products/:id` – Get single product by ID.
  - _Admin-only:_ `POST /api/products` – Create new product; `PUT /api/products/:id` – Update product; `DELETE /api/products/:id` – Delete product.

- **Orders:**

  - `POST /api/orders` – Create a new order (protected).
  - `GET /api/orders/myorders` – Get orders of logged-in user.
  - `GET /api/orders/:id` – Get order by ID (protected; allow only owner or admin).
  - `PUT /api/orders/:id/pay` – Mark order as paid (e.g. after payment).
  - _Admin-only:_ `GET /api/orders` – Get all orders; `PUT /api/orders/:id/deliver` – Mark as delivered.

Controllers handle the logic (database queries and business rules) and return JSON. Use Express routers to connect these endpoints. Return proper HTTP status codes (200/201 for success, 400 for bad request, 401 for auth error, 404 for not found, etc.).

### 7. Error Handling

Set up middleware to catch errors:

- **404 Not Found:** If a route is not matched, send a 404 response (e.g. a middleware at the end of routers).
- **General Error Handler:** A middleware with four arguments `(err, req, res, next)` can format errors into JSON responses. You can check for Mongoose validation errors or JWT errors and set `res.status` accordingly.

Using a package like `express-async-handler` in routes lets you throw errors from async controllers, and the error-handling middleware will catch them. Always return meaningful error messages so the frontend can show them to the user if needed.

### 8. Env Variables (`.env`)

Create a `.env` file to store secrets (do NOT commit this). Typical variables:

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/yourDB
JWT_SECRET=YourJWTSecret
```

Load these in `server.js` using `require('dotenv').config()`. Use `process.env.PORT` and `process.env.MONGO_URI` when connecting Express and Mongoose. This keeps sensitive info (like database credentials) out of code.

### 9. Seeder Script (Optional)

For development convenience, you can create a script to pre-populate the database with sample products and a test user. This can read JSON files and insert into MongoDB (using Mongoose). Run it manually (e.g. `node seed.js`) so you have products to display immediately.

### 10. Connecting Frontend and Backend

In development, run both servers concurrently (React on port 3000, Express on 5000 by default). Use the React proxy (as mentioned above) or configure CORS in Express (`app.use(cors())`) so the frontend can call backend APIs. In production (after building React), you will serve the React files from Express (see below).

All API calls from the frontend (using Axios) should use the relative paths corresponding to the backend endpoints (e.g. `/api/products`, `/api/users/login`). The proxy setting makes sure these calls work in development. In production, the frontend and backend will be on the same host (Express serves React files and API routes), so requests to `/api/...` will hit the same server.

### 11. Deployment Tips (Render)

To deploy on a platform like [Render.com](https://render.com):

1. **Build React App:** In your local repo, run `npm run build` in the frontend. This creates a `build/` folder with static files. Move or copy this `build` folder into your Express backend directory (e.g. into `backend/`).
2. **Serve Static Files:** In your Express `server.js`, add middleware to serve the React build:

   ```js
   const path = require("path");
   app.use(express.static(path.join(__dirname, "build")));
   // Fallback to React's index.html for unmatched routes
   app.get("*", (req, res) => {
     res.sendFile(path.join(__dirname, "build", "index.html"));
   });
   ```

   This ensures any request not handled by API routes returns the React app, enabling client-side routing.

3. **Git and Render Setup:** Push your combined backend+frontend repo to GitHub. On Render, create a new Web Service, link the GitHub repo, and set the build command to install dependencies and run `npm start` or `node server.js`. Make sure to set environment variables (e.g. `MONGO_URI`, `JWT_SECRET`) in the Render dashboard under Environment.
4. **Frontend Proxy:** Before building, ensure the React `package.json` proxy field points to the production API URL or omit it. In production, React will fetch from the same origin, so you may remove or update the proxy.
5. **Start Scripts:** In `package.json` under scripts, you might have:

   ```json
   "start": "node server.js",
   "heroku-postbuild": "cd frontend && npm install && npm run build"
   ```

   (Alternatively, use Render’s build command to build front and back).

6. **Continuous Deployment:** Enable automatic deploy on push. Render will rebuild and restart when you push to the branch (e.g. `main`).
7. **Verify:** After deployment, Render provides a URL. Visit it to ensure the site loads and API functions work. Test user signup/login, product listing, cart, and admin features to confirm the full stack is working.

These steps ensure the React build and Express server are bundled into one service. The Express static serving line (`app.use(express.static(path.join(__dirname, 'build')))`) is key for production deployment.

---

## 🧠 Student Assignments

### Mini Tasks

1. **Product Search:** Add a search bar on the home page to filter products by name or category. Create a search route in the backend or filter on the frontend.
2. **Pagination:** For large product catalogs, implement pagination (backend returns products by page, and frontend has next/prev buttons).
3. **Product Reviews:** Extend the `Product` model to include reviews (with rating, comment, user). Allow logged-in users to leave reviews, and display average rating on product pages.

### Advanced Tasks

1. **Image Uploads:** Integrate a file upload (e.g. using [Cloudinary](https://cloudinary.com/)). Allow admins to upload product images instead of just using URLs.
2. **Payment Gateway:** Add a payment step (e.g. integrate with Stripe or PayPal) to charge users during checkout.
3. **Invoice PDF:** After an order is placed, generate an invoice PDF (using a library like `pdfkit`) and email it to the user or provide a download.

These tasks build on the basic structure and add real-world features. They encourage understanding of file storage, third-party APIs, and document generation.

---

## ✅ Summary

This documentation outlined a step-by-step approach to build a MERN-stack e-commerce application with an admin panel. Key points:

- **Frontend:** Set up with React, using Context API for global state, React Router for pages, and Axios for API calls. Structure code into logical folders (`components`, `pages`, `context`).
- **Backend:** A Node/Express API with MongoDB. Define models for Users, Products, and Orders. Implement auth with JWT and protect admin routes.
- **Integration:** Use React’s proxy in development to call backend APIs without CORS issues. In production, build React and serve it from Express (e.g. `app.use(express.static('build'))`).
- **Deployment:** Push code to GitHub and connect to a cloud service (Render). Configure build commands, environment variables, and static file serving as outlined above.

With this guide, students can set up the project, understand its structure, implement each feature, and deploy the final application. Each step builds on the previous, resulting in a fully functional MERN e-commerce app with admin capabilities.
