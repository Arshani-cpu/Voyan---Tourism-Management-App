import React, { useState } from 'react';
import { X, User, Check, Compass, Lock } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(email || 'traveler@voyan.com');
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full border border-stone-200 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150 text-left">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-800 flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">Welcome to Voyan</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-stone-500 mb-4">
          Save unlimited travel plans, sync across mobile devices, and collaborate with your travel partners.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Continue to Voyan</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-stone-100 text-center">
          <button
            type="button"
            onClick={() => {
              onSuccess('demo.traveler@voyan.com');
              onClose();
            }}
            className="text-xs text-teal-800 font-semibold hover:underline"
          >
            Or continue as Demo Guest
          </button>
        </div>
      </div>
    </div>
  );
};
