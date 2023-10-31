var express = require('express');
var router = express.Router();
var userModel = require('./users');
var postModel = require('./posts');
const passport = require('passport');
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const crypto = require('crypto');
// const {Readable} = require('stream')
// const mongoose = require('mongoose');



const mailer = require("../nodemailer")

const localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()))


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueSuffix)
  }
})



const upload = multer({ storage: storage })

router.post('/upload', isLoggedIn, upload.single("image"), function(req, res){
  userModel.findOne({username: req.session.passport.user})
  .then(function(userdets){
        if(userdets.image !== 'def.png'){
      fs.unlinkSync(`./public/images/uploads/${userdets.image}`);
    }

userdets.image = req.file.filename;
userdets.save()
.then(function(){
res.redirect("back")
})
  })
})

// video uopload

// const conn = mongoose.connection
// var gfsBucket;

// conn.once('open', () => {

//   gfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
//     bucketName: 'songs'
//   })
// })


//  const storage2 = multer.memoryStorage()
//  const upload2 = multer({ storage: storage2 })


// router.post('/uploadFile', upload2.single('song'), function(req, res, next){
// res.send('uploaded')


//  })


// router.get('/listen', (req, res, next) => {
//   gfsBucket.openDownloadStreamByName('chacha').pipe(res)
// })

// router.post('/uploadFile', isLoggedIn, upload2.single("postvideo"), function(req, res){
//   userModel.findOne({username: req.session.passport.user})
//   .then(function(user){
//     videoModel.create({
//       postvideo:req.file.filename,
//       data: req.body.post,
//       userid: user._id,
//     })
//     .then(function(post){
//       Readable.from(req.file.buffer).pipe(gfsBucket.openUploadStream('chacha'))

//       user.posts.push(post._id)
//       user.save()
//       .then(function(){
//         res.redirect("back")
//       })
//     })
//   })
// })








/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/forgot', function(req, res, next){
  res.render('forgot')
})


// for sent emai;
router.post('/forgot', async function(req, res, next){
  var user = await userModel.findOne({email:req.body.email})
  if(!user){
    res.send("we've sent a mail, if email exists");

  } 
  else{
    // user ke liye ek key banao
    crypto.randomBytes(80, async function(err, buff){
      let key = buff.toString("hex");
      mailer(req.body.email, user._id, key)
      .then(async function(){
      user.expirykey = Date.now() + 24*60*60*1000;
        user.key = key;
        await user.save();
        res.send("mail sent")
      
      })
    })
  }
})

router.get('/forgot/:userid/:key', async function(req, res, next){
  let user = await userModel.findOne({_id: req.params.userid})
  if(user.key === req.params.key && Date.now() < user.expirykey){

    // show a page to user which asks for new password
    res.render("reset", {user})
    
  }
  else{
    res.send("tez hmmmmmmmmmmmmmm")
  }
});

router.post('/resetpass/:userid', async function(req, res, next){
  
  let user  = await userModel.findOne({_id: req.params.userid})
  user.setPassword(req.body.password, async function(){
    user.key = "";
    await user.save()
    req.logIn(user, function(){
      res.redirect("/profile");
    })
  })
})

router.get('/profile', isLoggedIn, function(req, res, next){
  userModel
  .findOne({username: req.session.passport.user})
  .populate({
    path:'posts',
    populate:{
      path:'comment',
      populate:{
        path:'userid'
      }
    }
  })
  .then(function(userdets){
    console.log(userdets);
    res.render('profile', {userdets})
  })
})

router.get('/delete/:id', function(req, res,){
  postModel.findOneAndDelete({_id: req.params.id})
  .then(function(deleteduser){
    res.redirect("back")
  })
})


router.get('/deleteuser/:id', function(req, res, next){
  // console.log(req.params.id);
  userModel.findOneAndDelete({_id: req.params.id})
  .then(function(deleted){
    postModel.findOneAndDelete({userid: req.params.id})
    .then(function(){
      res.render("index");
    })
  })
})


