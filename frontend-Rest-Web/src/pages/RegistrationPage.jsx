import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff, Moon, Sun, UserPlus, Sparkles, ArrowLeft } from 'lucide-react';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    restaurantName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    // Validation
    if (!formData.restaurantName.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() || !formData.confirmPassword.trim()) {
      setFormError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Call Signup API
    const result = await signup(
      formData.restaurantName,
      formData.email,
      formData.password
    );

    if (result.success) {
      setLoading(false);
      setSuccess(true);
    } else {
      setLoading(false);
      setFormError(result.error || 'Registration failed');
    }
  };

  const navigateToLogin = () => {
    navigate('/login');
  };

  if (success) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-[#222222] dark:to-[#1a1a1a] transition-all duration-500">
          <div className="max-w-md w-full mx-6">
            <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl shadow-2xl p-8 text-center border border-gray-100 dark:border-gray-800">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Account Created Successfully!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Welcome to Restaurant Partner, {formData.restaurantName}!
              </p>
              <button
                onClick={navigateToLogin}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.6s ease-out;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-[#222222] dark:to-[#1a1a1a] transition-all duration-500 py-12">
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

        {/* Back to Login Button - Fixed Position */}
        <button
          onClick={navigateToLogin}
          className="fixed top-6 left-6 p-3 rounded-full bg-white dark:bg-dark-card shadow-soft hover:shadow-soft-lg transition-all duration-200 hover:scale-110 active:scale-95 z-50 flex items-center gap-2 px-4"
          aria-label="Back to login"
        >
          <ArrowLeft className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-dark-text">Login</span>
        </button>

        {/* Registration Container */}
        <div className="w-full max-w-2xl px-6 animate-fade-in">
          {/* Logo & Brand */}
          <div className="text-center mb-8 animate-slide-down">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 shadow-glow-primary mb-4 animate-scale-in">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-text mb-2">
              Join as Partner
            </h1>
            <p className="text-gray-600 dark:text-dark-muted">
              Create your restaurant account to get started
            </p>
          </div>

          {/* Registration Card */}
          <div className="card p-8 animate-slide-up">
            <div className="space-y-5">
              {/* Restaurant Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  placeholder="Enter restaurant name"
                  className="input"
                  disabled={loading}
                />
              </div>


              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password (min 8 characters)"
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

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="input pr-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-dark-muted hover:text-gray-700 dark:hover:text-dark-text transition-colors"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {formError && (
                <div className="bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/30 text-danger-600 dark:text-danger-400 px-4 py-3 rounded-lg text-sm animate-slide-down">
                  {formError}
                </div>
              )}

              {/* Register Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-border">
              <p className="text-center text-xs text-gray-500 dark:text-dark-muted">
                By creating an account, you agree to our{' '}
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

          {/* Already have account */}
          <p className="text-center mt-6 text-sm text-gray-500 dark:text-dark-muted">
            Already have an account?{' '}
            <button
              onClick={navigateToLogin}
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;