const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

const ExpressError = require('./utils/ExpressError')
const Joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const { join } = require('path');
const review = require('./models/review');


const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');


mongoose.connect('mongodb+srv://garrett:WbPC3uL0rNRm0ltC@campgrounds.pcpwmwg.mongodb.net/campgrounds?retryWrites=true&w=majority', {
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





app.use('/campgrounds', campgrounds)

app.use('/campgrounds/:id/reviews', reviews)
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.render("home")
})



app.all('*', (req, res, next) => {
    next(new ExpressError("page not found!", 404))
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


