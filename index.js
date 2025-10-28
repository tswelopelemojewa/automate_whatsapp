// index.js (Your main application file)
// Dependencies
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const { handleIncomingMessage } = require('./handler'); // Import the handler
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

const app = express();

// Use bodyParser to capture raw body buffer (for signature verification)
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        // Save raw body buffer on req for later use
        req.rawBody = buf;
    }
}));

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const APP_SECRET = process.env.META_APP_SECRET;

// --- Helper Functions (Your existing code) ---

// GET route for verification handshake
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ WEBHOOK VERIFIED');
        res.status(200).send(challenge);
    } else {
        console.warn('❌ Verification failed: mode=%s token=%s', mode, token);
        res.sendStatus(403);
    }
});

// Middleware to verify signature (your working function)
function verifySignature(req, res, next) {
    // ... (Your existing, working verifySignature function goes here) ...
    const signatureHeader = req.header('X-Hub-Signature-256');
    // ... (rest of your verification logic) ...
    const receivedSignatureHex = signatureHeader.slice('sha256='.length);
    const rawBodyBuffer = req.rawBody;

    // Check if APP_SECRET is available
    if (!APP_SECRET) {
        console.error('❌ APP_SECRET is not set.');
        return res.sendStatus(500);
    }
    
    // Safety check for rawBodyBuffer
    if (!rawBodyBuffer) {
        console.warn('Raw body buffer is missing for signature check.');
        return res.sendStatus(401);
    }

    const hmac = crypto.createHmac('sha256', APP_SECRET);
    hmac.update(rawBodyBuffer);
    const computedDigestHex = hmac.digest('hex');

    try {
        const bufSig = Buffer.from(receivedSignatureHex, 'hex');
        const bufDigest = Buffer.from(computedDigestHex, 'hex');

        if (bufSig.length !== bufDigest.length || !crypto.timingSafeEqual(bufSig, bufDigest)) {
            console.warn('Signature did not match');
            return res.sendStatus(401);
        }
    } catch(err) {
        console.error('Error during signature comparison', err);
        return res.sendStatus(401);
    }

    console.log('✅ Signature verification passed');
    next();
}


// POST route for receiving webhook events
app.post('/webhook', verifySignature, (req, res) => {
    console.log('📬 Incoming Webhook:', JSON.stringify(req.body, null, 2));

    // Pass the incoming event body to the handler
    handleIncomingMessage(req.body); 

    // Always return 200 immediately to acknowledge receipt
    res.sendStatus(200); 
    // The message sending is async and does not block the 200 response
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Webhook listener started on port ${PORT}`);
});