router.get('/like/:postid', isLoggedIn, function(req, res){
  userModel
  .findOne({username: req.session.passport.user})
  .then(function(user){
    postModel
    .findOne({_id: req.params.postid})
    .then(function(post){
      if(post.likes.indexOf(user._id) === -1){
        post.likes.push(user._id);
      }
      else{
        post.likes.splice(post.likes.indexOf(user._id), 1);
      }
      post.save()
      .then(function(){
        res.redirect("back");
      })
    })
  })
});

router.get("/check/:username", function(req, res){
  userModel.findOne({username: req.params.username})
  .then(function(b){
if(b){
  res.json(true)
}
else{
  res.json(false)
}
  })
})

router.post('/update', isLoggedIn, function (req, res, next) {
  userModel
  .findOneAndUpdate({username: req.session.passport.user}, {username: req.body.username,
     Profession: req.body.Profession,
     address: req.body.address}, {new: true})
  .then(function(updateduser){
    req.login(updateduser, function(err) {            // this is documentation of login
      if (err) { return next(err); }
      return res.redirect('/profile');
    });
  })
});

router.get('/edit', isLoggedIn,  function(req, res){
  userModel
  .findOne({username: req.session.passport.user})
  .then(function(founduser){
    console.log(founduser)
    res.render("edit", {founduser})
  })
})



router.get('/feed', isLoggedIn, function(req, res,){
  userModel.findOne({username: req.session.passport.user})
  .then(function(user){
    postModel.find() 
    .populate("userid comment.userid")
    .then(function(allposts){
      
      res.render('feed', {allposts, user})
    })
  })
})


// Add a comment to a post

router.post('/comment/:postid', isLoggedIn, function(req, res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(founduser){
postModel.findOne({_id:req.params.postid})
.then(function(post){
post.comment.push({
  username:founduser.username,
  msg:req.body.comment,
  image:req.body.image,
  userid:founduser._id
})

post.save()
.then(function(){
  res.redirect('back')
})
})
  })
})

router.post('/post', isLoggedIn, upload.single("postimage"), function(req, res){
  userModel.findOne({username: req.session.passport.user})
  .then(function(user){
    postModel.create({
      postimage:req.file.filename,
      data: req.body.post,
      userid: user._id,
      
    })
    .then(function(post){

      user.posts.push(post._id)
      user.save()
      .then(function(){
        res.redirect("back")
      })
    })
  })
})

// Add a comment to a post

router.post('/comment/:postid', isLoggedIn, function(req, res){
  userModel.findOne({username: req.session.body.passport})
  .then(function(founduser){
    postModel.findOne({_id:req.params.postid})
    .then(function(post){
      post.comment.push({
        username:founduser.username,
        msg:req.body.comment,
        image:req.body.image,
        userid:founduser._id
      })

      post.save()
      .then(function(){
        res.redirect('back')
      })
    })
  })
})

router.post('/register', function(req, res, next){
  var newUser = new userModel({
    email: req.body.email,
    headname:req.body.headname,
    username: req.body.username,
    password:req.body.password,
    Profession:req.body.Profession,
    
  })
  userModel.register(newUser, req.body.password)
  .then(function(u){
    passport.authenticate('local')(req, res, function(){
      res.redirect('/profile')
      
    })
  })
  .catch(function(e){
    res.send(e)
  })
})

router.get('/login', function(req, res){
  res.render('login');

})


router.post('/login', passport.authenticate('local',{
  successRedirect: '/profile',
  failureRedirect:'/login'
}), function(req, res, next){ })

function isLoggedIn(req, res, next){
if(req.isAuthenticated()){
  return next();
}
else{
  res.redirect('/login')
}
}

router.get('/logout', function(req, res, next){
  req.logout(function(err){
    if(err) {return next(err)}
    res.redirect('/login');
  })
})


router.get('/logout', function(req,res, next){
  req.logout();
  res.redirect('/login')

})


module.exports = router;
