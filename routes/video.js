const mongoose = require('mongoose')


const videoSchema = mongoose.Schema({

    postvideo:{
        type:String
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    data:String,
})


module.exports = mongoose.model('video', videoSchema)