// handler.js
const { sendTextMessage } = require('./sender');

/**
 * Processes incoming webhook events and determines the automated response.
 * @param {object} webhookEventBody - The JSON body of the incoming POST request.
 */
function handleIncomingMessage(webhookEventBody) {
    const body = webhookEventBody;

    // Ensure it's a message event from a whatsapp business account
    if (body.object === 'whatsapp_business_account' && body.entry) {
        body.entry.forEach(entry => {
            entry.changes.forEach(change => {
                const value = change.value;
                const field = change.field;

                // Check for new incoming messages
                if (field === 'messages' && value.messages) {
                    value.messages.forEach(message => {
                        const from = message.from; // The user's WhatsApp ID (wa_id)
                        const incomingText = message.text?.body || 'No Text Body';
                        
                        console.log(`Incoming: "${incomingText}" from ${from}`);

                        // --- Simple Response Logic ---
                        const replyMessage = `Thank you for your message! You said: "${incomingText}". This is an automated reply from my Node.js backend.`;
                        
                        // Send the automated reply
                        sendTextMessage(from, replyMessage);
                        // -----------------------------
                    });
                }
                
                // You can add logic for 'message_statuses' here if needed
                if (field === 'message_statuses' && value.statuses) {
                    value.statuses.forEach(status => {
                        console.log(`Status update for message ${status.id}: ${status.status}`);
                    });
                }
            });
        });
    } else {
        console.warn('Received non-whatsapp_business_account object or malformed entry.');
    }
}

module.exports = {
    handleIncomingMessage
};