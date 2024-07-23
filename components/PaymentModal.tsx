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

const PaymentModal = ({ open, onClose, userId }: PaymentModalProps) => {
  const [selectedAmount, setSelectedAmount] = useState(0);
  const stripe = useStripe();
  const elements = useElements();

  // Use the useMutation hook for your mutations
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

    try {
      const { clientSecret } = await createPaymentIntent({
        amount: selectedAmount * 100,
        currency: 'usd',
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
    } catch (error) {
      console.error('Error during payment processing:', error);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-50 mx-auto my-16 w-full max-w-lg p-6 bg-black-1 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white-1">Buy Tokens</h2>
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className={`${
              selectedAmount === 40 ? 'border-blue-500' : 'border-gray-300'
            } text-white-1 hover:bg-orange-1`}
            onClick={() => handleAmountSelect(40)}
          >
            $1 for 40 Tokens
          </Button>
          <Button
            variant="outline"
            className={`${
              selectedAmount === 220 ? 'border-blue-500' : 'border-gray-300'
            } text-white-1 hover:bg-orange-1`}
            onClick={() => handleAmountSelect(220)}
          >
            $5 for 220 Tokens
          </Button>
          <Button
            variant="outline"
            className={`${
              selectedAmount === 450 ? 'border-blue-500' : 'border-gray-300'
            } text-white-1 hover:bg-orange-1`}
            onClick={() => handleAmountSelect(450)}
          >
            $10 for 450 Tokens
          </Button>
          <Button
            variant="outline"
            className={`${
              selectedAmount === 920 ? 'border-blue-500' : 'border-gray-300'
            } text-white-1 hover:bg-orange-1`}
            onClick={() => handleAmountSelect(920)}
          >
            $20 for 920 Tokens
          </Button>
          <CardElement className="p-4 border rounded-md bg-black-1 text-white-1" />
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" onClick={onClose} className="text-white-1 hover:bg-orange-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!stripe || selectedAmount === 0}
            className="text-white-1 bg-orange-1 py-2 px-4 font-extrabold hover:bg-black-1"
          >
            Pay ${(selectedAmount / 40).toFixed(2)}
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
