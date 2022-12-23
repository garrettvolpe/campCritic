const { func } = require('joi');
const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;


// https://res.cloudinary.com/djjaxwfvu/image/upload/w_300/v1671645294/CampCritic/odj6jb1vusazqbmrqic9.webp
const imageSchema = new Schema(
    {
    url: String,
    filename: String
});

imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace("/upload", '/upload/w_200')
})

const opts = {toJSON: {virtuals: true}};

const CampgroundSchema = new Schema({

    title: String,
    images: [imageSchema],
    price: Number,
    image: String,
    description: String,
    geometry: {
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
},opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<a href="/campgrounds/${this.id}">${this.title}</a>`;
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await review.remove({
            _id: {
                $in: doc.reviews
            }
        })
    }

});

module.exports = mongoose.model('Campground', CampgroundSchema)