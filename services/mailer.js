//noinspection SpellCheckingInspection
/**
 * Created by sinaikashipazha on 4/11/16.
 */

var nodemailer = require('nodemailer');

//noinspection SpellCheckingInspection
var transporter = nodemailer.createTransport('smtps://niceguyofsotflab%40gmail.com:ju7654321qa@smtp.gmail.com');

var mailOptions = {
    from: '"Parkoosh Team " <niceguyofsotflab@gmail.com>', // sender address
};

var helper = {
    getActivationLink: function (key) {
        return 'http://parkoosh.ir/' + key;
    },
    getChallengeRout: function (route) {
        return 'http://parkoosh.ir' + route; 
    },
    sendMail : function (options) {
        //noinspection JSUnresolvedFunction
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
    },
    getChallengeResultText : function (user1,user2) {
        // TODO implement this function
        return 'user1 wins.';
    },
    getChallengeResultHtml : function (user1,user2) {
        // TODO implement this function
        return '<h1>user1 wins.</h1>';
    }
};

module.exports = {
    sendActivationCodeTo: function (emailAddress, key) {
        mailOptions.to = emailAddress;
        mailOptions.subject = 'فعال کردن حساب کاربری'; // Subject line 
        mailOptions.text = 'با کلیک بر روی لینک زیر حساب کاربری خود را فعال کنید:'; // plaintext body 
        mailOptions.html = '<h1>' + mailOptions.text + '</h1>';// html body 

        // TODO get template not making template
        mailOptions.text += helper.getActivationLink(key);
        mailOptions.html += '<p>' + helper.getActivationLink(key) + '</p>';
        
        helper.sendMail(mailOptions);
    },
    sendChallengeInvitationTo: function (emailAddress, route) {
        mailOptions.to = emailAddress;
        mailOptions.subject = 'دعوت به مبارزه';
        mailOptions.text = 'با کلیک بر روی لینک زیر وارد مبارزه شوید:';
        mailOptions.html = '<h1>' + mailOptions.text + '</h1>';

        mailOptions.text += helper.getChallengeRout(route);
        mailOptions.html += '<p>'+ helper.getChallengeRout(route)+'</p>';
        
        helper.sendMail(mailOptions);
    },
    sendChallengeResultTo: function (user1, user2) {
        mailOptions.to = user1.getEmail() + ', ' + user2.getEmail();
        mailOptions.subject = 'نتایج مبارزه';
        mailOptions.text = helper.getChallengeResultText(user1,user2);
        mailOptions.text = helper.getChallengeResultHtml(user1,user2);

        helper.sendMail(mailOptions);
    }
};
