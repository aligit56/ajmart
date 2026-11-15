import React, { useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, ShieldCheck, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email: email.trim(), password });
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);

      const redirect = searchParams.get('redirect');
      if (res.data.user.role === 'admin') {
        navigate(redirect ? `/${redirect}` : '/admin');
      } else {
        navigate(redirect ? `/${redirect}` : '/');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.success(`Filled demo credentials for ${demoEmail}`);
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 px-4">
      <div className="bg-lightCard dark:bg-darkCard rounded-3xl p-6 sm:p-8 border border-lightBorder dark:border-darkBorder shadow-xl space-y-6">
        
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div 
              className="w-8 h-10 bg-darkBlue dark:bg-cyan transition-colors"
              style={{ 
                WebkitMaskImage: 'url(/logo-alpha.png)', 
                WebkitMaskSize: 'contain', 
                WebkitMaskRepeat: 'no-repeat', 
                WebkitMaskPosition: 'center',
                maskImage: 'url(/logo-alpha.png)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center'
              }}
            ></div>
            <span className="text-2xl font-black text-lightText dark:text-darkText tracking-tight">
              AJ<span className="text-lightBlue dark:text-aqua">Traders</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-lightText dark:text-darkText">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-lightTextSecondary dark:text-darkTextSecondary">
            Sign in to track orders, save your delivery address, and access wholesale rates
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                autoFocus
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10 pr-4 text-sm"
              />
              <Mail className="absolute left-3.5 top-3 text-lightTextSecondary dark:text-darkTextSecondary" size={17} />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary">
                Password
              </label>
              <a
                href="https://wa.me/923357727555?text=Hello%20AJMart,%20I%20need%20help%20recovering%20my%20account%20password."
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-darkBlue dark:text-cyan hover:underline"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 pr-10 text-sm"
              />
              <Lock className="absolute left-3.5 top-3 text-lightTextSecondary dark:text-darkTextSecondary" size={17} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-lightTextSecondary dark:text-darkTextSecondary hover:text-darkBlue dark:hover:text-cyan transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs text-lightTextSecondary dark:text-darkTextSecondary">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-lightBorder text-darkBlue focus:ring-cyan w-4 h-4"
              />
              <span>Remember me on this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In to Account</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Login Pills */}
        <div className="pt-2 border-t border-lightBorder dark:border-darkBorder space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary block text-center">
            Quick Test Logins
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin@ajmart.pk', 'admin123')}
              className="py-2 px-3 rounded-xl border border-lightBorder dark:border-[#333] hover:border-darkBlue dark:hover:border-cyan text-lightText dark:text-darkText flex items-center justify-center gap-1.5 transition-colors font-medium bg-lightBg/50 dark:bg-[#1f1f1f]"
            >
              <ShieldCheck size={14} className="text-darkBlue dark:text-cyan" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('customer@ajmart.pk', 'customer123')}
              className="py-2 px-3 rounded-xl border border-lightBorder dark:border-[#333] hover:border-darkBlue dark:hover:border-cyan text-lightText dark:text-darkText flex items-center justify-center gap-1.5 transition-colors font-medium bg-lightBg/50 dark:bg-[#1f1f1f]"
            >
              <UserCheck size={14} className="text-green-600 dark:text-green-400" />
              <span>Customer Demo</span>
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div className="text-center pt-2">
          <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-darkBlue dark:text-cyan hover:underline">
              Create an Account &rarr;
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
