import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';

import { fetcher } from '@/lib/utils';
import { MARKER_STATUS } from '@/lib/enums';
import { CreateMarkerDialog } from '@/components/dialogs/marker/CreateMarkerDialog';
import { DetailMarkerDialog } from '@/components/dialogs/marker/DetailMarkerDialog';

import { useTowns } from './TownContext';

const MarkerContext = createContext();

const INITIAL_VALUE = {
  type: 'WATER',
  description: '',
  longitude: 0,
  latitude: 0,
};

export function MarkerProvider({
  location, selectedMarker, setSelectedMarker, children,
}) {
  const [newMarker, setNewMarker] = useState(INITIAL_VALUE);
  // state for data coming from DDBB
  const [markers, setMarkers] = useState([]);
  const [markersType, setMarkersType] = useState([]);

  // loading state variable
  const [loading, setLoading] = useState(false);
  // booleans for controlling dialogs
  const [showMarkerDialog, setShowMarkerDialog] = useState(false);

  const { fetchTowns } = useTowns();

  /**
   * @name fetchMarkers
   * @description function to set all markers stored in the database
   * it stores them into the useState of `markers`
   */
  const fetchMarkers = useCallback(() => {
    fetcher('/api/markers', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }, null).then((data) => {
      setMarkers(data);
    });
  }, []);

  /**
   * @name fetchMarkersType
   * @description function to set all markers stored in the database
   * it stores them into the useState of `markers`
   */
  const fetchMarkersType = useCallback(() => {
    fetcher('/api/markers/type', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }, null).then((data) => {
      setMarkersType(data);
    });
  }, []);

  /**
   * @name postMarker
   * @param body
   * @description function to post to the api a new marker point.
   * After successfully doing it, it closes marker dialog modal.
   */
  const postMarker = useCallback((body) => {
    fetcher('/api/markers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, 'Marcador creado correctamente').then((data) => {
      setMarkers((prevMarkers) => [...prevMarkers, data]);
      setShowMarkerDialog(false);
      fetchTowns();
    });
  }, [fetchTowns]);

  /**
   * @name assignMarker
   * @param body
   * @description function to assign marker to a given volunteer
   */
  const assignMarker = useCallback((body, cb = undefined) => {
    fetcher(`/api/markers/assign/${selectedMarker.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedMarker.id, ...body }),
    }, 'Marcador asignado correctamente')
      .then((data) => {
        setSelectedMarker(data);
        fetchMarkers();
        if (cb) cb();
      });
  }, [selectedMarker, fetchMarkers, setSelectedMarker]);

  /**
   * @name completeMarker
   * @param body
   * @description function to change a marker as completed
   */
  const completeMarker = useCallback((id, code) => {
    fetcher(`/api/markers/complete/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        status: MARKER_STATUS.COMPLETADO,
      }),
    }, 'Marcador completado correctamente')
      .then(() => {
        fetchMarkers();
      });
  }, [fetchMarkers]);

  /**
   * @name deleteMarker
   * @param body
   * @description function to delete a marker
   */
  const deleteMarker = useCallback((id, code) => {
    fetcher(`/api/markers/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }, 'Marcador borrado correctamente')
      .then(async () => {
        setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker !== selectedMarker));
        setShowMarkerDialog(false);
        if (selectedMarker) setSelectedMarker(null);
        await Promise.all([
          fetchTowns(),
          fetchMarkers(),
        ]);
      });
  }, [selectedMarker, setSelectedMarker, fetchTowns, fetchMarkers]);

  useEffect(() => {
    setLoading(true);
    fetchMarkers();
    fetchMarkersType();
    setLoading(false);
  }, [fetchMarkers, fetchMarkersType]);

  useEffect(() => {
    setNewMarker((prev) => ({ ...prev, ...location }));
  }, [location]);

  useEffect(() => {
    if (showMarkerDialog) return;
    setSelectedMarker(null);
    setNewMarker(INITIAL_VALUE);
  }, [showMarkerDialog, setSelectedMarker]);

  const value = useMemo(() => ({
    markers,
    markersType,
    loading,
    completeMarker,
    deleteMarker,
    fetchMarkers,
    postMarker,
    setShowMarkerDialog,
  }), [
    markers,
    markersType,
    loading,
    completeMarker,
    deleteMarker,
    fetchMarkers,
    postMarker,
    setShowMarkerDialog,
  ]);

  return (
    <MarkerContext.Provider value={value}>
      {children}
      {!selectedMarker && (
        <CreateMarkerDialog
          open={showMarkerDialog}
          close={setShowMarkerDialog}
          newMarker={newMarker}
          markersType={markersType}
          handleAddMarker={postMarker}
          setNewMarker={setNewMarker}
        />
      )}

      {selectedMarker && (
        <DetailMarkerDialog
          open={showMarkerDialog}
          close={setShowMarkerDialog}
          selectedMarker={selectedMarker}
          deleteMarker={deleteMarker}
          assignMarker={assignMarker}
          completeMarker={completeMarker}
        />
      )}
    </MarkerContext.Provider>
  );
}

export const useMarkers = () => useContext(MarkerContext);
