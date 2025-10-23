import Booking from '../models/booking.model.js';

// Create a booking request
export const createBooking = async (req, res) => {
  try {
    const { itemId, itemTitle, itemPrice, sellerId, sellerName, message } = req.body;
    const buyerId = req.user._id.toString();
    const buyerName = req.user.username;
    const buyerEmail = req.user.email;
    const buyerPhone = req.user.phoneNumber;

    // Check if user already has a pending booking for this item
    const existingBooking = await Booking.findOne({
      itemId,
      buyerId,
      status: 'pending'
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending booking for this item'
      });
    }

    const booking = await Booking.create({
      itemId,
      itemTitle,
      itemPrice,
      buyerId,
      buyerName,
      buyerEmail,
      buyerPhone,
      sellerId,
      sellerName,
      message,
      status: 'pending'
    });

    res.json({ success: true, booking, message: 'Booking request sent successfully!' });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
};

// Get bookings for seller (incoming requests)
export const getSellerBookings = async (req, res) => {
  try {
    const sellerId = req.user._id.toString();

    const bookings = await Booking.find({ sellerId })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching seller bookings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
};

// Get bookings for buyer (sent requests)
export const getBuyerBookings = async (req, res) => {
  try {
    const buyerId = req.user._id.toString();

    const bookings = await Booking.find({ buyerId })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching buyer bookings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const userId = req.user._id.toString();

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only seller can accept/reject
    if (booking.sellerId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, booking, message: `Booking ${status} successfully` });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking' });
  }
};

// Mark booking as read
export const markBookingAsRead = async (req, res) => {
  try {
    const { bookingId } = req.params;

    await Booking.findByIdAndUpdate(bookingId, { read: true });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking booking as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
};

// Get unread booking count
export const getUnreadBookingCount = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const unreadCount = await Booking.countDocuments({
      sellerId: userId,
      read: false,
      status: 'pending'
    });

    res.json({ success: true, unreadCount });
  } catch (error) {
    console.error('Error fetching unread booking count:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
  }
};
