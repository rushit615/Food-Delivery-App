import app from './src/app.js'
import connectDB from './src/db/db.js'
import dotenv from 'dotenv'
dotenv.config()

connectDB()
app.listen(3000,()=>{

    console.log('server running on port 3000')
})