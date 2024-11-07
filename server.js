import express from 'express';
import cors from 'cors';
import https from 'https';
import crypto from 'crypto'


import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import userRoutes from './route/userRoutes.js';
import eventRoutes from './route/eventRoutes.js';
import categoryRoutes from './route/categoryRoutes.js';
import nomineeRoutes from './route/nomineeRoutes.js';
import transactionRoutes from './route/transactionRoutes.js';
import voteRoutes from './route/voteRoutes.js';
import pool, { testConnection } from './db/db.js';
import { createVote, getTodaysRevenue, getTotalAmountPaid, getWeeklyRevenue } from './controllers/voteController.js';
import { fileURLToPath } from 'url';
import multer from 'multer';
import {createEvent} from './controllers/eventController.js';
import { getAllCategoriesByEventId, getCategoryByEventId } from './controllers/categoryController.js';
import { getNomineesByCategoryId } from './controllers/nomineeController.js';


dotenv.config();

const app = express();
const PORT = 7000;
app.use(bodyParser.json({ limit: '10mb' })); // Set limit to 10MB, adjust as needed
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({ origin: '*', credentials: true, 
    methods:  ['GET', 'POST', 'PUT', 'DELETE']
 }));

// app.use(cors())
app.use(express.json());

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);





const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory where files will be saved
    },
    filename: (req, file, cb) => {
        // Use a unique filename to avoid collisions
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.post('/uploads', upload.single('image'), (req, res) => {
    console.log(req.file)
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`; // Create the full URL for the uploaded image
    res.json({
        message: 'File uploaded successfully!',
        image: imageUrl // Return the full URL
    });
});


// Routes

app.post('/upload', upload.single('image'),createEvent)


app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/nominees', nomineeRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/votes', voteRoutes);
app.get('/api/amount-paid', getTotalAmountPaid);
app.get('/api/todays-revenue', getTodaysRevenue);
app.get('/api/weekly-revenue', getWeeklyRevenue);

app.get('/api/eventid/:id', getCategoryByEventId);
app.get('/api/nominee/:id', getNomineesByCategoryId);
app.get('/api/category/:id', getAllCategoriesByEventId);


app.post('/api/paystack/initialize', (req, res) => {
    const { email, amount } = req.body;

    if (!email || !amount) {
        return res.status(400).json({
            status: 'error',
            message: 'Email and amount are required.'
        });
    }

    const amountInKobo = amount * 100; // Convert to kobo

    const params = JSON.stringify({
        email: email,
        amount: amountInKobo
    });

    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
        }
    };

    const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            const parsedData = JSON.parse(data);
            if (parsedData.status === true) {
                res.json({
                    status: 'success',
                    data: {
                        authorization_url: parsedData.data.authorization_url,
                        reference: parsedData.data.reference
                    }
                });
            } else {
                res.status(400).json({
                    status: 'error',
                    message: parsedData.message || 'Payment initialization failed.'
                });
            }
        });
    });

    request.on('error', (error) => {
        res.status(500).json({
            status: 'error',
            message: 'Internal server error.'
        });
    });

    request.write(params);
    request.end();
});
const SECRET = process.env.SECRET
app.post('/paystack/webhook', express.json(), (req, res) => {
    console.log('Headers:', req.headers); // Log headers to check if the signature header is included
    
    const hash = crypto.createHmac('sha512', SECRET)
                       .update(JSON.stringify(req.body))
                       .digest('hex');

    console.log('Computed Hash:', hash); // Log the computed hash for debugging
    console.log('Received Signature:', req.headers['x-paystack-signature']); // Log the received signature

    // Verify that the request came from Paystack
    if (hash === req.headers['x-paystack-signature']) {
        const event = req.body;

        if (event.event === 'charge.success') {
            const paymentDetails = event.data;
            console.log('Payment successful:', paymentDetails);
        }

        res.sendStatus(200); // Respond to Paystack that the webhook was received
    } else {
        res.sendStatus(400); // Invalid signature, reject the request
    }
});

testConnection();

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

