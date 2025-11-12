import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';

export const stripe = new Stripe(stripeSecret);

export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
  });
  return paymentIntent;
};

export const constructEvent = (payload: Buffer, sig: string | undefined, webhookSecret: string) => {
  return stripe.webhooks.constructEvent(payload, sig as string, webhookSecret);
};
