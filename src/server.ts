import express from 'express'
import { PrismaClient } from '@prisma/client'

const token = process.env.TOKEN || 'token'

const app = express()
app.use(express.json())

// const prisma = new PrismaClient()

app.get('/', function (req, res) {
  console.log(req)
})

app.post('/', function (req, res) {
  console.log(req.body)
})

app.get('/webhook', async (req, res) => {
  console.log(req.body)
})

app.post('/webhook', async (req, res) => {
  // const { name, phone } = req.body
  console.log(req.body)
})

app.listen(process.env.PORT || 3333, () => {
  console.log('Server is listening on port 3000')
})
