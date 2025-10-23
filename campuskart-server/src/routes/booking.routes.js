import express from 'express';
import {
  createBooking,
  getSellerBookings,
  getBuyerBookings,
  updateBookingStatus,
  markBookingAsRead,
  getUnreadBookingCount
} from '../controllers/booking.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/create', createBooking);
router.get('/seller', getSellerBookings);
router.get('/buyer', getBuyerBookings);
router.put('/:bookingId/status', updateBookingStatus);
router.put('/:bookingId/read', markBookingAsRead);
router.get('/unread-count', getUnreadBookingCount);

export default router;
