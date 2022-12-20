const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isAuthor, isReviewAuthor } = require('../middleware')
const catchAsync = require('../utils/catchAsync')
const reviews = require('../controllers/reviews')


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;
