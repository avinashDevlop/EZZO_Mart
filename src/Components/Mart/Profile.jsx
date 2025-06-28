// src/pages/Profile/Profile.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('customerId');
    if (!userId) {
      navigate('/mart-login');
      return;
    }

    const db = getDatabase();
    const userRef = ref(db, `Users/${userId}/Details`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setUserData(data);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerId');
    window.dispatchEvent(new Event('authChanged'));
    navigate('/mart-login');
  };

  if (!userData) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4 text-amber-600">My Profile</h2>
      <div className="space-y-3">
        <div>
          <strong className="text-gray-700">Name:</strong>{' '}
          <span className="text-gray-900">{userData.name || 'N/A'}</span>
        </div>
        <div>
          <strong className="text-gray-700">Email:</strong>{' '}
          <span className="text-gray-900">{userData.email || 'N/A'}</span>
        </div>
        <div>
          <strong className="text-gray-700">Phone:</strong>{' '}
          <span className="text-gray-900">{userData.phone || 'N/A'}</span>
        </div>
        <div>
          <strong className="text-gray-700">Address:</strong>{' '}
          <span className="text-gray-900">
            {userData.address || 'N/A'}
          </span>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="mt-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;
