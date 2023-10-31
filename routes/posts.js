const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    data:String,
    likes: [
        { type:mongoose.Schema.Types.ObjectId, ref:"user"}
    ],
    image: {
        type:String,
        userid: {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
    },

    
    comment: [
        {
            userid: {
                type:mongoose.Schema.Types.ObjectId,
                ref:"user"
            },
            msg:String,
            username:String,
            headname:String,
            image:String,

            date:{
                type: Date,
                default: Date.now()
            }
        }
    ],

    date:{
        type: Date,
        default: Date.now()
    },

    postimage:{
        type:String
    },

})


module.exports = mongoose.model("post", postSchema);