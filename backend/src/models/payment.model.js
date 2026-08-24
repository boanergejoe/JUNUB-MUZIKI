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
