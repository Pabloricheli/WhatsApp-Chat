"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const Response_1 = __importDefault(require("./OpenAi/Response"));
const app = express_1.default();
app.use(express_1.default.json());
const PORT = process.env.PORT || 3333;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
app.listen(PORT, () => console.log(`Webhook is listening on port ${PORT}`));
app.post('/webhook', async (req, res) => {
    try {
        const { entry } = req.body;
        console.log(JSON.stringify(req.body, null, 2));
        if (entry && entry[0].changes && entry[0].changes[0].value.messages) {
            const { phone_number_id, messages: [{ from, text }] } = entry[0].changes[0].value;
            const msg_body = text.body;
            const responseGpt = await Response_1.default(msg_body);
            console.log('chat response', responseGpt);
            const response = await axios_1.default.post(`https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${WHATSAPP_TOKEN}`, {
                messaging_product: 'whatsapp',
                to: from,
                text: { body: `${responseGpt}` }
            }, { headers: { 'Content-Type': 'application/json' } });
            console.log(response.data);
        }
        res.sendStatus(200);
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
    }
    else {
        res.sendStatus(403);
    }
});
