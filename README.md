# Blogging Platform

A modern blogging platform built using **React** for the frontend, **Cloudflare Workers** for the backend, **PostgreSQL** as the database, and **Prisma** as the ORM. The app uses **TypeScript** throughout, and features **JWT-based authentication** for secure access. The backend is powered by **Hono**, a lightweight web framework for Cloudflare Workers, and employs **Prisma Accelerator** for connection pooling to optimize database performance.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Database Setup](#database-setup)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Tech Stack

- **Frontend:** React, TypeScript
- **Backend:** Cloudflare Workers, Hono, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Connection Pooling:** Prisma Accelerator
- **Authentication:** JSON Web Token (JWT)
- **Hosting:** Cloudflare Workers

## Features

- **User Authentication:** Secure sign-up and login using JWT.
- **Create, Read, Update Posts:** Users can manage their blog posts.
- **Serverless Backend:** Fast and scalable backend running on Cloudflare Workers.
- **Database Optimization:** Uses Prisma Accelerator for efficient database connections.

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

Make sure you have the following installed:

- **Node.js** (>= 16.x)
- **npm** or **yarn**
- **PostgreSQL** (Local or Cloud instance)
- **Cloudflare Account** for deploying workers

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/vivekraj2704/Blogging-web.git
    ```

2. Install dependencies:
    ```bash
    # For npm
    npm install

    # For yarn
    yarn install
    ```

### Environment Variables

Create a `.env` file in the root of your project with the following environment variables:

```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/mydb"

# JWT secret for authentication
JWT_SECRET="your_jwt_secret"



---Under Progress---