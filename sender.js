// sender.js
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

/**
 * Sends a text message back to a user via the WhatsApp Cloud API.
 * * @param {string} to - The recipient's WhatsApp ID (wa_id).
 * @param {string} messageText - The text content of the message.
 */
async function sendTextMessage(to, messageText) {
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
        console.error('❌ ERROR: WHATSAPP_TOKEN or PHONE_NUMBER_ID not set.');
        return;
    }

    const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

    try {
        const response = await axios.post(url, {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to, // This is the 'from' number from the incoming webhook
            type: 'text',
            text: {
                body: messageText
            }
        }, {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Message sent successfully:', response.data);
    } catch (error) {
        console.error('❌ Failed to send message:', error.response ? error.response.data : error.message);
    }
}

module.exports = {
    sendTextMessage
};