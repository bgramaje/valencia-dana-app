import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';

import { fetcher } from '@/lib/utils';

const TownContext = createContext();

export function TownProvider({ children }) {
  const [towns, setTowns] = useState([]);

  // loading state variable
  const [loading, setLoading] = useState(false);
  /**
   * @name fetchPickups
   * @description function to set all pickups stored in the database
   * it stores them into the useState of `pickups`
   */
  const fetchTowns = useCallback(() => {
    fetcher('/api/towns', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }, null).then((data) => {
      setTowns(data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTowns();
    setLoading(false);
  }, [fetchTowns]);

  const value = useMemo(() => ({
    towns,
    loading,
    fetchTowns,
  }), [
    towns,
    loading,
    fetchTowns,
  ]);

  return (
    <TownContext.Provider value={value}>
      {children}
    </TownContext.Provider>
  );
}

// Create a custom hook for easy access to the context
export const useTowns = () => useContext(TownContext);
