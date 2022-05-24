var mongoose = require("mongoose");
var passwordValidator = require('password-validator');


module.exports.userRoleEnums = {
    admin: 1,
    customer: 2
}

var validationSchema = new passwordValidator();

validationSchema
    .is().min(8)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits(1)
    .has().symbols(1)

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true,
        minlength: 8,
        validate: {
            validator: function(v) {
                return validationSchema.validate(v);
            },
            message: 'Please Choose Password According to validations',
        }
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    pic: {
        type: String,
        require: true
    },

    number: {
        type: Number,
        require: true
    },

    isVerified: {
        type: Boolean,
        require: true
    },

    userType: {
        type: Number,
        require: true
    }
}, {
    timestamps: true
});

const userModel = mongoose.model('user', userSchema);

module.exports.model = userModel;