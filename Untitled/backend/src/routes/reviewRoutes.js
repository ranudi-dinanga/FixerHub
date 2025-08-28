const express = require('express');
const router = express.Router();
const {
  addReview,
  getProviderReviews,
  getSeekerReviews
} = require('../controllers/reviewController');

// Add a review
router.post('/', addReview);

// Get reviews for a service provider
router.get('/provider/:providerId', getProviderReviews);

// Get reviews by a service seeker
router.get('/seeker/:seekerId', getSeekerReviews);

module.exports = router;
