import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Building,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
  X,
  Info,
  Loader2,
  Locate,
} from "lucide-react";
import { getDatabase, ref, get, set, update, onValue, off } from "firebase/database";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router-dom";
import app from "../../firebase";

const db = getDatabase(app);

const VendorAuth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    businessType: "",
    businessCategory: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    street: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    mapLocation: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState(false);
  const [registeredBusinesses, setRegisteredBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [location, setLocation] = useState(null);

  // Get user's current location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError("");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            
            if (data.error) {
              setLocationError("Could not determine address from coordinates");
            } else {
              const address = data.address;
              setLocation({
                address: data.display_name,
                city: address.city || address.town || address.village,
                state: address.state,
                pincode: address.postcode,
              });
              
              // Auto-fill form with location data
              setFormData(prev => ({
                ...prev,
                street: address.road || "",
                area: address.suburb || address.neighbourhood || "",
                city: address.city || address.town || address.village || "",
                state: address.state || "",
                pincode: address.postcode || "",
              }));
            }
          } catch (error) {
            setLocationError("Failed to fetch location details");
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          setLocationLoading(false);
          setLocationError("Location access denied. Please enable location services.");
        }
      );
    } else {
      setLocationLoading(false);
      setLocationError("Geolocation is not supported by your browser");
    }
  };

  useEffect(() => {
    const vendorsRef = ref(db, 'Vendors');
    
    const unsubscribe = onValue(vendorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const businessNames = Object.keys(data);
        setRegisteredBusinesses(businessNames);
      } else {
        setRegisteredBusinesses([]);
      }
    }, (error) => {
      setFormErrors({ general: "Failed to load businesses. Please try again." });
      console.error("Error fetching registered businesses:", error);
    });

    return () => off(vendorsRef, 'value', unsubscribe);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const formSwitchVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
    exit: {
      x: 50,
      opacity: 0,
      transition: { ease: "easeInOut" },
    },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.businessName.trim()) errors.businessName = "Business name is required";
    if (!formData.businessType) errors.businessType = "Business type is required";
    if (!formData.businessCategory) errors.businessCategory = "Business category is required";
    if (!formData.contactNumber) {
      errors.contactNumber = "Contact number is required";
    } else if (!phoneRegex.test(formData.contactNumber)) {
      errors.contactNumber = "Invalid phone number";
    }
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      errors.password = "Password must be at least 8 characters with letters and numbers";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (!formData.street.trim()) errors.street = "Street is required";
    if (!formData.area.trim()) errors.area = "Area is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.pincode.trim()) errors.pincode = "Pincode is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    setFormSuccess(false);

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const vendorRef = ref(db, `Vendors/${formData.businessName}`);
        const snapshot = await get(vendorRef);

        if (snapshot.exists()) {
          setFormErrors({ businessName: "Business name already exists. Please choose a different name." });
          return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(formData.password, salt);

        const vendorData = {
          contactInfo: {
            fullName: formData.fullName,
            contactNumber: formData.contactNumber,
            email: formData.email,
          },
          auth: {
            password: hashedPassword,
            confirmPassword: hashedPassword,
          },
          businessInfo: {
            businessType: formData.businessType,
            businessCategory: formData.businessCategory,
            businessName: formData.businessName,
          },
          address: {
            street: formData.street,
            area: formData.area,
            landmark: formData.landmark,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            mapLocation: formData.mapLocation,
          },
          createdAt: Date.now(),
        };

        await set(vendorRef, vendorData);
        setFormSuccess(true);

        setTimeout(() => {
          setFormData({
            fullName: "",
            businessName: "",
            businessType: "",
            businessCategory: "",
            contactNumber: "",
            email: "",
            password: "",
            confirmPassword: "",
            street: "",
            area: "",
            landmark: "",
            city: "",
            state: "",
            pincode: "",
            mapLocation: "",
          });
          setIsLogin(true);
        }, 2000);
      } catch (error) {
        let errorMessage = "Registration failed. Please try again.";
        if (error.code === "PERMISSION_DENIED") {
          errorMessage = "You don't have permission to register. Contact support.";
        } else if (error.code === "NETWORK_ERROR") {
          errorMessage = "Network error. Please check your connection and try again.";
        }
        setFormErrors({ general: errorMessage });
        console.error("Error registering vendor:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!selectedBusiness) {
      setLoginError("Please select your business");
      return;
    }

    if (!loginPassword) {
      setLoginError("Please enter your password");
      return;
    }

    setIsSubmitting(true);

    try {
      const vendorRef = ref(db, `Vendors/${selectedBusiness}`);
      const snapshot = await get(vendorRef);

      if (snapshot.exists()) {
        const vendorData = snapshot.val();
        
        if (!vendorData.auth || !vendorData.auth.password) {
          throw new Error("Invalid vendor data structure");
        }

        const storedPassword = vendorData.auth.password;
        const vendorEmail = vendorData.contactInfo?.email || '';

        const isMatch = await bcrypt.compare(loginPassword, storedPassword);

        if (isMatch) {
          localStorage.setItem('vendorBusiness', selectedBusiness);
          localStorage.setItem('vendorEmail', vendorEmail);
          
          setIsSubmitting(false);
          setTimeout(() => {
            navigate('/vendor');
          }, 500);
        } else {
          setLoginError("Invalid password. Please try again.");
        }
      } else {
        setLoginError("Business not found. Please register first.");
      }
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";
      if (error.code === "PERMISSION_DENIED") {
        errorMessage = "You don't have permission to access this data.";
      } else if (error.code === "NETWORK_ERROR") {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message === "Invalid vendor data structure") {
        errorMessage = "Business data is corrupted. Please contact support.";
      }
      setLoginError(errorMessage);
      console.error("Error logging in:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordStep1 = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    setIsSubmitting(true);

    try {
      const vendorsRef = ref(db, 'Vendors');
      const snapshot = await get(vendorsRef);
      
      if (snapshot.exists()) {
        const vendors = snapshot.val();
        let foundBusiness = null;
        
        Object.keys(vendors).forEach(businessName => {
          if (vendors[businessName].contactInfo.email === forgotEmail) {
            foundBusiness = businessName;
          }
        });

        if (foundBusiness) {
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const resetData = {
            resetCode: code,
            resetCodeExpiry: Date.now() + (10 * 60 * 1000),
          };

          await update(ref(db, `Vendors/${foundBusiness}`), resetData);

          console.log(`Password reset code for ${forgotEmail}: ${code}`);
          setForgotSuccess("A reset code has been sent to your email.");
          setForgotPasswordStep(2);
        } else {
          setForgotError("Email not found. Please register first.");
        }
      } else {
        setForgotError("No vendors found. Please register first.");
      }
    } catch (error) {
      let errorMessage = "An error occurred. Please try again.";
      if (error.code === "PERMISSION_DENIED") {
        errorMessage = "You don't have permission to perform this action.";
      }
      setForgotError(errorMessage);
      console.error("Error in forgot password:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordStep2 = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    setIsSubmitting(true);

    try {
      const vendorsRef = ref(db, 'Vendors');
      const snapshot = await get(vendorsRef);
      
      if (snapshot.exists()) {
        const vendors = snapshot.val();
        let foundBusiness = null;
        let vendorData = null;
        
        Object.keys(vendors).forEach(businessName => {
          if (vendors[businessName].contactInfo.email === forgotEmail) {
            foundBusiness = businessName;
            vendorData = vendors[businessName];
          }
        });

        if (foundBusiness && vendorData) {
          if (vendorData.resetCode !== resetCode) {
            setForgotError("Invalid reset code. Please try again.");
            return;
          }

          if (vendorData.resetCodeExpiry < Date.now()) {
            setForgotError("Reset code has expired. Please request a new one.");
            return;
          }

          const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
          if (!passwordRegex.test(newPassword)) {
            setForgotError("Password must be at least 8 characters with letters and numbers.");
            return;
          }

          if (newPassword !== confirmNewPassword) {
            setForgotError("Passwords do not match.");
            return;
          }

          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(newPassword, salt);

          const updateData = {
            'auth/password': hashedPassword,
            'auth/confirmPassword': hashedPassword,
            resetCode: null,
            resetCodeExpiry: null,
          };

          await update(ref(db, `Vendors/${foundBusiness}`), updateData);

          setForgotSuccess("Password reset successful! You can now login with your new password.");
          setTimeout(() => {
            setShowForgotPassword(false);
            setForgotPasswordStep(1);
            setForgotEmail("");
            setResetCode("");
            setNewPassword("");
            setConfirmNewPassword("");
          }, 2000);
        } else {
          setForgotError("Business not found. Please try again.");
        }
      } else {
        setForgotError("No vendors found. Please try again.");
      }
    } catch (error) {
      let errorMessage = "An error occurred. Please try again.";
      if (error.code === "PERMISSION_DENIED") {
        errorMessage = "You don't have permission to perform this action.";
      }
      setForgotError(errorMessage);
      console.error("Error resetting password:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-yellow-500 to-amber-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-pink-500 to-orange-500 p-6 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-10"></div>
          <Link to="/" className="text-center group relative">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="inline-flex flex-col items-center justify-center leading-none cursor-pointer"
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
        </motion.div>

        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 bg-gradient-to-b from-orange-50 to-yellow-50 p-6 border-b md:border-b-0 md:border-r border-orange-200">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <motion.button
                variants={itemVariants}
                onClick={() => {
                  setIsLogin(true);
                  setShowForgotPassword(false);
                }}
                className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                  isLogin && !showForgotPassword
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-orange-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5" />
                  <span className="font-semibold">Login</span>
                </div>
              </motion.button>

              <motion.button
                variants={itemVariants}
                onClick={() => {
                  setIsLogin(false);
                  setShowForgotPassword(false);
                }}
                className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                  !isLogin && !showForgotPassword
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-orange-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5" />
                  <span className="font-semibold">Become a Vendor</span>
                </div>
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 p-4 bg-white rounded-lg border border-orange-200 shadow-sm"
            >
              <h3 className="font-bold text-orange-600 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Why Join EZZO Mart?
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <Check className="w-3 h-3 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Reach thousands of customers daily</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-3 h-3 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Easy inventory management dashboard</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-3 h-3 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Secure payments & timely settlements</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-3 h-3 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>24/7 dedicated vendor support</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center"
            >
              <div className="text-xs text-gray-500 mb-1">Need help with registration?</div>
              <button className="text-sm font-medium text-orange-600 hover:text-orange-700 underline">
                Contact Vendor Support
              </button>
            </motion.div>
          </div>

          <div className="w-full md:w-2/3 p-6 md:p-8">
            <AnimatePresence mode="wait">
              {showForgotPassword ? (
                <motion.div
                  key="forgot-password"
                  variants={formSwitchVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-gray-800 mb-6"
                  >
                    Forgot Password
                  </motion.h2>

                  {forgotPasswordStep === 1 ? (
                    <form onSubmit={handleForgotPasswordStep1}>
                      <div className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              className="w-full pl-12 p-4 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:outline-none"
                              placeholder="Enter your registered email"
                              required
                            />
                          </div>
                        </motion.div>

                        {forgotError && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center p-3 bg-red-50 text-red-600 rounded-lg border border-red-200"
                          >
                            <X className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span className="text-sm">{forgotError}</span>
                          </motion.div>
                        )}

                        {forgotSuccess && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center p-3 bg-green-50 text-green-600 rounded-lg border border-green-200"
                          >
                            <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span className="text-sm">{forgotSuccess}</span>
                          </motion.div>
                        )}

                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-yellow-600 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl relative"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                              Sending Code...
                            </>
                          ) : (
                            "Send Reset Code"
                          )}
                        </motion.button>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          className="text-center"
                        >
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(false)}
                            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                          >
                            Back to Login
                          </button>
                        </motion.div>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleForgotPasswordStep2}>
                      <div className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Reset Code
                          </label>
                          <input
                            type="text"
                            value={resetCode}
                            onChange={(e) => setResetCode(e.target.value)}
                            className="w-full p-4 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:outline-none"
                            placeholder="Enter the code sent to your email"
                            required
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full pl-12 pr-12 p-4 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:outline-none"
                              placeholder="Enter new password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              className="w-full pl-12 pr-12 p-4 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:outline-none"
                              placeholder="Confirm new password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </motion.div>

                        {forgotError && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center p-3 bg-red-50 text-red-600 rounded-lg border border-red-200"
                          >
                            <X className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span className="text-sm">{forgotError}</span>
                          </motion.div>
                        )}

                        {forgotSuccess && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center p-3 bg-green-50 text-green-600 rounded-lg border border-green-200"
                          >
                            <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span className="text-sm">{forgotSuccess}</span>
                          </motion.div>
                        )}

                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-yellow-600 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl relative"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                              Resetting Password...
                            </>
                          ) : (
                            "Reset Password"
                          )}
                        </motion.button>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          className="text-center"
                        >
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(false)}
                            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                          >
                            Back to Login
                          </button>
                        </motion.div>
                      </div>
                    </form>
                  )}
                </motion.div>
              ) : isLogin ? (
                <motion.div
                  key="login"
                  variants={formSwitchVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-gray-800 mb-6"
                  >
                    Vendor Login
                  </motion.h2>

                  <form onSubmit={handleLogin}>
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Select Your Business
                        </label>
                        <div className="relative">
                          <select
                            value={selectedBusiness}
                            onChange={(e) => setSelectedBusiness(e.target.value)}
                            className="w-full p-4 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:outline-none appearance-none bg-white"
                            required
                          >
                            {registeredBusinesses.length === 0 ? (
                              <option value="">No businesses found. Please register first.</option>
                            ) : (
                              <>
                                <option value="">Choose your registered business</option>
                                {registeredBusinesses.map((business, index) => (
                                  <option key={index} value={business}>
                                    {business}
                                  </option>
                                ))}
                              </>
                            )}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full pl-12 pr-12 p-4 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:outline-none"
                            placeholder="Enter your password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </motion.div>

                      {loginError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center p-3 bg-red-50 text-red-600 rounded-lg border border-red-200"
                        >
                          <X className="w-5 h-5 mr-2 flex-shrink-0" />
                          <span className="text-sm">{loginError}</span>
                        </motion.div>
                      )}

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-yellow-600 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                            Authenticating...
                          </>
                        ) : (
                          "Login to Dashboard"
                        )}
                      </motion.button>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center"
                      >
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                        >
                          Forgot Password?
                        </button>
                      </motion.div>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  variants={formSwitchVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-gray-800 mb-6"
                  >
                    Become a Vendor
                  </motion.h2>

                  <form onSubmit={handleRegistration}>
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-orange-50 p-6 rounded-lg border border-orange-200 shadow-sm"
                      >
                        <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center">
                          <User className="w-5 h-5 mr-2" />
                          Personal / Business Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              label: "Full Name",
                              name: "fullName",
                              placeholder: "Vendor owner's name",
                              icon: null,
                            },
                            {
                              label: "Business Name",
                              name: "businessName",
                              placeholder: "Registered company/shop name",
                              icon: null,
                            },
                            {
                              label: "Business Type",
                              name: "businessType",
                              type: "select",
                              options: [
                                { value: "", label: "Select Business Type" },
                                { value: "sole-proprietor", label: "Sole Proprietor" },
                                { value: "partnership", label: "Partnership" },
                                { value: "private-limited", label: "Private Limited" },
                                { value: "llp", label: "LLP" },
                              ],
                              icon: null,
                            },
                            {
                              label: "Business Category",
                              name: "businessCategory",
                              type: "select",
                              options: [
                                { value: "", label: "Select Category" },
                                { value: "ready-mix-concrete", label: "Ready-Mix Concrete" },
                                { value: "cement", label: "Cement" },
                                { value: "bricks", label: "Bricks" },
                                { value: "tiles", label: "Tiles" },
                                { value: "steel", label: "Steel" },
                                { value: "tools", label: "Tools" },
                                { value: "paint", label: "Paint" },
                                { value: "electrical", label: "Electrical" },
                                { value: "plumbing", label: "Plumbing" },
                                { value: "furniture", label: "Furniture" },
                                { value: "all", label: "All" },
                              ],
                              icon: null,
                            },
                            {
                              label: "Contact Number",
                              name: "contactNumber",
                              placeholder: "Primary mobile/WhatsApp",
                              icon: <Phone className="w-4 h-4 text-gray-400" />,
                            },
                            {
                              label: "Email Address",
                              name: "email",
                              placeholder: "Used for communication & login",
                              icon: <Mail className="w-4 h-4 text-gray-400" />,
                            },
                            {
                              label: "Password",
                              name: "password",
                              type: "password",
                              placeholder: "Create password",
                              icon: <Lock className="w-4 h-4 text-gray-400" />,
                              showToggle: true,
                            },
                            {
                              label: "Confirm Password",
                              name: "confirmPassword",
                              type: "password",
                              placeholder: "Confirm password",
                              icon: <Lock className="w-4 h-4 text-gray-400" />,
                              showToggle: true,
                            },
                          ].map((field, index) => (
                            <div key={index}>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">
                                {field.label}
                              </label>
                              <div className="relative">
                                {field.icon && (
                                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                    {field.icon}
                                  </div>
                                )}
                                {field.type === "select" ? (
                                  <select
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleInputChange}
                                    className={`w-full p-3 border-2 ${
                                      formErrors[field.name] ? "border-red-300" : "border-orange-200"
                                    } rounded-lg focus:border-orange-500 focus:outline-none appearance-none bg-white ${
                                      field.icon ? "pl-10" : ""
                                    }`}
                                    required
                                  >
                                    {field.options.map((option, i) => (
                                      <option key={i} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <>
                                    <input
                                      type={
                                        field.type === "password"
                                          ? field.name === "password"
                                            ? showPassword
                                              ? "text"
                                              : "password"
                                            : showConfirmPassword
                                            ? "text"
                                            : "password"
                                          : "text"
                                      }
                                      name={field.name}
                                      value={formData[field.name]}
                                      onChange={handleInputChange}
                                      className={`w-full p-3 border-2 ${
                                        formErrors[field.name] ? "border-red-300" : "border-orange-200"
                                      } rounded-lg focus:border-orange-500 focus:outline-none ${
                                        field.icon ? "pl-10" : ""
                                      } ${field.showToggle ? "pr-10" : ""}`}
                                      placeholder={field.placeholder}
                                      required={field.required}
                                    />
                                    {field.showToggle && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          field.name === "password"
                                            ? setShowPassword(!showPassword)
                                            : setShowConfirmPassword(!showConfirmPassword)
                                        }
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                      >
                                        {field.name === "password" ? (
                                          showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />
                                        ) : showConfirmPassword ? (
                                          <EyeOff className="w-4 h-4" />
                                        ) : (
                                          <Eye className="w-4 h-4" />
                                        )}
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                              {formErrors[field.name] && (
                                <motion.p
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-xs text-red-500 mt-1 flex items-center"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  {formErrors[field.name]}
                                </motion.p>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 shadow-sm"
                      >
                        <h3 className="text-xl font-bold text-yellow-600 mb-4 flex items-center">
                          <MapPin className="w-5 h-5 mr-2" />
                          Business Address
                        </h3>

                        <div className="flex justify-end mb-4">
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="flex items-center text-sm bg-white border border-orange-300 text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                          >
                            {locationLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Detecting...
                              </>
                            ) : (
                              <>
                                <Locate className="w-4 h-4 mr-2" />
                                Use Current Location
                              </>
                            )}
                          </button>
                        </div>

                        {locationError && (
                          <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-200 flex items-center">
                            <X className="w-4 h-4 mr-2" />
                            {locationError}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              label: "Street",
                              name: "street",
                              placeholder: "Street name",
                              type: "text",
                              fullWidth: true,
                            },
                            {
                              label: "Area",
                              name: "area",
                              placeholder: "Area name",
                              type: "text",
                              fullWidth: true,
                            },
                            {
                              label: "Landmark (Optional)",
                              name: "landmark",
                              placeholder: "Nearby landmark",
                              type: "text",
                              fullWidth: true,
                              required: false,
                            },
                            {
                              label: "City",
                              name: "city",
                              placeholder: "City",
                              type: "text",
                            },
                            {
                              label: "State",
                              name: "state",
                              placeholder: "State",
                              type: "text",
                            },
                            {
                              label: "Pincode",
                              name: "pincode",
                              placeholder: "Pincode",
                              type: "text",
                            },
                            {
                              label: "Google Map Location (Optional)",
                              name: "mapLocation",
                              placeholder: "Pinpoint address URL",
                              type: "text",
                              fullWidth: true,
                              required: false,
                            },
                          ].map((field, index) => (
                            <div key={index} className={field.fullWidth ? "md:col-span-2" : ""}>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">
                                {field.label}
                              </label>
                              <div className="relative">
                                <input
                                  type={field.type}
                                  name={field.name}
                                  value={formData[field.name]}
                                  onChange={handleInputChange}
                                  className={`w-full p-3 border-2 ${
                                    formErrors[field.name] ? "border-red-300" : "border-yellow-200"
                                  } rounded-lg focus:border-yellow-500 focus:outline-none`}
                                  placeholder={field.placeholder}
                                  required={field.required !== false}
                                />
                                {formErrors[field.name] && (
                                  <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs text-red-500 mt-1 flex items-center"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    {formErrors[field.name]}
                                  </motion.p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {formSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center p-3 bg-green-50 text-green-600 rounded-lg border border-green-200"
                        >
                          <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                          <span className="text-sm">Registration successful! You can now login.</span>
                        </motion.div>
                      )}

                      {formErrors.general && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center p-3 bg-red-50 text-red-600 rounded-lg border border-red-200"
                        >
                          <X className="w-5 h-5 mr-2 flex-shrink-0" />
                          <span className="text-sm">{formErrors.general}</span>
                        </motion.div>
                      )}

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-yellow-600 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl relative"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                            Processing Registration...
                          </>
                        ) : (
                          "Register as Vendor"
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorAuth;