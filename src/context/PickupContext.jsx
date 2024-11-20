import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';

import { toast } from 'sonner';

import { fetcher } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { TOAST_ERROR_CLASSNAMES } from '@/lib/enums';
import { CodeCrudDialog } from '@/components/dialogs/code/CodeCrudDialog';
import { CreatePickupDialog } from '@/components/dialogs/CreatePickupDialog';
import { InfoPickerDialog } from '@/components/dialogs/InfoPickerDialog';

const PickupContext = createContext();

const INITIAL_VALUE = {
  name: '',
  longitude: 0,
  latitude: 0,
};

export function PickupProvider({
  location, selectedPickup, setSelectedPickup, children,
}) {
  const [newPickup, setNewPickup] = useState(INITIAL_VALUE);
  // state for data coming from DDBB
  const [pickups, setPickups] = useState([]);
  const [needs, setNeeds] = useState([]);

  // loading state variable
  const [loading, setLoading] = useState(false);
  // booleans for controlling dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [showInfoPickupDialog, setShowInfoPickupDialog] = useState(false);

  /**
   * @name fetchPickups
   * @description function to set all pickups stored in the database
   * it stores them into the useState of `pickups`
   */
  const fetchPickups = useCallback(() => {
    fetcher('/api/pickups', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }, null).then((data) => {
      setPickups(data);
    });
  }, []);

  const fetchPickup = useCallback((id, cb) => {
    fetcher(`/api/pickups/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }, null).then((data) => {
      if (cb) cb(data);
    });
  }, []);

  const fetchNeeds = useCallback(() => {
    fetcher('/api/pickups/needs', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }, null).then((data) => {
      setNeeds(data);
    });
  }, []);

  /**
   * @name postPickup
   * @param body
   * @description function to post to the api a new pickup point.
   * After successfully doing it, it closes pickup dialog modal.
   */
  const postPickup = useCallback((body) => {
    fetcher('/api/pickups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, 'Punto de recogida creado correctamente').then((data) => {
      setPickups((prevMarkers) => [...prevMarkers, data]);
      setShowCreateDialog(false);
    });
  }, []);

  /**
   * @name postPickup
   * @param body
   * @description function to post to the api a new pickup point.
   * After successfully doing it, it closes pickup dialog modal.
   */
  const updatePickup = useCallback((id, body, cb) => {
    fetcher(`/api/pickups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...body }),
    }, 'Punto de recogida actualizado correctamente').then((data) => {
      if (cb) cb(data);
    });
  }, []);

  /**
   * @name codeCallback
   * @description check if given input matches with the master code.
   * If so, then it closes the modal and shows the pick creation modal
   */
  const codePickupCallback = (inputCode) => {
    if (inputCode === process.env.NEXT_PUBLIC_MASTER_KEY_PICKUPS) {
      setShowCodeDialog(false);
      setShowCreateDialog(true);
    } else {
      toast.error('Código incorrecto', {
        duration: 2000,
        classNames: TOAST_ERROR_CLASSNAMES,
      });
    }
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await Promise.all([
        fetchPickups(),
        fetchNeeds(),
      ]);
      setLoading(false);
    };

    fetch();
  }, [fetchPickups, fetchNeeds]);

  useEffect(() => {
    setNewPickup((prev) => ({ ...prev, ...location }));
  }, [location]);

  useEffect(() => {
    if (showCreateDialog) return;
    setSelectedPickup(null);
    setNewPickup(INITIAL_VALUE);
  }, [showCreateDialog, setSelectedPickup]);

  const value = useMemo(() => ({
    pickups,
    needs,
    loading,
    fetchPickups,
    setShowCodeDialog,
    setShowInfoPickupDialog,
    setShowCreateDialog,
    postPickup,
    updatePickup,
    fetchPickup,
  }), [
    pickups,
    needs,
    loading,
    fetchPickups,
    setShowCodeDialog,
    setShowInfoPickupDialog,
    setShowCreateDialog,
    postPickup,
    updatePickup,
    fetchPickup,
  ]);

  return (
    <PickupContext.Provider value={value}>
      {children}
      <CreatePickupDialog
        newPickup={newPickup}
        open={showCreateDialog}
        close={setShowCreateDialog}
        handleAddPickup={postPickup}
        setNewPickup={setNewPickup}
        needs={needs}
      />

      {selectedPickup && (
        <InfoPickerDialog
          selectedPickup={selectedPickup}
          open={showInfoPickupDialog}
          close={setShowInfoPickupDialog}
          needsDB={needs}
          fetchPickup={fetchPickup}
          updatePickup={updatePickup}
        />
      )}

      <CodeCrudDialog
        open={showCodeDialog}
        close={setShowCodeDialog}
        callback={codePickupCallback}
        title="Código creación"
        description="Porfavor inserte la clave que da accesso a gestionar los puntos de recogida"
      >
        <Button className="w-full mt-2 bg-green-500 uppercase text-[12px] font-semibold">
          <Icon
            icon="line-md:circle-twotone-to-confirm-circle-twotone-transition"
            width="20"
            height="20"
          />
          Enviar
        </Button>
      </CodeCrudDialog>
    </PickupContext.Provider>
  );
}

// Create a custom hook for easy access to the context
export const usePickups = () => useContext(PickupContext);
