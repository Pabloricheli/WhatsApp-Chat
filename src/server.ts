import express, { Request, Response } from 'express'
import { Configuration, OpenAIApi } from 'openai'
import axios from 'axios'

// Defina as constantes
const PORT = process.env.PORT || 3333
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const VERIFY_TOKEN = process.env.VERIFY_TOKEN
const OPENAI_TOKEN = process.env.OPENAI_TOKEN
const ORGANIZATION = process.env.ORGANIZATION
const PHONEID = process.env.PHONEID

const GPT3_MODEL = 'text-davinci-003'

const GPT3_PROMPT = `Você é uma atendente com o nome de Ana da loja de pianos cujo o nome é Casa de Pianos respondendo o whatsaap e tem os seguintes pianos em promoção a venda: 
"Piano seminovo da marca Fritz Dobbert modelo 126 apartamento no valor de 15 mil reais,Piano usado 3/4 de cauda da marca Essenfelder da década de 1930 no valor de 100 mil reais,Piano usado da marca Schneider com mecanismo harpa/cravo no valor de 15 mil reais, Piano seminovo da marca Suzuki modelo AU200 no valor de 20mil reais.
Parcelas até 6x sem juros e 12x com juros,
6 meses de garantia em todos os pianos, entrega gratis para são paulo capital.
E mais modelos a venda e informações no site www.casadepianos.com.br.
Agora responda o cliente que disse:`

const app = express()
app.use(express.json())

app.listen(PORT, () => console.log(`Webhook is listening on port ${PORT}`))

app.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { entry } = req.body

    console.log(JSON.stringify(req.body, null, 2))

    if (entry && entry[0].changes && entry[0].changes[0].value.messages) {
      const {
        phone_number_id,
        messages: [{ from, text }]
      } = entry[0].changes[0].value

      if (from && text && text.body) {
        const msg_body = text.body

        console.log('text body', msg_body)

        const responseGpt = await getChatGPTResponse(msg_body)

        console.log('gpt resposta', responseGpt)

        await axios.post(
          `https://graph.facebook.com/v16.0/${phone_number_id}/messages?access_token=${WHATSAPP_TOKEN}`,
          {
            messaging_product: 'whatsapp',
            to: from,
            text: { body: `${responseGpt}` }
          },
          { headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
    res.sendStatus(200)
  } catch (error) {
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

const generatePrompt = (prompt: string) => {
  const capitalizedPrompt =
    prompt[0].toUpperCase() + prompt.slice(1).toLowerCase()
  return `${GPT3_PROMPT} ${capitalizedPrompt}`
}

export default async function getChatGPTResponse(
  message: string
): Promise<string> {
  const configuration = new Configuration({
    apiKey: OPENAI_TOKEN,
    organization: ORGANIZATION
  })

  const openai = new OpenAIApi(configuration)

  try {
    const completion = await openai.createCompletion({
      model: GPT3_MODEL,
      prompt: generatePrompt(message),
      temperature: 0.6,
      max_tokens: 1024
    })

    console.log(completion.data.choices[0])

    return completion.data.choices[0].text
  } catch (error) {
    if (error.response) {
      console.log('resnpose', error)
      console.log('erro na geração gpt -- status ', error.response.status)
      console.log('erro na geração gpt -- data ', error.response.data)
      return error.response.status
    } else {
      console.log(error.message)
    }
  }
}
