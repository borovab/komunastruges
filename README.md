# Komuna Raportim — React (Vite) + Node/Express + MySQL (XAMPP)

Ky projekt është 100% lokal. MySQL e menaxhon me XAMPP + phpMyAdmin.

## 1) Kërkesat
- Node.js 18+ (rekomandohet 20)
- XAMPP (MySQL + phpMyAdmin)

## 2) MySQL (XAMPP)
1. Start: Apache + MySQL në XAMPP Control Panel
2. Hape phpMyAdmin: http://localhost/phpmyadmin
3. Importo skemën: `sql/schema.sql`
   - Kjo krijon DB: `komuneraport` + tabela + 2 usera demo.

### Demo login
- admin / admin123
- user / user123

## 3) Konfigurimi i serverit (.env)
Kopjo `server/.env.example` në `server/.env` dhe vendos kredencialet e MySQL.
- DB_HOST mund të jetë IP i serverit të DB (p.sh. 192.168.1.50) ose 127.0.0.1.

## 4) Start (DEV)
Në 2 terminala:

### Terminal 1: Server API
```bash
cd server
npm i
npm run dev
```

### Terminal 2: Client (Vite)
```bash
cd client
npm i
npm run dev
```

Hape: http://localhost:5173

## 5) Si punon
- Login krijon session token (ruhet në tabelën `sessions` me expires)
- Token ruhet në browser: localStorage `kr_session`
- User dërgon raport → shfaqet te Admin
- Admin:
  - shton punëtor
  - sheh të gjitha raportet
  - i shënon si reviewed

## Shënim sigurie (profesionale)
- Password-at ruhen hashed (bcrypt).
- Session tokens kanë expiry (7 ditë).
- Nuk ka “forgot password” / email sepse është sistem lokal.

