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
  const [pickupMasterKey, setPickupMasterKey] = useState(null);
  const [pickups, setPickups] = useState([]);
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

  /**
   * @name fetchKey
   * @description function to retrive code for creating pickups
   */
  const fetchKey = useCallback(() => {
    fetcher('/api/pickups/code', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }, null).then((data) => {
      setPickupMasterKey((data)?.key);
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
   * @name codeCallback
   * @description check if given input matches with the master code.
   * If so, then it closes the modal and shows the pick creation modal
   */
  const codePickupCallback = useCallback((inputCode) => {
    if (inputCode === pickupMasterKey) {
      setShowCodeDialog(false);
      setShowCreateDialog(true);
    } else {
      toast.error('Código incorrecto', {
        duration: 2000,
        classNames: TOAST_ERROR_CLASSNAMES,
      });
    }
  }, [pickupMasterKey]);

  useEffect(() => {
    setLoading(true);
    fetchPickups();
    fetchKey();
    setLoading(false);
  }, [fetchPickups, fetchKey]);

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
    pickupMasterKey,
    loading,
    fetchPickups,
    setShowCodeDialog,
    setShowInfoPickupDialog,
    postPickup,
  }), [
    pickups,
    pickupMasterKey,
    loading,
    fetchPickups,
    setShowCodeDialog,
    setShowInfoPickupDialog,
    postPickup,
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
      />

      {selectedPickup && (
        <InfoPickerDialog
          selectedPickup={selectedPickup}
          open={showInfoPickupDialog}
          close={setShowInfoPickupDialog}
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
