import axios from 'axios'

export default async function getChatGPTResponse(
  message: string
): Promise<string> {
  const apiKey = process.env.OPENAI_TOKEN
  const response = await axios.post(
    `https://api.openai.com/v1/engines/davinci-codex/completions`,
    {
      prompt: `Responder: ${message}`,
      max_tokens: 60,
      n: 1,
      stop: '\n'
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      }
    }
  )
  return response.data.choices[0].text
}
