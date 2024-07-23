import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { Button } from '@/components/ui/button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  userId: any;
}

const tokenAmounts = [
  { amount: 40, price: 1 },
  { amount: 220, price: 5 },
  { amount: 450, price: 10 },
  { amount: 920, price: 20 },
];

const PaymentModal = ({ open, onClose, userId }: PaymentModalProps) => {
  const [selectedAmount, setSelectedAmount] = useState(0);
  const stripe = useStripe();
  const elements = useElements();

  const createPaymentIntent = useMutation(api.stripe.createPaymentIntent);
  const addTokens = useMutation(api.stripe.addTokens);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || selectedAmount === 0) {
      return;
    }

    const selectedToken = tokenAmounts.find(token => token.amount === selectedAmount);
    if (!selectedToken) {
      console.log('Invalid token amount selected');
      return;
    }

    const { clientSecret } = await createPaymentIntent({
      amount: selectedToken.price * 100, // Convert to cents
      currency: 'usd'
    });

    if (!clientSecret) {
      console.log('Failed to create payment intent');
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (result.error) {
      console.log(result.error.message);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded!');
        await addTokens({ userId, tokens: selectedAmount });
        onClose();
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-50 mx-auto my-16 w-full max-w-lg p-6 bg-black-1 rounded-lg shadow-lg border border-white">
        <h2 className="text-xl font-bold text-white-1 mb-4">Buy Tokens</h2>
        <div className="flex flex-col gap-4">
          {tokenAmounts.map(({ amount, price }) => (
            <Button
              key={amount}
              variant="outline"
              className={`text-white-1 py-2 px-4 font-extrabold transition-all duration-500 hover:bg-orange-1 ${selectedAmount === amount ? 'border-orange-500 bg-orange-1' : 'border-white'}`}
              onClick={() => handleAmountSelect(amount)}
            >
              ${price} for {amount} Tokens
            </Button>
          ))}
          <CardElement className="p-4 border border-gray-300 rounded-md bg-white" />
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button  className="text-16 bg-orange-1 py-2 px-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1" onClick={onClose}>Cancel</Button>
          <Button className="text-16 bg-orange-1 py-2 px-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1" onClick={handleSubmit} disabled={!stripe || selectedAmount === 0}>
            Pay ${selectedAmount === 0 ? 0 : tokenAmounts.find(token => token.amount === selectedAmount)?.price}
          </Button>
        </div>
      </div>
    </div>
  );
};

const PaymentPage = ({ open, onClose, userId }: PaymentModalProps) => (
  <Elements stripe={stripePromise}>
    <PaymentModal open={open} onClose={onClose} userId={userId} />
  </Elements>
);

export default PaymentPage;
