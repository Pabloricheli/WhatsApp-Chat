import express, { Request, Response, response } from 'express'
import axios from 'axios'

import getChatGPTResponse from './OpenAi/Response'

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3333
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const VERIFY_TOKEN = process.env.VERIFY_TOKEN

app.listen(PORT, () => console.log(`Webhook is listening on port ${PORT}`))

app.get('/webhook', async (req: Request, res: Response) => {
  try {
    const { entry } = req.body

    console.log(JSON.stringify(req.body, null, 2))

    if (entry && entry[0].changes && entry[0].changes[0].value.messages) {
      const {
        phone_number_id,
        messages: [{ from, text }]
      } = entry[0].changes[0].value
      const msg_body = text.body

      const responseGpt = await getChatGPTResponse(msg_body)

      console.log(responseGpt)

      const response = await axios.post(
        `https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${WHATSAPP_TOKEN}`,
        {
          messaging_product: 'whatsapp',
          to: from,
          text: { body: `${responseGpt}` }
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
    console.log('envio', response)
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
