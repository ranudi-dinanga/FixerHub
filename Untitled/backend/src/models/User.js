const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['service_seeker', 'service_provider', 'admin'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  serviceCategory: {
    type: String,
    required: function() {
      return this.role === 'service_provider';
    }
  },
  rating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  },
  hourlyRate: {
    type: Number
  },
  image: {
    type: String
  },
  bankName: {
    type: String,
    required: function() {
      return this.role === 'service_provider';
    }
  },
  accountNumber: {
    type: String,
    required: function() {
      return this.role === 'service_provider';
    }
  },
  branchName: {
    type: String,
    required: function() {
      return this.role === 'service_provider';
    }
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  // Certification system fields
  certificationPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCertifications: {
    type: Number,
    default: 0
  },
  verifiedCertifications: {
    type: Number,
    default: 0
  },
  certificationLevel: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze'
  },
  // Profile picture points
  profilePicturePoints: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Virtual for calculating certification level based on points
userSchema.virtual('calculatedCertificationLevel').get(function() {
  if (this.certificationPoints >= 500) return 'diamond';
  if (this.certificationPoints >= 300) return 'platinum';
  if (this.certificationPoints >= 150) return 'gold';
  if (this.certificationPoints >= 50) return 'silver';
  return 'bronze';
});

// Method to update certification level
userSchema.methods.updateCertificationLevel = function() {
  this.certificationLevel = this.calculatedCertificationLevel;
  return this.save();
};

// Method to add certification points
userSchema.methods.addCertificationPoints = async function(points) {
  this.certificationPoints += points;
  this.verifiedCertifications += 1;
  // totalCertifications is already incremented during upload, don't increment again
  await this.updateCertificationLevel();
  return this.save();
};

// Method to remove certification points (for rejected certifications)
userSchema.methods.removeCertificationPoints = async function(points) {
  this.certificationPoints = Math.max(0, this.certificationPoints - points);
  this.verifiedCertifications = Math.max(0, this.verifiedCertifications - 1);
  await this.updateCertificationLevel();
  return this.save();
};

// Method to add profile picture points
userSchema.methods.addProfilePicturePoints = async function(points) {
  this.profilePicturePoints += points;
  return this.save();
};

// Method to remove profile picture points
userSchema.methods.removeProfilePicturePoints = async function(points) {
  this.profilePicturePoints = Math.max(0, this.profilePicturePoints - points);
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 