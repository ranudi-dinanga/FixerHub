const mongoose = require('mongoose');

/**
 * Validate ObjectId and send error response if invalid
 * @param {string} id - ObjectId to validate
 * @param {string} fieldName - Name of the field for error message
 * @param {object} res - Express response object
 * @returns {boolean} - Returns false if invalid (response sent), true if valid
 */
const validateObjectId = (id, fieldName, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: `Invalid ${fieldName} format` });
    return false;
  }
  return true;
};

/**
 * Handle common error response
 * @param {Error} error - Error object
 * @param {object} res - Express response object
 * @param {string} message - Custom error message
 * @param {number} statusCode - HTTP status code
 */
const handleError = (error, res, message = 'Internal server error', statusCode = 500) => {
  console.error(`Error: ${message}`, error);
  res.status(statusCode).json({ 
    message,
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
};

/**
 * Handle not found response
 * @param {object} res - Express response object
 * @param {string} resource - Name of the resource not found
 */
const handleNotFound = (res, resource) => {
  res.status(404).json({ message: `${resource} not found` });
};

/**
 * Handle success response
 * @param {object} res - Express response object
 * @param {object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const handleSuccess = (res, data, message = 'Operation successful', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
};

/**
 * Validate required fields
 * @param {object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @param {object} res - Express response object
 * @returns {boolean} - Returns false if validation fails (response sent), true if valid
 */
const validateRequiredFields = (data, requiredFields, res) => {
  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    res.status(400).json({ 
      message: `Missing required fields: ${missingFields.join(', ')}` 
    });
    return false;
  }
  return true;
};

/**
 * Check user authorization
 * @param {string} userId - Current user ID
 * @param {string} resourceUserId - Resource owner user ID
 * @param {object} res - Express response object
 * @param {string} message - Custom unauthorized message
 * @returns {boolean} - Returns false if unauthorized (response sent), true if authorized
 */
const checkAuthorization = (userId, resourceUserId, res, message = 'Not authorized to access this resource') => {
  if (userId !== resourceUserId.toString()) {
    res.status(403).json({ message });
    return false;
  }
  return true;
};

/**
 * Generate pagination data
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 * @returns {object} - Pagination metadata
 */
const getPaginationData = (page, limit, total) => {
  return {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
    limit: parseInt(limit),
    total,
    hasNext: page * limit < total,
    hasPrev: page > 1
  };
};

/**
 * Convert currency from USD to LKR (Sri Lankan Rupees)
 * @param {number} usdAmount - Amount in USD
 * @param {number} exchangeRate - USD to LKR exchange rate (default: 300)
 * @returns {number} - Amount in LKR
 */
const convertToLKR = (usdAmount, exchangeRate = 300) => {
  return Math.round(usdAmount * exchangeRate * 100) / 100;
};

/**
 * Convert currency from LKR to USD
 * @param {number} lkrAmount - Amount in LKR
 * @param {number} exchangeRate - USD to LKR exchange rate (default: 300)
 * @returns {number} - Amount in USD
 */
const convertToUSD = (lkrAmount, exchangeRate = 300) => {
  return Math.round(lkrAmount / exchangeRate * 100) / 100;
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code ('LKR' or 'USD')
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount, currency = 'LKR') => {
  if (currency === 'LKR') {
    return `Rs. ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${amount.toFixed(2)}`;
};

/**
 * Get current exchange rate from external API (fallback to default)
 * @returns {Promise<number>} - USD to LKR exchange rate
 */
const getCurrentExchangeRate = async () => {
  try {
    // In production, you might want to use a real exchange rate API
    // For now, return a default rate
    return 300; // 1 USD = 300 LKR (approximate)
  } catch (error) {
    console.warn('Failed to fetch exchange rate, using default:', error.message);
    return 300;
  }
};

module.exports = {
  validateObjectId,
  handleError,
  handleNotFound,
  handleSuccess,
  validateRequiredFields,
  checkAuthorization,
  getPaginationData,
  convertToLKR,
  convertToUSD,
  formatCurrency,
  getCurrentExchangeRate
};
