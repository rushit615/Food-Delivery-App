import express from 'express'

import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.route.js'

 const app = express()

//Middlewares

app.use(cookieParser())
app.use(express.json());

//Routes

app.use('/api/auth',authRoutes)



export default app;