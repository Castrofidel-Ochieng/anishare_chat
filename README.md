# Vanish Chat

A Node.js + Express + Socket.IO group chat with MySQL persistence and 48-hour message expiration.

## Requirements
- Node.js 20+
- MySQL Server and MySQL Workbench

## 1. Create the database
In MySQL Workbench, connect to your local MySQL server, open `database/schema.sql`, and execute it.

For better security, create a dedicated database user in Workbench (recommended for deployments):
```sql
CREATE USER 'vanish_app'@'localhost' IDENTIFIED BY 'choose_a_strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON vanish_chat.* TO 'vanish_app'@'localhost';
FLUSH PRIVILEGES;
```
Use that username and password in `.env`. If you already have a suitable local MySQL user, you can use it instead.

## 2. Configure environment variables
Copy `.env.example` to `.env`, then set the database host, port, username, password, and database name.
Never commit `.env` to Git or share its password.

## 3. Install dependencies
From the project directory:
```powershell
npm install
```

## 4. Run the application
```powershell
npm run dev
```
Open http://localhost:3000.

## Features
- Join rooms using a display name and room name.
- Real-time messages with Socket.IO.
- Messages are persisted in MySQL.
- Message history is limited to the latest 100 unexpired messages per room.
- Expired messages are removed from the database by a periodic cleanup service.
- Orange / warm off-white visual theme aligned with AniShare.

## Important notes
- Room names are public identifiers, not private or access-controlled rooms.
- Display names are not authenticated identities. Add authentication and authorization before using this for sensitive conversations.
- The 48-hour expiration policy is enforced by timestamps and a cleanup worker that runs every minute. Physical deletion can occur up to about one minute after expiry; expired messages are excluded from history immediately.
- The cleanup timer runs in this Node process. For multiple app instances, use a single scheduled worker or a distributed job system.
- For deployment, use a managed MySQL service, persistent environment variables, HTTPS, rate limiting, logging, and backups appropriate to your privacy requirements.
