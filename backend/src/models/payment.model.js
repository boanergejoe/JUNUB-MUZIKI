import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    method: {
        type: String,
        required: true,
    },
    plan: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    // Stable reference shared with the frontend and PesaPal callbacks. Sparse so
    // older payment records without this field remain valid.
    orderTrackingId: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
    },
    status: {
        type: String,
        default: "pending",
    },
    receiverBankAccount: {
        type: String,
        default: "5273 6400 8618 9896",
    },
    receiverMobileMoney: {
        type: String,
        default: "+250 795 757 432",
    },
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);
