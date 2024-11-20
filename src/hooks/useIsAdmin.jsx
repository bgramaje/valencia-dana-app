/* eslint-disable consistent-return */
import { useState, useEffect } from 'react';

const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStorageAvailable, setIsStorageAvailable] = useState(typeof sessionStorage !== 'undefined');

  useEffect(() => {
    // Check if sessionStorage is available
    const checkStorageAvailability = () => {
      setIsStorageAvailable(typeof sessionStorage !== 'undefined');
    };

    checkStorageAvailability();

    if (!isStorageAvailable) {
      // Recheck periodically if storage is unavailable
      const interval = setInterval(checkStorageAvailability, 100);
      return () => clearInterval(interval);
    }
  }, [isStorageAvailable]);

  useEffect(() => {
    if (!isStorageAvailable) return;

    // Initialize the admin state
    const adminStatus = sessionStorage.getItem('admin');
    setIsAdmin(adminStatus === 'true');

    const handleStorageChange = () => {
      const updatedAdminStatus = sessionStorage.getItem('admin');
      setIsAdmin(updatedAdminStatus === 'true');
    };

    // Listen to storage events
    window.addEventListener('storage', handleStorageChange);

    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isStorageAvailable]);

  return isAdmin;
};

export default useIsAdmin;
