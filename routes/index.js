var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');
var mailer = require('../services/mailer');


var auth = jwt({secret:'SECRET', userProperty:'payload'});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

var mongoose = require('mongoose');
var ActivationToken = mongoose.model('ActivationToken');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

router.get( '/posts' , function( req , res , next ){
	Post.find( function ( err , posts ){
		if( err )
			return next(err);
		
		res.json( posts);
	});
});

router.post( '/posts' , auth, function( req , res , next ){
	var post = new Post( req.body );
	post.author = req.payload.username;
	
	post.save( function( err , next ){
		if( err )
			return next(err);
		res.json(post);
	});
});

router.param( 'comment' , function( req , res , next , id ){
	var query = Comment.findById( id );
	
	query.exec( function( err , comment){
		if( err )
			return next(err);
		if( !comment)
			return next( new Error('can\'t find error'));
		
		req.comment = comment; 
		return next();
	});
	
});

router.put('/posts/:post/comments/:comment/upvote' , auth, function( req , res , next){
	req.comment.upvote( function( err , comment){
		if(err)
			next ( err);
		res.json(comment);
	});
});

router.param( 'post' , function( req , res , next , id ){
	var query =  Post.findById( id );
	
	query.exec( function(err , post){
		if( err )
			return next(err);
		if( !post )
			return next( new Error('can\'t find post'));
		
		req.post = post;
		return next();
	});
});

router.param('activationToken', function (req,res,next,id) {
    ActivationToken.find({token:id},function (err,activationToken) {
        if(err)
            return next(err);
        
        if( activationToken.length <= 0)
            return next( new Error('can\'t find token.'));
        
        req.username =  activationToken[0].username;
        
        activationToken[0].remove(function (err) {
            if(err)
                return next(err);
            console.log("token was removed!");
        });

        return next();
    });
});

router.get( '/posts/:post', function( req , res ){
	req.post.populate('comments', function(err, post) {
    	if (err) 
			return next(err);

    	res.json(post);
  	});
});

router.put( '/posts/:post/upvote', auth,function( req , res , next ){
	req.post.upvote( function( err , post ){
		if(err)
			next ( err);
		res.json(post);
	});
});

router.post( '/posts/:post/comments' , auth, function( req , res , next){
	var comment = new Comment(req.body);
	comment.post = req.post;
	comment.author = req.payload.username;
	
	comment.save(function(err, comment){
    if(err)
		return next(err);

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err)
		  return next(err);

      res.json(comment);
    });
  });
});

router.get('/activation/:activationToken/',function (req,res,next) {
    console.log(req.username);
    
    // TODO check error
    User.find({username:req.username},function (err,user) {
        user.isActivated = true; 
    });
    
    // TODO return some template
});

router.post('/register', function(req,res,next){
	if( !req.body.username || !req.body.password || !req.body.email)
		return res.status(400).json({message:'لطفا تمام فیلد‌های زیر را پر کنید.'});
    
    if ( !req.body.agreement )
        return res.status(400).json({message:'لطفا با شرایط سایت موافقت کنید.'});
	
	var user = new User();
	
	user.username = req.body.username ;
    user.country = req.body.country;
    user.email = req.body.email;
    user.isActivated= false;
    
    
    require('crypto').randomBytes(48, function(ex, buf) {
        var activationToken = new ActivationToken();
        activationToken.token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-')
        activationToken.username = user.username;
        mailer.sendActivationCodeTo(user.email,activationToken.token);
        
        user.setPassword(req.body.password);
        
        console.log(activationToken.token);
        
        activationToken.save(function (err) {
            if(err) {
                console.log(err.merge);
            }
        });
    });

	user.save( function(err){
		if(err){
			console.log(err.message);
			return next(err);
		}
		
		return res.json({token:user.generateJWT()});
	});
});

router.post('/login', function(req,res,next){
	if(!req.body.username || !req.body.password)
		return res.status(400).json({message:'لطفا فیلد‌های زیر را پر کنید.'});
	
	passport.authenticate('local', function(err,user,info){
		if(err) return next(err);
		if(user){
      		return res.json({token: user.generateJWT()});
    	} else {
      		return res.status(401).json(info);
    	}
  		})(req, res, next);
})




