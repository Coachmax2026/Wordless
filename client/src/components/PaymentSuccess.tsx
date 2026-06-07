import React, { useEffect, useState } from 'react';
import { savePurchase } from '../utils/purchases';

const PaymentSuccess: React.FC = () => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const categoryName = params.get('category');
    setCategory(categoryName);

    if (sessionId && categoryName) {
      verify(sessionId, categoryName);
    } else {
      setStatus('error');
    }
  }, []);

  const verify = async (sessionId: string, categoryName: string) => {
    try {
      const res = await fetch('/api/verify-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.verified) {
        savePurchase(categoryName);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-6">
        {status === 'verifying' && (
          <>
            <div className="animate-spin text-5xl">⏳</div>
            <h2 className="text-2xl font-bold">Verifying Payment...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              UNLOCKED!
            </h2>
            <p className="text-lg text-slate-300">
              The <span className="font-bold text-white">{category}</span> pack is now available in your games.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl font-bold text-xl transition-all shadow-lg"
            >
              Back to Game
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-6xl">❌</div>
            <h2 className="text-2xl font-bold text-red-500">Verification Failed</h2>
            <p className="text-slate-300">We couldn't verify your purchase. Please try again or contact support.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-2 text-slate-400 hover:text-white transition-colors"
            >
              Go Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
