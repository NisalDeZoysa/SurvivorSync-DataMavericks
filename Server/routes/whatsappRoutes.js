// import express from 'express';

// import whatsappClient from '../controllers/whatsAppConroller.js';


// const router = express.Router();

// router.post('/send/msg', (req, res) => {
//     console.log("Received WhatsApp message request:", req.body);
//     whatsappClient.sendMessage(req.body,phoneNumber,req.body.message)
//     res.send()
// });

// export default router;

import express from 'express';
import { sendMessage } from '../controllers/whatsAppConroller.js'; // Import the sendMessage function

const router = express.Router();

router.post('/send/msg', async (req, res) => {
    try {
        console.log("Received WhatsApp message request:", req.body);
        
        const { phoneNumber, message } = req.body;
        
        if (!phoneNumber || !message) {
            return res.status(400).json({
                success: false,
                message: 'Both phoneNumber and message are required'
            });
        }

        await sendMessage(phoneNumber, message);
        res.json({ 
            success: true,
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;