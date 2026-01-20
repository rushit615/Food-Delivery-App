import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.route.js'

 const app = express()

//Middlewares

app.use(cookieParser())
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // URL of your Frontend (Check your browser url!)
  credentials: true // Allow cookies/headers
}));
//Routes

app.use('/api/auth',authRoutes)



export default app;