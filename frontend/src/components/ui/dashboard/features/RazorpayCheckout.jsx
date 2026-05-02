import { useState } from 'react';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SkanseMumxtVBq';

export default function RazorpayCheckout({ amount, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!amount || amount < 1) {
      onError?.('Invalid amount. Minimum is ₹1');
      return;
    }

    setLoading(true);

    try {
      const amountInPaise = Math.round(amount * 100);

      const orderResponse = await fetch('http://localhost:3001/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInPaise }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const { order_id, amount: orderAmount } = await orderResponse.json();

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: 'INR',
        name: 'Chronotrade',
        description: 'Subscription Payment',
        order_id,
        handler: async (response) => {
          try {
            const verifyResponse = await fetch('http://localhost:3001/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyResult.success) {
              throw new Error(verifyResult.error || 'Payment verification failed');
            }

            onSuccess?.({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });
          } catch (err) {
            onError?.(err.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: 'Chronotrade User',
          email: '',
          contact: '',
        },
        theme: {
          color: '#fbbf24',
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (response) => {
        onError?.(response.error.description || 'Payment failed');
      });

      rzp.open();
    } catch (err) {
      onError?.(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 disabled:opacity-50"
    >
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
}