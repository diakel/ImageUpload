import express from 'express'
import config from './config/index.js'
import s3Router from './routes/misc.js'
import nsfwChecker from './routes/check.js'
import cors from 'cors'
import { loadModel } from './model.js'

const app = express()

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000',
    origin: process.env.WEBSITE_FRONTEND_URL
}))

app.use('/api/s3', s3Router)
 
app.use('/api/check', nsfwChecker)

loadModel().then(() => {
    app.listen(config.PORT, () => {
        console.log(`Server listening on http://localhost:${config.PORT}`)
    })
})