const Review = require('../models/Review');
const Booking = require('../models/Booking');

// Add a review
exports.addReview = async (req, res) => {
  try {
    const { bookingId, ratings, comment, photos, wouldRecommend } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure booking is completed and has not been reviewed
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Booking not completed yet' });
    }

    const review = new Review({
      booking: booking._id,
      serviceProvider: booking.serviceProvider,
      serviceSeeker: booking.serviceSeeker,
      ratings,
      comment,
      photos,
      wouldRecommend
    });

    await review.save();

    res.status(201).json(review);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      message: 'Error adding review',
      error: error.message
    });
  }
};

// Fetch reviews for a service provider
exports.getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ serviceProvider: req.params.providerId })
      .populate('serviceSeeker', 'name email')
      .populate('booking', 'date');
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

// Fetch reviews for a service seeker
exports.getSeekerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ serviceSeeker: req.params.seekerId })
      .populate('serviceProvider', 'name email serviceCategory')
      .populate('booking', 'date');
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};
