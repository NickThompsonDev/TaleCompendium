// PaymentPage.tsx
import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripeClient';
import TokenSelection from './TokenSelection';
import PaymentForm from './PaymentForm';
import SuccessMessage from './SuccessMessage';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { tokenAmounts } from '@/constants';
import { useUser } from '@clerk/nextjs';
import { Appearance } from '@stripe/stripe-js';

interface PaymentPageProps {
  open: boolean;
  onClose: () => void;
}

const appearance: Appearance = {
  theme: 'night',
  labels: 'floating'
};

const PaymentPage: React.FC<PaymentPageProps> = ({ open, onClose }) => {
  const [step, setStep] = useState<'selection' | 'payment' | 'success'>('selection');
  const [selectedToken, setSelectedToken] = useState<{ amount: number, price: number } | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const createPaymentIntent = useAction(api.actions.stripeActions.createPaymentIntent);
  const { user } = useUser();

  const handleProceedToPayment = async (amount: number) => {
    if (!user) {
      console.error('User not logged in');
      return;
    }

    const tokenData = tokenAmounts.find(token => token.amount === amount);
    if (!tokenData) {
      throw new Error('Invalid token amount selected');
    }
    setSelectedToken(tokenData);
    const { clientSecret } = await createPaymentIntent({
      amount: tokenData.price * 100, // Convert to cents
      currency: 'usd',
    });
    setClientSecret(clientSecret);
    setStep('payment');
  };

  const handlePaymentSuccess = () => {
    setStep('success');
  };

  const handleClose = () => {
    setStep('selection');
    setSelectedToken(null);
    setClientSecret(null);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-50 mx-auto my-16 w-full max-w-lg p-6 bg-black-1 rounded-lg shadow-lg border border-white">
        {step === 'selection' && <TokenSelection onProceed={handleProceedToPayment} />}
        {step === 'payment' && clientSecret && selectedToken && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
            <PaymentForm
              clientSecret={clientSecret}
              tokenAmount={selectedToken.amount}
              dollarAmount={selectedToken.price}
              onClose={handleClose}
              onSuccess={handlePaymentSuccess}
            />
          </Elements>
        )}
        {step === 'success' && <SuccessMessage onClose={handleClose} />}
      </div>
    </div>
  );
};

const PaymentModal = ({ open, onClose }: PaymentPageProps) => (
  <Elements stripe={stripePromise}>
    <PaymentPage open={open} onClose={onClose} />
  </Elements>
);

export default PaymentModal;
