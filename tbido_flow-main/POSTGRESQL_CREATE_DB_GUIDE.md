# Guide to Create a PostgreSQL Database

Since you are new to PostgreSQL, here is a simple step-by-step guide to create a new database using pgAdmin and psql command line.

## Using pgAdmin (Graphical Interface)

1. Open pgAdmin from your Start menu or desktop.
2. Connect to your PostgreSQL server by entering your password if prompted.
3. In the left sidebar, right-click on **Databases** and select **Create > Database...**
4. In the dialog:
   - Enter the database name (must match `DB_NAME` in your `.env` file).
   - Leave other settings as default.
5. Click **Save** to create the database.

## Using psql Command Line

1. Open Command Prompt or PowerShell.
2. Run the following command to connect to PostgreSQL as the `postgres` user:
   ```
   psql -U postgres
   ```
3. Enter your password when prompted.
4. Create a new database with the command:
   ```
   CREATE DATABASE your_database_name;
   ```
   Replace `your_database_name` with the name you want.
5. Exit psql by typing:
   ```
   \q
   ```

## After Creating the Database

- Make sure your `.env` file has the correct `DB_NAME` matching the database you created.
- Restart your Flask application to connect to the new database.


