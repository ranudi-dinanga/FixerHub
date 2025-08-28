const Booking = require('../models/Booking');
const User = require('../models/User');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { serviceProvider, serviceSeeker, date, time, description, price, image } = req.body;

    // Validate required fields
    if (!serviceProvider || !serviceSeeker || !date || !time || !description || !price) {
      return res.status(400).json({ 
        message: 'Missing required fields: serviceProvider, serviceSeeker, date, time, description, and price are required' 
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(serviceProvider) || !mongoose.Types.ObjectId.isValid(serviceSeeker)) {
      return res.status(400).json({ message: 'Invalid service provider or seeker ID format' });
    }

    // Create booking
    const booking = new Booking({
      serviceProvider,
      serviceSeeker,
      date: new Date(date),
      time,
      description,
      price,
      image,
      status: 'pending',
      paymentStatus: 'unpaid' // Add payment status
    });

    await booking.save();

    // Populate provider and seeker details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('serviceProvider', 'name email serviceCategory')
      .populate('serviceSeeker', 'name email');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ 
      message: 'Error creating booking',
      error: error.message 
    });
  }
};

// Get provider's bookings
exports.getProviderBookings = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.providerId)) {
      return res.status(400).json({ message: 'Invalid provider ID format' });
    }
    
    console.log('[getProviderBookings] Fetching bookings for providerId:', req.params.providerId);
    const startTime = Date.now();
    
    // Optimize query with selective population and projection
    const bookings = await Booking.find({ serviceProvider: req.params.providerId })
      .select('_id date time description price status paymentStatus rating review createdAt')
      .populate('serviceSeeker', 'name email')
      .sort({ createdAt: -1 })
      .lean()
      .maxTimeMS(10000); // Add timeout to prevent long-running queries
      
    const endTime = Date.now();
    console.log(`[getProviderBookings] Found ${bookings.length} bookings in ${endTime - startTime}ms`);
    
    res.json(bookings);
  } catch (error) {
    console.error('[getProviderBookings] Error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get seeker's bookings
exports.getSeekerBookings = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.seekerId)) {
      return res.status(400).json({ message: 'Invalid seeker ID format' });
    }
    
    console.log('[getSeekerBookings] Fetching bookings for seekerId:', req.params.seekerId);
    const startTime = Date.now();
    
    // Optimize query with selective population and projection
    const bookings = await Booking.find({ serviceSeeker: req.params.seekerId })
      .select('_id date time description price status paymentStatus serviceCategory rating review createdAt')
      .populate('serviceProvider', 'name email serviceCategory')
      .sort({ createdAt: -1 })
      .lean()
      .maxTimeMS(10000); // Add timeout to prevent long-running queries
    
    const endTime = Date.now();
    console.log(`[getSeekerBookings] Found ${bookings.length} bookings in ${endTime - startTime}ms`);
    
    res.json(bookings);
  } catch (error) {
    console.error('[getSeekerBookings] Error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get single booking by ID
exports.getBookingById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.bookingId)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    
    const booking = await Booking.findById(req.params.bookingId)
      .populate('serviceProvider', 'name email serviceCategory bankName accountNumber branchName location')
      .populate('serviceSeeker', 'name email location');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.bookingId)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { status },
      { new: true }
    ).populate('serviceProvider', 'name email serviceCategory');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Handle billing with Stripe
exports.processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethodId, amount } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      description: `Payment for booking #${bookingId}`
    });
    
    // Update booking with payment information
    booking.paymentStatus = paymentIntent.status === 'succeeded' ? 'paid' : 'failed';
    booking.paymentId = paymentIntent.id;
    booking.paymentDate = new Date();
    
    if (paymentIntent.status === 'succeeded') {
      booking.status = 'confirmed'; // Update booking status when payment succeeds
    }
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      booking,
      paymentIntent
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      message: 'Payment processing error',
      error: error.message
    });
  }
};

// Get payment status for a booking
exports.getPaymentStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.bookingId)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // If there's a payment ID, check the latest status from Stripe
    if (booking.paymentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.paymentId);
        
        // Update payment status if it has changed
        if (paymentIntent.status === 'succeeded' && booking.paymentStatus !== 'paid') {
          booking.paymentStatus = 'paid';
          await booking.save();
        }
        
        return res.json({
          bookingId: booking._id,
          paymentStatus: booking.paymentStatus,
          paymentId: booking.paymentId,
          paymentDate: booking.paymentDate,
          stripeStatus: paymentIntent.status
        });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        return res.json({
          bookingId: booking._id,
          paymentStatus: booking.paymentStatus,
          paymentId: booking.paymentId,
          paymentDate: booking.paymentDate,
          stripeError: stripeError.message
        });
      }
    }
    
    // If no payment has been processed yet
    return res.json({
      bookingId: booking._id,
      paymentStatus: booking.paymentStatus
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      message: 'Error retrieving payment status',
      error: error.message
    });
  }
};

// Refund a payment
exports.refundPayment = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.paymentStatus !== 'paid' || !booking.paymentId) {
      return res.status(400).json({ message: 'This booking has not been paid or has no payment ID' });
    }
    
    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: booking.paymentId,
      reason: reason || 'requested_by_customer'
    });
    
    // Update booking with refund information
    booking.paymentStatus = 'refunded';
    booking.refundId = refund.id;
    booking.refundDate = new Date();
    booking.refundReason = reason;
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      booking,
      refund
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({
      message: 'Refund processing error',
      error: error.message
    });
  }
};

// Handle quotation process
exports.sendQuotation = async (req, res) => {
  try {
    const { bookingId, quoteAmount, terms } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        price: quoteAmount,
        status: 'quote_sent',
        terms
      },
      { new: true }
    ).populate('serviceProvider', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Optionally send email notification about the quote
    res.json(booking);
  } catch (error) {
    console.error('Quotation process error:', error);
    res.status(500).json({
      message: 'Quotation process error',
      error: error.message
    });
  }
};

// Add rating and review
exports.addRating = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.bookingId)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    
    const { rating, review } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // First find the booking to check authorization
    const existingBooking = await Booking.findById(req.params.bookingId);
    if (!existingBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the user is the service seeker (only service seekers can rate)
    if (existingBooking.serviceSeeker.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the service seeker can rate this booking' });
    }

    // Check if booking is completed
    if (existingBooking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed bookings' });
    }

    // Update booking with rating and review
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { rating, review },
      { new: true }
    ).populate('serviceProvider', 'name email serviceCategory')
     .populate('serviceSeeker', 'name email');

    res.json(booking);
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(400).json({ message: error.message });
  }
};