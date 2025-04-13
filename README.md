# BookMySeats

A web application for booking seats on a simple train coach, built with Next.js, Node.js (Express), PostgreSQL, and Tailwind CSS.

## Project Overview

This application simulates a train coach with 80 seats (11 rows of 7, 1 row of 3). Users can sign up, log in, view the seat map, and book up to 7 seats at a time. The booking system prioritizes seating users together in the same row; if that's not possible, it assigns the closest available seats.

## Features

- User Authentication (Signup/Login) with JWT.
- Visual seat map displaying available and booked seats.
- Seat booking functionality (1-7 seats per booking).
- Prioritized booking logic (same row > nearby seats).
- Responsive design using Tailwind CSS and Shadcn UI.

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Shadcn UI
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken), bcrypt

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/)

## Installation & Setup

Follow these steps to get the project running locally:

**1. Clone the Repository:**

```bash
git clone https://github.com/snoofox/bookMySeats
cd bookMySeats
```

**2. Backend Setup:**

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
yarn install
```

#### Database Setup:

- Ensure your PostgreSQL server is running.
- Create a new PostgreSQL database for the project. For example:
  CREATE DATABASE bookmyseats;

#### Environment Variables:

- Create a .env file in the backend directory.

  ```dotenv
  # .env

  # PostgreSQL Connection URL
  DATABASE_URL=postgresql://your_db_user:your_db_password@localhost:5432/train_reservation

  # Port the backend server will run on
  PORT=5000

  # Secret key for signing JWT token
  JWT_SECRET=dev-secret

  # URL of the frontend application (for CORS configuration, if needed)
  FRONTEND_URL=http://localhost:3000
  ```

**3. Frontend Setup:**

- Navigate to the frontend directory:

```bash
cd ../frontend
```

- Install dependencies:

```bash
yarn install
```

#### Environment Variables:

- Create a .env.local file in the frontend directory.
- Add the following content, pointing to your running backend server:

  ```dotenv
  NEXT_PUBLIC_BASE_URL=http://localhost:5000
  ```

### Running the Application

- Backend

```bash
cd backend
yarn run dev
```

- Frontend

```bash
cd frontend
yarn run dev
```
