import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';

import { isEmpty } from 'lodash';
import { GET } from '@/lib/fetcher';

const TownContext = createContext();

export function TownProvider({ children }) {
  const [towns, setTowns] = useState([]);

  const [loading, setLoading] = useState(false);

  /**
   * @name fetchPickups
   * @description function to set all pickups stored in the database
   * it stores them into the useState of `pickups`
   */
  const fetchTowns = useCallback(async () => {
    const twonsDb = await GET({ endpoint: '/api/towns' });
    if (!isEmpty(twonsDb)) setTowns(twonsDb);
    return twonsDb;
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await fetchTowns();
      setLoading(false);
    };

    fetch();
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
