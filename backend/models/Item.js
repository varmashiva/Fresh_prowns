import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    images: [
        {
            url: { type: String, required: true },
            publicId: { type: String, required: true }
        }
    ],
    marketPrice: {
        type: Number,
        required: true,
        default: 0
    },
    discount: {
        type: Number,
        required: true,
        default: 0
    },
    description: {
        type: String,
        default: ''
    },
    usageInstructions: {
        type: String,
        default: ''
    },
    shelfLifeStorage: {
        type: String,
        default: ''
    }
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);
