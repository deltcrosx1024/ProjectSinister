//mongodb model for premium user status management
import mongoose from 'mongoose';
const premiumSchema = new mongoose.Schema({
    guildid: {
        type: String,
        required: true
    },
    userid: {
        type: String,
        required: true
    },
    premiumStatus: {
        type: String,
        enum: ['pending', 'active', 'expired'],
        default: 'pending'
    },
    planDetails: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d' // Document will be removed after 30 days
    }
});

let PremiumAddRemove = mongoose.model('PremiumAddRemove', premiumSchema);

export default PremiumAddRemove;