
var mongoose = require('mongoose')
var passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/MITA")

var userSchema = mongoose.Schema({
  headname:String,
  username: String,
  email:String,
  password:String,
  Profession:String,
  address:String,
  image: {
    type: String,
    default: "def.png"
  },
  
  

  posts:[
    {type: mongoose.Schema.Types.ObjectId, ref:"post"}
  ],
  comment: [
    {
        userid: {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
        msg:String,
        username:String,
        image:String,

        date:{
            type: Date,
            default: Date.now()
        }
    }
],
key:String,
  expirykey:Date,
})

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('user', userSchema)