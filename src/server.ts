import express from 'express'
import axios from 'axios'
import { PrismaClient } from '@prisma/client'

const token = process.env.TOKEN || 'token'

const app = express()
app.use(express.json())

// const prisma = new PrismaClient()

app.get('/', async function (req, res) {
  console.log(req)
  await axios
    .post(
      'https://graph.facebook.com/v16.0/118125934538595/messages',
      {
        messaging_product: 'whatsapp',
        to: '+5511981312897',
        type: 'template',
        template: {
          name: 'bem_vindo',
          language: {
            code: 'pt_BR'
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.APP_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    )
    .then(response => {
      console.log(response)
    })
    .catch(error => {
      console.log(error)
    })
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
