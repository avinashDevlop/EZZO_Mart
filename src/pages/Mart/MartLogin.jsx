import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  X, 
  Loader2,
  Navigation,
} from "lucide-react";
import { getDatabase, ref, get, set, update } from "firebase/database";
import bcrypt from "bcryptjs";
import app from "../../firebase";

const db = getDatabase(app);

const MartLogin = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Background state based on form type
  const [background, setBackground] = useState({
    from: "from-amber-400",
    via: "via-orange-500",
    to: "to-yellow-500"
  });

  // Update background when form changes
  useEffect(() => {
    if (isLogin) {
      // Sign in background - warmer tones
      setBackground({
        from: "from-amber-400",
        via: "via-orange-500",
        to: "to-yellow-500"
      });
    } else {
      // Register background - slightly cooler but still warm
      setBackground({
        from: "from-amber-300",
        via: "via-orange-400",
        to: "to-yellow-400"
      });
    }
  }, [isLogin]);

  // Check for saved user data on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('customerData');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setFormData(prev => ({
        ...prev,
        email: userData.email || "",
        phone: userData.phone || "",
      }));
    }
  }, []);

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
                address: data.display_name,
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

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/; // Strict 10 digit phone number validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!isLogin) {
      if (!formData.firstName.trim()) errors.firstName = "First name is required";
      if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    }
    
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    
    if (!formData.phone) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = "Invalid phone number (10 digits required)";
    }
    
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      errors.password = "Password must be at least 8 characters with letters and numbers";
    }

    if (!isLogin) {
      if (!formData.state) errors.state = "State is required";
      if (!formData.city) errors.city = "City is required";
      if (!formData.pincode) errors.pincode = "Pincode is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Check if email exists
        const emailRef = ref(db, `CustomerEmails/${formData.email.replace(/\./g, ',')}`);
        const emailSnapshot = await get(emailRef);

        if (emailSnapshot.exists()) {
          setFormErrors({ email: "Email already registered. Please login." });
          console.warn('Registration attempt with existing email:', formData.email);
          return;
        }

        // Check if phone exists in the same state/city
        const phoneRef = ref(db, `Users/${formData.state}/${formData.city}/${formData.phone}`);
        const phoneSnapshot = await get(phoneRef);

        if (phoneSnapshot.exists()) {
          setFormErrors({ phone: "Phone number already registered in this location." });
          console.warn('Registration attempt with existing phone:', {
            phone: formData.phone,
            state: formData.state,
            city: formData.city
          });
          return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(formData.password, salt);
        console.log('Password hashed successfully');

        // Create customer data
        const customerData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: hashedPassword,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          createdAt: Date.now(),
          lastLogin: Date.now(),
          coordinates: location?.coordinates || null
        };

        // Save to database in structured path
        await set(phoneRef, customerData);
        console.log('User data saved to Firebase:', {
          path: `Users/${formData.state}/${formData.city}/${formData.phone}`,
          data: customerData
        });

        // Also save reference by email
        await set(emailRef, {
          state: formData.state,
          city: formData.city,
          phone: formData.phone
        });
        console.log('Email reference saved to Firebase');

        // Prepare data for localStorage
        const userDataToStore = {
          ...customerData,
          fullName: `${formData.firstName} ${formData.lastName}`,
          fullAddress: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
          // Remove sensitive data
          password: undefined
        };

        // Save to localStorage
        localStorage.setItem('customerData', JSON.stringify(userDataToStore));
        localStorage.setItem('customerId', `${formData.state}/${formData.city}/${formData.phone}`);
        localStorage.setItem('customerEmail', formData.email);
        localStorage.setItem('customerLocation', JSON.stringify({
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          coordinates: location?.coordinates || null
        }));

        handleLoginSuccess();
        navigate('/');
      } catch (error) {
        console.error("Registration failed:", {
          error: error.message,
          stack: error.stack,
          formData: {
            ...formData,
            password: '**REDACTED**' // Never log actual passwords
          },
          timestamp: new Date().toISOString()
        });
        setFormErrors({ general: "Registration failed. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // When login is successful
  const handleLoginSuccess = () => {
    if (onSuccess) {
        window.location.reload();
      onSuccess();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    console.log('Login attempt initiated');

    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter both email and password");
      console.warn('Login validation failed - missing fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if email exists
      const emailRef = ref(db, `CustomerEmails/${loginEmail.replace(/\./g, ',')}`);
      const emailSnapshot = await get(emailRef);

      if (!emailSnapshot.exists()) {
        setLoginError("Account not found. Please register first.");
        console.warn('Login attempt with unregistered email:', loginEmail);
        return;
      }

      // Get user location from email reference
      const { state, city, phone } = emailSnapshot.val();
      const userRef = ref(db, `Users/${state}/${city}/${phone}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        console.log('Retrieved user data from Firebase:', {
          path: `Users/${state}/${city}/${phone}`,
          userData: {
            ...userData,
            password: '**REDACTED**'
          }
        });

        const isMatch = await bcrypt.compare(loginPassword, userData.password);
        console.log('Password comparison result:', isMatch);

        if (isMatch) {
          // Update last login
          await update(userRef, { lastLogin: Date.now() });
          console.log('Last login timestamp updated');

          // Prepare data for localStorage
          const userDataToStore = {
            ...userData,
            fullName: `${userData.firstName} ${userData.lastName}`,
            fullAddress: `${userData.address}, ${userData.city}, ${userData.state} - ${userData.pincode}`,
            // Remove sensitive data
            password: undefined
          };

          // Save auth state
          localStorage.setItem('customerData', JSON.stringify(userDataToStore));
          localStorage.setItem('customerId', `${state}/${city}/${phone}`);
          localStorage.setItem('customerEmail', loginEmail);
          localStorage.setItem('customerLocation', JSON.stringify({
            address: userData.address,
            city: userData.city,
            state: userData.state,
            pincode: userData.pincode,
            coordinates: userData.coordinates || null
          }));

          handleLoginSuccess();
          navigate('/');
        } else {
          setLoginError("Invalid password. Please try again.");
          console.warn('Login failed - password mismatch for email:', loginEmail);
        }
      } else {
        setLoginError("Account not found. Please register first.");
        console.warn('User data not found in Firebase despite email reference');
      }
    } catch (error) {
      console.error("Login error:", {
        error: error.message,
        stack: error.stack,
        loginEmail,
        timestamp: new Date().toISOString()
      });
      setLoginError("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };  

  return (
    <div className={`bg-gradient-to-br ${background.from} ${background.via} ${background.to} flex items-center justify-center p-4 transition-colors duration-500`}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-center relative overflow-hidden"
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
                  className="text-4xl font-extrabold text-white drop-shadow-lg"
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
                className="text-xs text-amber-100 italic tracking-wide"
              >
                Construction materials delivered fast
              </motion.span>
            </motion.div>
          </Link>
        </motion.div>

        <div className="p-6 md:p-8">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 font-medium text-sm ${isLogin ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 font-medium text-sm ${!isLogin ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div className="flex items-center p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      <X className="w-4 h-4 mr-2 flex-shrink-0" />
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div className="text-center text-sm text-gray-600 mt-4">
                    New to EZZO Mart?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Create an account
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleRegistration} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="John"
                        required
                      />
                      {formErrors.firstName && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Doe"
                        required
                      />
                      {formErrors.lastName && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="9876543210"
                        required
                        maxLength="10"
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full pl-10 pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-700">Delivery Address</h3>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="flex items-center text-sm text-orange-600 hover:text-orange-700"
                      >
                        {locationLoading ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Detecting...
                          </>
                        ) : (
                          <>
                            <Navigation className="w-3 h-3 mr-1" />
                            Use My Location
                          </>
                        )}
                      </button>
                    </div>

                    {locationError && (
                      <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg">
                        {locationError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Street, Area, Landmark"
                          rows={2}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Your state"
                            required
                          />
                          {formErrors.state && (
                            <p className="text-xs text-red-500 mt-1">{formErrors.state}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Your city"
                            required
                          />
                          {formErrors.city && (
                            <p className="text-xs text-red-500 mt-1">{formErrors.city}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="123456"
                          required
                        />
                        {formErrors.pincode && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.pincode}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {formErrors.general && (
                    <div className="flex items-center p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      <X className="w-4 h-4 mr-2 flex-shrink-0" />
                      {formErrors.general}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                  <div className="text-center text-sm text-gray-600 mt-4">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default MartLogin;