const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/CatchAsync');
const { isLoggedIn, validateCampground, isAuthor } = require('./middleware');
const multer = require('multer');
const { storage } = require('../cloudinary/index');
var upload = multer({ storage });

const campController = require('../controllers/campgrounds');

/// Index
router.get('/', catchAsync(campController.index))

/// New
router.route('/new')
    .get(isLoggedIn, campController.getNewForm)
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campController.createNewCamp))

/// Show
router.get('/:id', catchAsync(campController.showCampground))

/// Edit
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campController.getEditForm))

router.patch('/:id/edit', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campController.updateCampground))

/// Delete
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campController.deleteCampground))

module.exports = router;