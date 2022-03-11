if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Variables
const PORT = 3000;
const MILLISECONDS_TO_ONE_WEEK = (1000 * 60 * 60 * 24 * 7);
const dbUrl = process.env.MONGO_URL || "mongodb://localhost:27017/yelp-camp";
const secret = process.env.SECRET || "thisshouldbeasecret!!!";

// Imports

/// npm
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const MongoDBStore = require('connect-mongo');

// Routers
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user');

// Error handler
const expressError = require('./utils/ExpressError');

// Model
const User = require('./models/user');

// Configuration
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24*60*60
});

store.on("error", function(e) {
    console.log("Session Store Error", (e))
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + MILLISECONDS_TO_ONE_WEEK,
        maxAge: MILLISECONDS_TO_ONE_WEEK
    }

}


app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "*.cloudinary.com",
                "https://res.cloudinary.com/dqrzu5b0o", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
app.use(mongoSanitize({replaceWith: '_'}));
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())



// Database Connection
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

app.use((req, res, next) => {
    console.log(req.query);
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})



// Campgrounds
app.use('/campgrounds', campgroundRoutes);

/// Reviews
app.use('/campgrounds/:id/reviews', reviewRoutes);

// Users
app.use('/', userRoutes);

// Routes
app.get('/', (req, res) => {
    res.render("home")
})

app.all('*', (req, res, next) => {
    next(new expressError(404, 'Page not found'))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong!'
    res.render('error', { err: err });
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})

