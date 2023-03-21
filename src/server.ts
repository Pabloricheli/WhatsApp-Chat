import express, { Request, Response } from 'express'
import axios from 'axios'

import getChatGPTResponse from './OpenAi/Response'

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3333
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const VERIFY_TOKEN = process.env.VERIFY_TOKEN

app.listen(PORT, () => console.log(`Webhook is listening on port ${PORT}`))

let lastRequestTime = 0

app.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { entry } = req.body

    // Check the Incoming webhook message
    console.log(JSON.stringify(req.body, null, 2))

    if (entry && entry[0].changes && entry[0].changes[0].value.messages) {
      const {
        phone_number_id,
        messages: [{ from, text }]
      } = entry[0].changes[0].value
      const msg_body = text.body

      // Check if the last request was made less than 5 seconds ago
      const now = Date.now()
      const timeDiff = now - lastRequestTime
      if (timeDiff < 5000) {
        // Wait for the remaining time until 5 seconds have passed
        const remainingTime = 5000 - timeDiff
        console.log(`Waiting ${remainingTime}ms before making the request`)
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      }

      const responseGpt = await getChatGPTResponse(msg_body)

      const response = await axios.post(
        `https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${WHATSAPP_TOKEN}`,
        {
          messaging_product: 'whatsapp',
          to: from,
          text: { body: `${responseGpt}` }
        },
        { headers: { 'Content-Type': 'application/json' } }
      )

      // Update the last request time
      lastRequestTime = Date.now()

      console.log(response.data)
    }
    res.sendStatus(200)
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
})

app.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED')
    res.status(200).send(challenge)
  } else {
    res.sendStatus(403)
  }
})
