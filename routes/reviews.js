const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/CatchAsync');
const expressError = require('../utils/ExpressError');

const reviewController = require('../controllers/reviews');

const { validateReview, isLoggedIn, isReviewAuthor } = require('./middleware');



// New
router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.createReview))

// Delete
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview))

module.exports = router;