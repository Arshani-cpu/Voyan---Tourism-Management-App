import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  User,
  Lock,
  Compass,
  Check,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Mail,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { TravellerGroupType } from '../../types/travel';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  type FirebaseUser,
} from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { apiUrl } from '../../lib/api';

export interface AuthUser {
  uid?: string;
  name: string;
  email: string;
  groupPreference?: TravellerGroupType;
  joinedDate?: string;
  photoURL?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  initialMode?: 'signin' | 'register' | 'forgot_password';
}

const STORAGE_KEY_SESSION = 'voyan_current_session';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'register' | 'forgot_password'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [groupPreference, setGroupPreference] = useState<TravellerGroupType>('seniors');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectResultHandled = useRef(false);

  const handleResetForm = () => {
    setErrorMessage(null);
    setSuccessNotice(null);
    setResetSent(false);
  };

  const syncUserProfileToFirestore = async (uid: string, userEmail: string, displayName?: string) => {
    try {
      await setDoc(doc(db, 'users', uid), {
        id: uid,
        email: userEmail,
        displayName: displayName || userEmail.split('@')[0],
        createdAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      // Log or handle according to firestore error pattern
      console.warn('Could not sync user profile to Firestore:', err);
    }
  };

  const completeGoogleSignIn = async (fbUser: FirebaseUser) => {
    const userObj: AuthUser = {
      uid: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Voyan Traveler',
      email: fbUser.email || '',
      groupPreference,
      joinedDate: 'October 2026',
      photoURL: fbUser.photoURL || undefined,
    };

    await completeSignIn(fbUser, userObj);
  };

  const completeSignIn = async (fbUser: FirebaseUser, userObj: AuthUser) => {
    let verificationEmailSent = false;
    let verificationError: string | null = null;

    if (!fbUser.emailVerified && fbUser.email) {
      try {
        const token = await fbUser.getIdToken();
        const response = await fetch(apiUrl('/api/auth/send-verification-email'), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json() as { sent?: boolean; error?: string };
        if (!response.ok) {
          throw new Error(result.error || 'Could not send the verification email.');
        }
        verificationEmailSent = result.sent === true;
      } catch (error) {
        console.error('Firebase verification email error:', error);
        verificationError = error instanceof Error ? error.message : 'Could not send the verification email.';
      }
    }

    void syncUserProfileToFirestore(fbUser.uid, userObj.email, userObj.name);
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(userObj));
    onSuccess(userObj);

    if (verificationEmailSent) {
      setErrorMessage(null);
      setSuccessNotice('Signed in. A verification link was sent to your email; close this window to continue.');
    } else if (verificationError) {
      setSuccessNotice(null);
      setErrorMessage(`Signed in, but the verification email could not be sent: ${verificationError}`);
    } else {
      onClose();
    }
  };

  const getGoogleSignInErrorMessage = (error: unknown) => {
    const code = (error as { code?: string } | null)?.code;
    if (code === 'auth/api-key-not-valid' || code === 'auth/invalid-api-key') {
      return 'Firebase rejected the API key. Set VITE_FIREBASE_API_KEY to the Web API key from the same Firebase project.';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'This site is not authorized for Firebase sign-in. Add its domain in Firebase Authentication settings.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Google sign-in is disabled. Enable the Google provider in Firebase Authentication settings.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Sign-in was cancelled. Please try again.';
    }
    if (code === 'auth/web-storage-unsupported') {
      return 'This browser is blocking sign-in storage. Open Voyan in Safari or Chrome and try again.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Firebase sign-in could not reach the network. Check your connection and try again.';
    }
    return error instanceof Error ? error.message : 'Unable to authenticate with Google. Please try again.';
  };

  useEffect(() => {
    if (redirectResultHandled.current) return;
    redirectResultHandled.current = true;

    void getRedirectResult(auth)
      .then((result) => {
        if (result) return completeGoogleSignIn(result.user);
      })
      .catch((error: unknown) => {
        console.error('Google redirect sign-in error:', error);
        setErrorMessage(getGoogleSignInErrorMessage(error));
      });
  }, []);

  if (!isOpen) return null;

  // Prefer the user-initiated popup on mobile, then fall back to a full-page redirect.
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await completeGoogleSignIn(res.user);
    } catch (error: unknown) {
      console.error('Google sign in error:', error);
      const code = (error as { code?: string } | null)?.code;
      const isMobileBrowser = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/web-storage-unsupported' ||
        code === 'auth/operation-not-supported-in-this-environment' ||
        (isMobileBrowser && code === 'auth/cancelled-popup-request')
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectError: unknown) {
          console.error('Google redirect sign-in start error:', redirectError);
          setErrorMessage(getGoogleSignInErrorMessage(redirectError));
        }
      } else {
        setErrorMessage(getGoogleSignInErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email & Password Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = cred.user;
      const userObj: AuthUser = {
        uid: fbUser.uid,
        name: fbUser.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        groupPreference,
        joinedDate: 'October 2026',
      };

      await completeSignIn(fbUser, userObj);
    } catch (err: any) {
      console.error('Firebase sign in error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setErrorMessage('Invalid email or password. Please check credentials or sign up.');
      } else if (err.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password. Please try again or use "Forgot Password".');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMessage('Please enter a valid email address.');
      } else {
        setErrorMessage(getGoogleSignInErrorMessage(err) || 'Sign in failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Register with Email & Password
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = cred.user;
      const displayName = name.trim() || cleanEmail.split('@')[0];

      const userObj: AuthUser = {
        uid: fbUser.uid,
        name: displayName,
        email: cleanEmail,
        groupPreference,
        joinedDate: 'October 2026',
      };

      await completeSignIn(fbUser, userObj);
    } catch (err: any) {
      console.error('Firebase registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please use at least 6 characters with a number or symbol.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMessage('Please enter a valid email address.');
      } else {
        setErrorMessage(getGoogleSignInErrorMessage(err) || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Request Password Reset
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setResetSent(true);
      setSuccessNotice(`Password reset instructions sent to ${email.trim()}. Please check your inbox.`);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setErrorMessage('No Voyan account found with this email address.');
      } else {
        setErrorMessage(getGoogleSignInErrorMessage(err) || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo Fast-fill
  const fillDemoAccount = (demoEmail: string, demoName: string, demoGroup: TravellerGroupType) => {
    setEmail(demoEmail);
    setPassword('voyan2026!');
    setName(demoName);
    setGroupPreference(demoGroup);
    setErrorMessage(null);
  };

  return (
    <div className="auth-modal-backdrop fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="auth-modal-panel bg-white rounded-2xl max-w-sm w-full border border-stone-200 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150 text-left">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-800 flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] leading-tight">
                {mode === 'signin' && 'Sign In to Voyan'}
                {mode === 'register' && 'Create Free Account'}
                {mode === 'forgot_password' && 'Reset Your Password'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {mode === 'signin' && 'Firebase synced saved trips and customized itineraries'}
                {mode === 'register' && 'Tailored itineraries for every group type'}
                {mode === 'forgot_password' && 'Secure account recovery via Firebase'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Google 1-Click Authentication Button */}
        {mode !== 'forgot_password' && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-2.5 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSubmitting ? 'Opening Google...' : 'Continue with Google'}</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-stone-200 w-full" />
              <span className="bg-white px-2 text-[10px] uppercase font-bold text-stone-400 absolute">
                or email
              </span>
            </div>
          </div>
        )}

        {/* Tab Switcher: Sign In vs Register (Hidden if in forgot_password mode) */}
        {mode !== 'forgot_password' ? (
          <div className="flex items-center p-1 bg-stone-100 rounded-xl mb-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                handleResetForm();
              }}
              className={`flex-1 py-1.5 rounded-lg transition-colors text-center cursor-pointer ${
                mode === 'signin' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                handleResetForm();
              }}
              className={`flex-1 py-1.5 rounded-lg transition-colors text-center cursor-pointer ${
                mode === 'register' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Register
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                handleResetForm();
              }}
              className="text-xs text-teal-800 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Success notice banner */}
        {successNotice && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-tight">{successNotice}</span>
          </div>
        )}

        {/* ================= MODE: SIGN IN ================= */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="traveler@voyan.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-stone-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot_password');
                    handleResetForm();
                  }}
                  className="text-[11px] text-teal-800 hover:underline font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span>Signing in with Firebase...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================= MODE: REGISTER ================= */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create secure password"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Primary Traveller Style
              </label>
              <select
                value={groupPreference}
                onChange={(e) => setGroupPreference(e.target.value as TravellerGroupType)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none capitalize"
              >
                <option value="seniors">Senior Citizens (Paved, gentle pace)</option>
                <option value="family">Family with Children (Spacious, kid-friendly)</option>
                <option value="couple">Couple (Romantic, scenic)</option>
                <option value="friends">Friends Group (Adventure, shared cost)</option>
                <option value="solo">Solo Explorer (Independent, safety)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span>Creating Firebase Account...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Complete Registration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================= MODE: FORGOT PASSWORD ================= */}
        {mode === 'forgot_password' && (
          <div className="space-y-4">
            <form onSubmit={handleRequestPasswordReset} className="space-y-3.5">
              <p className="text-xs text-stone-600">
                Enter your registered email address and Firebase will email you a secure link to reset your password.
              </p>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || resetSent}
                className="w-full py-2.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending Link...' : resetSent ? 'Reset Link Sent' : 'Send Firebase Reset Email'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Demo Fast-fill options for easy evaluation */}
        <div className="mt-5 pt-3.5 border-t border-stone-100">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2 text-center">
            Demo Profiles
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('traveler@voyan.com', 'Priya Sharma', 'couple')}
              className="px-2.5 py-1.5 text-[11px] font-medium bg-stone-50 hover:bg-teal-50 hover:text-teal-900 rounded-lg border border-stone-200 text-stone-700 text-left transition-colors cursor-pointer truncate"
            >
              👩 Priya (Couple)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('arshanid070110@gmail.com', 'Arshan', 'seniors')}
              className="px-2.5 py-1.5 text-[11px] font-medium bg-stone-50 hover:bg-teal-50 hover:text-teal-900 rounded-lg border border-stone-200 text-stone-700 text-left transition-colors cursor-pointer truncate"
            >
              🧓 Arshan (Seniors)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
