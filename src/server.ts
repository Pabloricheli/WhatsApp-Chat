import express from 'express'
import { PrismaClient } from '@prisma/client'

const app = express()
app.use(express.json())

// const prisma = new PrismaClient()

app.get('/users', async (req, res) => {
  // const user  = await prisma.user.findmany()

  res.send('Hello world!')
})

app.post('/user', async (req, res) => {
  const { name, phone } = req.body
})

app.listen(process.env.PORT || 3333, () => {
  console.log('Server is listening on port 3000')
})
