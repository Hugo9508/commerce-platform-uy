
export async function sendWhatsAppMessage(phone: string, message: string) {
    try {
        const apiUrl = process.env.EVOLUTION_API_URL;
        const apiKey = process.env.EVOLUTION_API_KEY;
        const instanceName = process.env.EVOLUTION_INSTANCE_NAME;

        if (!apiUrl || !apiKey || !instanceName) {
            console.error('Evolution API not configured');
            return false;
        }

        // Format phone number: remove +, spaces, dashes
        // Evolution API expects numbers with country code, e.g., 59899123456
        let formattedPhone = phone.replace(/[^0-9]/g, '');

        // Basic validation for Uruguay numbers (optional but good)
        // If it starts with 09, add 598. If it's 9, add 598.
        if (formattedPhone.startsWith('09')) {
            formattedPhone = '598' + formattedPhone.substring(1);
        } else if (formattedPhone.startsWith('9')) {
            formattedPhone = '598' + formattedPhone;
        }

        console.log(`Sending WhatsApp to ${formattedPhone}...`);

        const response = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            },
            body: JSON.stringify({
                number: formattedPhone,
                text: message,
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Evolution API Error:', data);
            return false;
        }

        console.log('WhatsApp sent successfully:', data);
        return true;

    } catch (error) {
        console.error('Error sending WhatsApp:', error);
        return false;
    }
}
