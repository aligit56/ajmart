import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, UserPlus, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        password: formData.password
      });

      // Auto-login upon registration
      if (res.data?.token && res.data?.user) {
        login(res.data.user, res.data.token);
        toast.success(`Account created! Welcome, ${res.data.user.name}`);
        navigate('/');
      } else {
        toast.success('Registration successful! Please sign in.');
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-6 sm:my-10 px-4">
      <div className="bg-lightCard dark:bg-darkCard rounded-3xl p-6 sm:p-8 border border-lightBorder dark:border-darkBorder shadow-xl space-y-6">
        
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center group mb-2" aria-label="AJMart Home">
            <img 
              src="/images/brand/ajmart-logo-primary.webp" 
              alt="AJMart" 
              className="h-11 w-auto object-contain dark:hidden block mx-auto" 
              onError={(e) => { e.currentTarget.src = '/images/brand/ajmart-logo-primary.png'; }}
            />
            <img 
              src="/images/brand/ajmart-logo-dark.webp" 
              alt="AJMart" 
              className="h-11 w-auto object-contain hidden dark:block mx-auto" 
              onError={(e) => { e.currentTarget.src = '/images/brand/ajmart-logo-dark.png'; }}
            />
          </Link>
          <h1 className="text-2xl font-black text-lightText dark:text-darkText">
            Create Customer Account
          </h1>
          <p className="text-xs sm:text-sm text-lightTextSecondary dark:text-darkTextSecondary">
            Save delivery addresses, view order history, and access wholesale deals
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Muhammad Ali"
                value={formData.name}
                onChange={handleChange}
                className="input-field pl-10 pr-4 text-sm"
              />
              <User className="absolute left-3.5 top-3 text-lightTextSecondary dark:text-darkTextSecondary" size={17} />
            </div>
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10 pr-4 text-sm"
                />
                <Mail className="absolute left-3.5 top-3 text-lightTextSecondary dark:text-darkTextSecondary" size={17} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="0300-1234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field pl-10 pr-4 text-sm"
                />
                <Phone className="absolute left-3.5 top-3 text-lightTextSecondary dark:text-darkTextSecondary" size={17} />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
              Primary Delivery Address
            </label>
            <div className="relative">
              <input
                type="text"
                name="address"
                placeholder="House #, Street, Area / Sector, Rawalpindi / Islamabad"
                value={formData.address}
                onChange={handleChange}
                className="input-field pl-10 pr-4 text-sm"
              />
              <MapPin className="absolute left-3.5 top-3 text-lightTextSecondary dark:text-darkTextSecondary" size={17} />
            </div>
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-10 pr-4 text-sm"
                />
                <Lock className="absolute left-3.5 top-3 text-lightTextSecondary dark:text-darkTextSecondary" size={17} />
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <p className="text-[11px] text-lightTextSecondary dark:text-darkTextSecondary leading-relaxed pt-1">
            By creating an account, you agree to AJMart{' '}
            <Link to="/terms" className="text-darkBlue dark:text-cyan underline">Terms</Link> and{' '}
            <Link to="/privacy" className="text-darkBlue dark:text-cyan underline">Privacy Policy</Link>.
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center pt-2 border-t border-lightBorder dark:border-darkBorder">
          <p className="text-xs text-lightTextSecondary dark:text-darkTextSecondary">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-darkBlue dark:text-cyan hover:underline">
              Sign In Here &rarr;
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
