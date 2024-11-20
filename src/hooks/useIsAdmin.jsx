import { useState, useEffect } from 'react';

const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(() => {
    const adminStatus = sessionStorage.getItem('admin');
    return adminStatus === 'true';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const adminStatus = sessionStorage.getItem('admin');
      setIsAdmin(adminStatus === 'true');
    };

    // Escucha cambios en sessionStorage
    window.addEventListener('storage', handleStorageChange);

    // Limpia el evento al desmontar
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return isAdmin;
};

export default useIsAdmin;
