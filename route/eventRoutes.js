import express from 'express';
import {
    getAllEvents,
    // createEvent,
    updateEvent,
    deleteEvent,
    getEventCategories,
    getEventById
} from '../controllers/eventController.js';
import multer from 'multer';
import path from 'path';
import pool from '../db/db.js';

const router = express.Router();


router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.get('/:eventId/categories', getEventCategories);
// router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))  // Use current timestamp and file extension to avoid filename collisions)
    }
})  

const upload = multer({ storage: storage }); // Use the storage configuration defined above


// Upload routes
router.post('/uploads', upload.single('image'), (req, res) => {
    console.log(req.file.filename)
    res.json({
        message: 'File uploaded successfully!',
        image: req.file.path
    });
    
})



router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size is too large. Maximum allowed size is 5MB.' });
        }
    }
    next(err); // Pass the error to the next middleware
});




export default router;
