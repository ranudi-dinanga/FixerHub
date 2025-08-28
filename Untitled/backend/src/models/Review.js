const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceSeeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratings: {
    overall: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    quality: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    timeliness: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    cleanliness: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    }
  },
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  photos: [{
    type: String // URLs to uploaded photos
  }],
  wouldRecommend: {
    type: Boolean,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: true // Since only actual customers can review
  },
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  providerResponse: {
    response: String,
    responseDate: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
reviewSchema.index({ serviceProvider: 1, createdAt: -1 });
reviewSchema.index({ serviceSeeker: 1, createdAt: -1 });
reviewSchema.index({ booking: 1 }, { unique: true }); // One review per booking

module.exports = mongoose.model('Review', reviewSchema);
