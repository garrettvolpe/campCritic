
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const { join } = require('path');
const review = require('./models/review');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanatize = require('express-mongo-sanitize');
const helmet = require('helmet');


const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const dbURL = process.env.DB_URL;
const dbSecret = process.env.DB_SECRET;
const mongoDBStore = require('connect-mongo');



mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected!")
})


const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(mongoSanatize());
app.use(helmet());


const scriptSrcUrls = [
    'https://api.mapbox.com/mapbox-gl-js/v2.11.0/',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/',
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    'https://api.mapbox.com/mapbox-gl-js/v2.11.0/',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/',
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    'https://api.mapbox.com/mapbox-gl-js/v2.11.0/',
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
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
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/djjaxwfvu/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    }),
    helmet.crossOriginEmbedderPolicy({
        policy: "credentialless"
    })
);

const store = new mongoDBStore({
    mongoUrl: dbURL,
    secret: dbSecret,
    touchAfter: 24 * 60 * 60
})

store.on("error", function(e){
console.log("session store error", e)
})


const sessionConfig = {
    store, 
    name: 'sesID',
    secret: 'thisismysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: "gv@gmail.com", username: "gvolpe2592" });
    const newUser = await User.register(user, 'monkey')
    res.send(newUser)
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.render("home")
})



app.all('*', (req, res, next) => {
    next(new ExpressError("page not found!?", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "test message" } = err
    if (!err.message) err.message = "Oh no! Something went wrong";
    res.status(statusCode).render('error.ejs', { err })
    res.send("oh boy, something went wrong")
})


app.listen(3000, () => {
    console.log("Serving on port 3000")
})


