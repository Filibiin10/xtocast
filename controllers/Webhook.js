

// Webhook route to receive payment events
app.post('/paystack/webhook', express.json(), (req, res) => {
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');

    // Verify that the request came from Paystack
    if (hash === req.headers['x-paystack-signature']) {
        const event = req.body;

        if (event.event === 'charge.success') {
            // Payment was successful, handle the payment success here
            const paymentDetails = event.data;
            console.log('Payment successful:', paymentDetails);

            // Example: Save the payment details to the database, update order status, etc.
        }

        res.sendStatus(200); // Respond to Paystack that the webhook was received
    } else {
        res.sendStatus(400); // Invalid signature, reject the request
    }
})