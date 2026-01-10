import { X } from 'lucide-react';
import { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication
    onLoginSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-2xl font-bold leading-6 text-gray-900 mb-6">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-purple-600 hover:text-purple-500"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onLoginSuccess}
                  className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 111.08 97.74">
                    <defs>
                      <linearGradient id="solana-gradient" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00FFA3" />
                        <stop offset="100%" stopColor="#DC1FFF" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#solana-gradient)"
                      d="M17.71 72.17a3.57 3.57 0 0 1 2.52-1h87.73a1.78 1.78 0 0 1 1.26 3l-14.9 14.89a3.57 3.57 0 0 1-2.52 1H4.06a1.78 1.78 0 0 1-1.26-3zM17.71 1.05a3.57 3.57 0 0 1 2.52-1h87.73a1.78 1.78 0 0 1 1.26 3L94.32 17.94a3.57 3.57 0 0 1-2.52 1H4.06a1.78 1.78 0 0 1-1.26-3zM93.38 36.07a3.57 3.57 0 0 0-2.52-1H3.13a1.78 1.78 0 0 0-1.26 3l14.9 14.89a3.57 3.57 0 0 0 2.52 1h87.73a1.78 1.78 0 0 0 1.26-3z"
                    />
                  </svg>
                  Connect Solana Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
