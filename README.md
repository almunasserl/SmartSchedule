# README

## 🛠️ How to Run the System

1. **Clone the repository**
   ```
   git clone https://github.com/almunasserl/SmartSchedule.git
   cd SmartSchedule
   ```

2. **Backend setup**
   ```
   cd backend
   npm install
   npm start
   ```
   **Expected output:**
   ```
   ✅ Connected to PostgreSQL
   Server is running on port 5000
   ```

3. **Frontend setup**
   ```
   cd ../frontend
   npm install
   npm run dev
   ```
   Then open the browser at:
   ```
   http://localhost:5173
   ```

---

## ⚙️ Environment Variables

**Backend .env**
```
DATABASE_URL=postgresql://postgres:RIRBytJ7uQ2I4ZOY@db.vedvhoxsyzternswthbu.supabase.co:5432/postgres
PORT=5000
DB_SSL=true
JWT_SECRET=MySuperSecretKey
SMTP_USER=startechnology2025@gmail.com
SMTP_PASS=snim fqis ffnr mkal
OPENAI_API_KEY=your_openai_api_key_here
```

**Frontend .env**
```
VITE_API_BASE_URL=http://localhost:5000
```

*Note: The OpenAI API key is optional and required only for AI-related routes. The system will run normally without it.*

---

## 👤 Demo Credentials

| Role        | Email              | Password  |
|--------------|--------------------|------------|
| Committee    | reem@gmail.com     | 123456789  |
| Student      | hala@gmail.com     | 123456789  |
| Faculty      | sarah@gmail.com    | 123456789  |
| Registrar    | alia@gmail.com     | 123456789  |
