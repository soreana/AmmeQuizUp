var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
	body: String,
	author: String,
	category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
	choices:[{title:String,answer:Boolean}]
});

CommentSchema.methods.upvote = function( cb ){
	this.upvotes += 1;
	this.save( cb );
};

mongoose.model( 'Comment' , CommentSchema );