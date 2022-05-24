const mailjet = require('node-mailjet');


const transpoter = mailjet.connect(
    '6799cd39060a714fd14390a954c8e263',
    'fddd61fb9de2908bab8d7392c6bc6b05')

module.exports = function sendMail(email, title, body, html, callback) {
    console.log("email sent " + email)
    const request = transpoter.post('send').request({
        FromEmail: 'killingmachinekh@gmail.com',
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