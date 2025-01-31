import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';

import { isEmpty } from 'lodash';

import {
  DELETE, GET, POST, PUT,
} from '@/lib/fetcher';
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

  const [markers, setMarkers] = useState([]);
  const [markersType, setMarkersType] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showMarkerDialog, setShowMarkerDialog] = useState(false);

  const { fetchTowns } = useTowns();

  /**
   * @name fetchMarkers
   * @description retreive markers from db and assign it to state
   */
  const fetchMarkers = useCallback(async () => {
    const markersDb = await GET({ endpoint: '/api/markers' });
    if (!isEmpty(markersDb)) setMarkers(markersDb);
  }, []);

  /**
   * @name fetchMarkersType
   * @description retreive markerTypes from db and assign it to state
   */
  const fetchMarkersType = useCallback(async () => {
    const typesDb = await GET({ endpoint: '/api/markers/type' });
    if (!isEmpty(typesDb)) setMarkersType(typesDb);
  }, []);

  /**
   * @name postMarker
   * @param body the marker to be adding into the db
   * @description adds the marker into the ddbb, if succeeded closes modal
   */
  const postMarker = useCallback(async (body) => {
    const msg = {
      error: 'Error al crear el marcador',
      success: 'Marcador creado correctamente',
    };

    const newMarkerDb = await POST(
      { endpoint: '/api/markers', body },
      { msg },
    );

    if (!isEmpty(newMarkerDb)) {
      setMarkers((prevMarkers) => [...prevMarkers, newMarkerDb]);
      setShowMarkerDialog(false);
      fetchTowns();
      setNewMarker(INITIAL_VALUE);
    }
  }, [fetchTowns]);

  /**
   * @name assignMarker
   * @param body
   * @description function to assign marker to a given volunteer
   */
  const assignMarker = useCallback(async (body, cb = undefined) => {
    const data = { id: selectedMarker.id, ...body };
    const msg = {
      error: 'Error al asignar el marcador',
      success: 'Marcador asignado correctamente',
    };

    const updatedMarkerDb = await PUT(
      { endpoint: `/api/markers/assign/${selectedMarker.id}`, body: data },
      { msg },
    );

    if (updatedMarkerDb) {
      setSelectedMarker(updatedMarkerDb);
      fetchMarkers();
      if (cb) cb();
    }
  }, [selectedMarker, fetchMarkers, setSelectedMarker]);

  /**
   * @name completeMarker
   * @param body
   * @description function to change a marker as completed
   */
  const completeMarker = useCallback(async (id, code) => {
    const data = {
      code,
      status: MARKER_STATUS.COMPLETADO,
    };

    const msg = {
      error: 'Error al completar el marcador',
      success: 'Marcador completado correctamente',
    };

    const updatedMarkerDb = await PUT(
      { endpoint: `/api/markers/complete/${id}`, body: data },
      { msg },
    );

    if (updatedMarkerDb) await fetchMarkers();
  }, [fetchMarkers]);

  /**
   * @name deleteMarker
   * @param body
   * @description function to delete a marker
   */
  const deleteMarker = useCallback(async (id, code) => {
    const data = {
      code,
      status: MARKER_STATUS.COMPLETADO,
    };

    const msg = {
      error: 'Error al borrar el marcador',
      success: 'Marcador borrado correctamente',
    };

    const deletedMarkerDb = await DELETE(
      { endpoint: `/api/markers/${id}`, body: data },
      { msg },
    );

    if (deletedMarkerDb) {
      setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== selectedMarker.id));
      setShowMarkerDialog(false);
      if (selectedMarker) setSelectedMarker(null);
      await Promise.all([
        fetchTowns(),
        fetchMarkers(),
      ]);
    }
  }, [selectedMarker, setSelectedMarker, fetchTowns, fetchMarkers]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([
        fetchMarkers(),
        fetchMarkersType(),
      ]);
      setLoading(false);
    })();
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
          currentLocation={location}
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
