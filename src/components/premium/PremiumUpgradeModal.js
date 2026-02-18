import React, { useState } from 'react';
import { X, Crown, Sparkles } from 'lucide-react';
import { usePremium } from '../../contexts/PremiumContext';
import { setPremium, setTrialUsed } from '../../utils/premium';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    period: 'per month',
    popular: false,
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '$79.99',
    period: 'per year',
    originalPrice: '$119.88',
    savings: 'Save 33%',
    popular: true,
  },
];

const FEATURES = [
  { icon: '🎮', text: 'Unlimited access to all 14 games' },
  { icon: '♾️', text: 'Unlimited daily plays' },
  { icon: '⭐', text: 'Advanced difficulty levels (Expert, Master)' },
  { icon: '☁️', text: 'Cloud sync - Save progress across devices' },
  { icon: '📊', text: 'Detailed analytics & progress tracking' },
  { icon: '🚫', text: 'Ad-free experience' },
  { icon: '🎨', text: 'Premium themes & personalization' },
  { icon: '🏆', text: 'Exclusive achievements & rewards' },
];

export default function PremiumUpgradeModal({ onClose }) {
  const { hasUsedTrial, refresh } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async (planId) => {
    setIsProcessing(true);
    
    // Simulate payment processing
    // In production, this would integrate with Stripe/Paddle
    setTimeout(() => {
      if (planId === 'monthly') {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);
        setPremium(expiry);
      } else {
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);
        setPremium(expiry);
      }
      
      refresh();
      setIsProcessing(false);
      onClose();
      
      alert('🎉 Welcome to Premium! Enjoy unlimited access to all features!');
    }, 1500);
  };

  const handleStartTrial = () => {
    if (hasUsedTrial) {
      alert('You have already used your free trial. Please subscribe to continue.');
      return;
    }
    
    setIsProcessing(true);
    setTimeout(() => {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7); // 7-day trial
      setPremium(expiry);
      setTrialUsed();
      refresh();
      setIsProcessing(false);
      onClose();
      alert('🎉 7-Day Free Trial Started! Enjoy Premium features!');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl border-2 border-yellow-500 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative p-6 sm:p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Unlock Premium
            </h2>
            <p className="text-gray-400 text-lg">
              Get unlimited access to all games and features
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-300">
                <span className="text-xl">{feature.icon}</span>
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                disabled={isProcessing}
                className={`relative p-6 rounded-xl border-2 transition-all ${
                  selectedPlan === plan.id
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white">
                    BEST VALUE
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 text-sm ml-2">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="mb-2">
                      <span className="text-gray-400 line-through text-sm">{plan.originalPrice}</span>
                      <span className="text-green-400 text-sm font-semibold ml-2">{plan.savings}</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleSubscribe(selectedPlan)}
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  Subscribe Now - {PLANS.find((p) => p.id === selectedPlan)?.price}
                </>
              )}
            </button>

            {!hasUsedTrial && (
              <button
                onClick={handleStartTrial}
                disabled={isProcessing}
                className="w-full py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Start 7-Day Free Trial
              </button>
            )}

            <p className="text-xs text-gray-500 text-center mt-4">
              Cancel anytime. No hidden fees. Secure payment processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
