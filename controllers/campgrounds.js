const {cloudinary } = require('../cloudinary/index');
const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_KEY;
const geocoder = mbxGeocoding({accessToken: MAPBOX_TOKEN});
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.getNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createNewCamp = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user.id;
    campground.geometry = geoData.body.features[0].geometry
    await campground.save();
    console.log(campground)
    req.flash('success', 'Successfully created a new campground!');
    res.redirect('/campgrounds');
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author').exec();
    if (!campground) {

        req.flash('error', 'Campground cannot be found!')
        return res.redirect('/campgrounds');

    }
    res.render('campgrounds/show', { campground });
}

module.exports.getEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {

        req.flash('error', 'Campground cannot be found!')
        return res.redirect('/campgrounds');

    }

    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    const edit = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    edit.images.push(...images); 
    await edit.save();
    if (req.body.deleteImages){

        for (let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await edit.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
        console.log(edit);
    }
    
    req.flash('success', 'Successfully updated the campground');
    res.redirect(`/campgrounds/${edit.id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground');
    res.redirect('/campgrounds');
}