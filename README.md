# README

## 🛠️ How to Run the System

1. Clone the repository:
git clone https://github.com/almunasserl/SmartSchedule.git
cd SmartSchedule

2. Backend setup:
cd backend
npm install
Create a .env file inside the backend folder and paste:
DATABASE_URL=postgresql://postgres:RIRBytJ7uQ2I4ZOY@db.vedvhoxsyzternswthbu.supabase.co:5432/postgres
PORT=5000
DB_SSL=true
JWT_SECRET=MySuperSecretKey
SMTP_USER=startechnology2025@gmail.com
SMTP_PASS=snim fqis ffnr mkal
Then start the backend:
npm start
Expected output:
✅ Connected to PostgreSQL
Server is running on port 5000

3. Frontend setup:
cd ../frontend
npm install
Create a .env file inside the frontend folder and paste:
VITE_API_BASE_URL=http://localhost:5000
Start the frontend:
npm run dev
Then open:
http://localhost:5173

---

## ⚙️ Environment Variables

Backend .env  
DATABASE_URL=postgresql://postgres:RIRBytJ7uQ2I4ZOY@db.vedvhoxsyzternswthbu.supabase.co:5432/postgres  
PORT=5000  
DB_SSL=true  
JWT_SECRET=MySuperSecretKey  
SMTP_USER=startechnology2025@gmail.com  
SMTP_PASS=snim fqis ffnr mkal  

Frontend .env  
VITE_API_BASE_URL=http://localhost:5000  

---

## 👤 Demo Credentials

Committee → reem@gmail.com / 123456789  
Student → hala@gmail.com / 123456789  
Faculty → sarah@gmail.com / 123456789  
Registrar → alia@gmail.com / 123456789
