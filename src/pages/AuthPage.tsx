import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';

type AuthMode = 'signup' | 'signin';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Sign Up fields
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sign In fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();

    if (!companyName || !ownerName || !signUpEmail || !signUpPassword) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (signUpPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (signUpPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    const { error } = await signUp(signUpEmail, signUpPassword, {
      company_name: companyName,
      owner_name: ownerName,
    });

    setLoading(false);

    if (error) {
      showToast(error.message, 'error');
    } else {
      // Create profile after signup
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').insert({
          id: user.id,
          company_name: companyName,
          owner_name: ownerName,
          email: signUpEmail,
        });
      }
      showToast('Account created successfully!', 'success');
      navigate('/dashboard');
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();

    if (!signInEmail || !signInPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);

    const { error } = await signIn(signInEmail, signInPassword);

    setLoading(false);

    if (error) {
      showToast(error.message, 'error');
    } else {
      navigate('/dashboard');
    }
  }

  async function handleForgotPassword() {
    if (!signInEmail) {
      showToast('Please enter your email address', 'error');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(signInEmail);
    setLoading(false);

    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Password reset email sent!', 'success');
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-md p-8">
        {/* Toggle between Sign Up and Sign In */}
        <div className="flex mb-8 border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 font-medium transition-colors ${
              mode === 'signup'
                ? 'bg-[#2563EB] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-3 font-medium transition-colors ${
              mode === 'signin'
                ? 'bg-[#2563EB] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Sign In
          </button>
        </div>

        {mode === 'signup' ? (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Full Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Free Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-[#2563EB] hover:underline"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
