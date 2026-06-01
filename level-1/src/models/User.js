const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false // Automatically hides password hashes from standard GET queries
    }
}, { timestamps: true });

// Pre-save hook: Automatically hash password if it was modified
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    
    this.password = await bcrypt.hash(this.password, 12);
});

// Instance method: Convenient helper to verify passwords later during login
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);