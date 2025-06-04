import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

import qrcode from 'qrcode-terminal';


export const whatsappClient = new Client({
    authStrategy: new LocalAuth(),
});

let isClientReady = false;

whatsappClient.on('qr', (qr) => {
    // Generate and display QR code in terminal
    qrcode.generate(qr, { small: true });
    console.log('QR Code generated, scan it with your WhatsApp app.');
});

whatsappClient.on('ready', () => {
    isClientReady = true;
    console.log('WhatsApp client is ready!');

})

whatsappClient.on('message', async (msg) => {
    try{

        if(msg.from !="status@broadcast"){
            const contact = await msg.getContact();
            console.log(`Message from ${contact}: ${msg.body}`);
        }

    }catch(error) {
        console.error('Error handling message:', error);
    }

})

// Initialize the client
// whatsappClient.initialize();

// Function to send messages
export async function sendMessage(phoneNumber, message) {
    if (!isClientReady) {
        throw new Error('WhatsApp client is not ready yet');
    }
    
    // Remove any non-digit characters from phone number
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    
    // Extract last 9 digits
    const last9Digits = cleanedNumber.slice(-9);
    
    // Format as 94 + last 9 digits
    const formattedNumber = '94' + last9Digits;
    const chatId = `${formattedNumber}@c.us`;
    
    try {
        await whatsappClient.sendMessage(chatId, message);
        return { success: true };
    } catch (error) {
        throw new Error(`Failed to send message: ${error.message}`);
    }
}
