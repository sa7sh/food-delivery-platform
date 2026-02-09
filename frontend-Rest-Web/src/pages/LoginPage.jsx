import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff, Moon, Sun, LogIn, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!email.trim() || !password.trim()) {
      setFormError('Please enter both email and password');
      return;
    }

    if (!email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    // Login
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setFormError(result.error);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-[#222222] dark:to-[#1a1a1a] transition-all duration-500">
      {/* Theme Toggle - Fixed Position */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-full bg-white dark:bg-dark-card shadow-soft hover:shadow-soft-lg transition-all duration-200 hover:scale-110 active:scale-95 z-50"
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-primary-600" />
        )}
      </button>

      {/* Login Container */}
      <div className="w-full max-w-md px-6 animate-fade-in">
        {/* Logo & Brand */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 shadow-glow-primary mb-4 animate-scale-in">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-text mb-2">
            Restaurant Partner
          </h1>
          <p className="text-gray-600 dark:text-dark-muted">
            Manage your restaurant with ease
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-dark-muted hover:text-gray-700 dark:hover:text-dark-text transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {(formError || error) && (
              <div className="bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/30 text-danger-600 dark:text-danger-400 px-4 py-3 rounded-lg text-sm animate-slide-down">
                {formError || error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-border">
            <p className="text-center text-xs text-gray-500 dark:text-dark-muted">
              By logging in, you agree to our{' '}
              <button className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                Terms & Conditions
              </button>{' '}
              and{' '}
              <button className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>

        {/* New Account Link */}
        <p className="text-center mt-6 text-sm text-gray-500 dark:text-dark-muted">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            Create one here
          </button>
        </p>

        {/* Help Text */}
        <p className="text-center mt-4 text-sm text-gray-500 dark:text-dark-muted">
          Need help?{' '}
          <button className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Contact Support
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;