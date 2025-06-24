import React, { useState } from "react";
import { Eye, EyeOff, User, Lock, Mail } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

export default function AdminLoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // In your AdminLogin component's handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);
  try {
    await signInWithEmailAndPassword(auth, formData.email, formData.password);
    toast.success('Login successful!');
    navigate('/admin'); // This will now be protected
  } catch (error) {
    toast.error('Login failed. Check your credentials.');
    console.error('Login error:', error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-400 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex">
        {/* Left Side - Info */}
        <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-8 w-1/2 hidden md:block">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-orange-600 mb-2">
              <User className="inline-block mr-2" size={28} />
              Admin Login
            </h2>
          </div>
          <div className="space-y-6">
            <div className="bg-white/70 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                Why Admin Access?
              </h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span>Complete platform management and oversight</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span>Advanced analytics and reporting dashboard</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span>User and vendor management tools</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span>24/7 system monitoring and support</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">
                Need technical support?
              </p>
              <button className="text-orange-600 hover:text-orange-700 font-medium text-sm underline">
                Contact System Administrator
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 w-full md:w-1/2">
          <div className="text-center mb-8">
            <Link to="/" className="text-center group relative">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="inline-flex flex-col items-center justify-center leading-none cursor-pointer bg-gradient-to-r from-orange-800 to-orange-600 rounded-lg px-4 py-3"
              >
                <div className="flex items-center space-x-2">
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg"
                  >
                    EZZO
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white font-bold text-lg self-end"
                  >
                    Mart
                  </motion.span>
                </div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs sm:text-sm text-amber-100 italic tracking-wide"
                >
                  into sustainability
                </motion.span>
              </motion.div>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Admin Login
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your admin email"
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.email ? "border-red-500" : "border-orange-200"
                  } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 bg-orange-50/30`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 border ${
                    errors.password ? "border-red-500" : "border-orange-200"
                  } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 bg-orange-50/30`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              ) : (
                "Login to Admin Dashboard"
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                onClick={() => console.log("Forgot password clicked")}
              >
                Forgot Password?
              </button>
            </div>
          </form>

          {/* Mobile Benefits */}
          <div className="md:hidden mt-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-3">
              Admin Features:
            </h3>
            <div className="text-sm text-gray-700 space-y-1">
              <div>✓ Platform Management</div>
              <div>✓ Advanced Analytics</div>
              <div>✓ User Management</div>
              <div>✓ System Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
