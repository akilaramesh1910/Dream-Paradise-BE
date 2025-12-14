import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
    userId: mongoose.Types.ObjectId;
    paymentIntentId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'failed' | 'canceled';
    customerEmail: string;
    customerName?: string;
    shippingDetails?: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        phone: string;
    };
    cartItems: Array<{
        productId: mongoose.Types.ObjectId;
        name: string;
        quantity: number;
        price: number;
    }>;
    metadata?: any;
    stripeResponse?: any;
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Optional if allowing guest checkout
        },
        paymentIntentId: {
            type: String,
            required: true,
            unique: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
            default: 'inr',
        },
        status: {
            type: String,
            enum: ['pending', 'succeeded', 'failed', 'canceled'],
            default: 'pending',
        },
        customerEmail: {
            type: String,
            required: true,
        },
        customerName: {
            type: String,
        },
        shippingDetails: {
            firstName: String,
            lastName: String,
            address: String,
            city: String,
            state: String,
            zipCode: String,
            phone: String,
        },
        cartItems: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                },
                name: String,
                quantity: Number,
                price: Number,
            },
        ],
        metadata: {
            type: Schema.Types.Mixed,
        },
        stripeResponse: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ paymentIntentId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
