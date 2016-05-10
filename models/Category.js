var mongoose = require('mongoose');

var CategorySchema = new mongoose.Schema({
	title: String,
	//link: String,
	// upvotes: {type: Number , default: 0 },
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

/*
CategorySchema.methods.upvote = function(cb ){
	console.log( this.upvotes );
	this.upvotes += 1;
	this.save(cb);
};
*/

mongoose.model( 'Category' , CategorySchema );