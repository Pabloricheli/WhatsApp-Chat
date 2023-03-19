import express from 'express'
import bodyParser from 'body-parser'
import { create } from '@wppconnect-team/wppconnect'
import { chatgpt } from './chatgpt'

const app = express()

app.use(bodyParser.json())

// Configurar a rota para receber as solicitações do WhatsApp Business API
app.post('/whatsapp', async (req, res) => {
  const message = req.body.Body
  const phone = req.body.From
  const client = await create({
    session: phone,
    catchQR: true,
    headless: true,
    logQR: true,
    useChrome: true,
    killProcessOnBrowserClose: true
  })

  // Enviar a mensagem para o cliente usando o ChatGPT
  const response = await chatgpt(message)
  await client.sendText(phone, response)

  res.sendStatus(200)
})

// Iniciar o servidor
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`)
})
