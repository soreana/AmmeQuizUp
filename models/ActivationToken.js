var mongoose = require('mongoose');

var ActivationTokenSchema = new mongoose.Schema({
	token: String,
    username: { type: String ,lowercase: true , unique: true}
});

mongoose.model( 'ActivationToken' , ActivationTokenSchema);
