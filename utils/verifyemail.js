const mailjet = require('node-mailjet');


const transpoter = mailjet.connect(
    'YOUR API KEY',
    'YOUR SECRET KEY')

module.exports = function sendMail(email, title, body, html, callback) {
    console.log("email sent " + email)
    const request = transpoter.post('send').request({
        FromEmail: 'YOUREMAIL@gmail.com',
        FromName: 'E-commerece',
        Subject: title,
        'Text-part': body,
        'Html-part': html,
        Recipients: [{ Email: email }],
    })
    request
        .then(result => {
            callback();
        })
        .catch(err => {
            console.log("error");
        })
}
