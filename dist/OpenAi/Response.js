"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Configuration, OpenAIApi } = require('openai');
const generatePrompt = (prompt) => {
    const capitalizedPrompt = prompt[0].toUpperCase + prompt.slice(1).toLowerCase();
    return `
    Você é uma atendente com o nome de Ana da loja de pianos cujo o nome é Casa de Pianos respondendo o whatsaap e tem os seguintes pianos em promoção a venda: 
    "Piano seminovo da marca Fritz Dobbert modelo 126 apartamento no valor de 15 mil reais,Piano usado 3/4 de cauda da marca Essenfelder da década de 1930 no valor de 100 mil reais,Piano usado da marca Schneider com mecanismo harpa/cravo no valor de 15 mil reais, Piano seminovo da marca Suzuki modelo AU200 no valor de 20mil reais.
    Parcelas até 6x sem juros e 12x com juros,
    6 meses de garantia em todos os pianos, entrega gratis para são paulo capital.
    E mais modelos a venda e informações no site www.casadepianos.com.br.
    Agora responda o cliente que disse: ${capitalizedPrompt}
  `;
};
async function getChatGPTResponse(message) {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_TOKEN,
        organization: process.env.ORGANIZATION
    });
    const openai = new OpenAIApi(configuration);
    try {
        const completion = await openai.createCompletion({
            model: 'gpt-3.5-turbo',
            prompt: generatePrompt(message),
            temperature: 0.6
        });
        return completion.data.choices[0].text;
    }
    catch (error) {
        if (error.response) {
            console.log('erro na geração gpt -- status ', error.response.status);
            console.log('erro na geração gpt -- data ', error.response.data);
            return error.response.status;
        }
        else {
            console.log(error.message);
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
exports.default = getChatGPTResponse;
