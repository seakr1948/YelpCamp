
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

function getRandomNumber(max = 1) {
    return Math.floor(Math.random() * max);
}

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {

    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = getRandomNumber(1000);
        const randomPrice = getRandomNumber(40) + 70;

        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: { type: 'Point', coordinates: [ cities[random1000].longitude, cities[random1000].latitude ] },
            images: [
                {
                  url: 'https://res.cloudinary.com/dqrzu5b0o/image/upload/v1646713855/YelpCamp/pk0i08tze5zbhjywrkhf.jpg',
                  filename: 'YelpCamp/pk0i08tze5zbhjywrkhf',
                },
                {
                  url: 'https://res.cloudinary.com/dqrzu5b0o/image/upload/v1646713856/YelpCamp/zhske4tpmlvoaxt5eiwm.jpg',
                  filename: 'YelpCamp/zhske4tpmlvoaxt5eiwm',
                },
                {
                  url: 'https://res.cloudinary.com/dqrzu5b0o/image/upload/v1646713858/YelpCamp/uxmmtymat1mnjrexwtq9.jpg',
                  filename: 'YelpCamp/uxmmtymat1mnjrexwtq9',
                }
              ],
            author: '622572fe9194b9918d078dc1',
            description: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nostrum quis, voluptatibus modi ab unde ipsum odit quisquam, dolorem qui suscipit, harum nobis rem doloribus nam?",
            price: randomPrice
        })
        await camp.save();
    }

    console.log("Seeding finished...");
}



seedDB()
    .then(() => {
        mongoose.connection.close();
    })
    .catch(err => {
        console.log(err);
    })

