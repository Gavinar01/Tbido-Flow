# PostgreSQL Installation Guide for Windows 11

This guide will help you install PostgreSQL on your Windows 11 system and configure it for your Python Flask project.

## Step 1: Download PostgreSQL Installer

- Visit the official PostgreSQL Windows download page: https://www.postgresql.org/download/windows/
- Click on the **Download the installer** link to download the interactive installer by EDB.

## Step 2: Run the Installer

- Launch the downloaded installer executable.
- Follow the installation wizard steps:
  - Choose installation directory.
  - Select components (default is fine).
  - Set a password for the PostgreSQL superuser (default user: `postgres`). Remember this password.
  - Choose port (default is 5432).
  - Select locale (default is fine).

## Step 3: Complete Installation

- Finish the installation and optionally launch StackBuilder to install additional tools if needed.

## Step 4: Verify PostgreSQL Installation

- Open **pgAdmin** (installed with PostgreSQL) or use the command line.
- Connect to the PostgreSQL server using the credentials you set during installation.

## Step 5: Configure Your Flask Project

- Update your `.env` file with the correct PostgreSQL credentials:
  ```
  DB_USERNAME=postgres
  DB_PASSWORD=your_password
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=your_database_name
  ```
- Create the database `your_database_name` in PostgreSQL using pgAdmin or psql command line.

## Step 6: Restart Your Flask Application

- After configuring the database, restart your Flask app to connect to the PostgreSQL server.

---


