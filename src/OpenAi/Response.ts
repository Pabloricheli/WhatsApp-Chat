const { Configuration, OpenAIApi } = require('openai')

export default async function getChatGPTResponse(
  message: string
): Promise<string> {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_TOKEN
  })

  const openai = new OpenAIApi(configuration)

  try {
    const completion = await openai.createCompletion(
      {
        model: 'text-davinci-003',
        prompt: `${message}`
      },
      {
        timeout: 1000,
        headers: {
          'Example-Header': 'example'
        }
      }
    )

    return completion.data.choices[0].text
  } catch (error) {
    if (error.response) {
      console.log(error.response.status)
      console.log(error.response.data)
      return error.response.status
    } else {
      console.log(error.message)
    }
  }

  // const response = await axios.post(
  //   `https://api.openai.com/v1/engines/davinci-codex/completions`,
  //   {
  //     prompt: `Responder: ${message}`,
  //     max_tokens: 60,
  //     n: 1,
  //     stop: '\n'
  //   },
  //   {
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${apiKey}`
  //     }
  //   }
  // )
}
