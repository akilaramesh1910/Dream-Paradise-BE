import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
export const stripe = new Stripe(stripeSecret, { apiVersion: '2022-11-15' });

export const createPaymentIntent = async (amount: number, currency = 'usd', metadata: Record<string, string> = {}) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // amount in cents
    currency,
    metadata,
  });
  return paymentIntent;
};

export const constructEvent = (payload: Buffer, sig: string | undefined, webhookSecret: string) => {
  return stripe.webhooks.constructEvent(payload, sig as string, webhookSecret);
};
