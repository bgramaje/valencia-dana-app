/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable consistent-return */

import React, {
  useCallback, useEffect, useState,
} from 'react';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';

import { getAddress } from '@/lib/getAdress';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { isEmpty } from 'lodash';
import { TOAST_ERROR_CLASSNAMES } from '@/lib/enums';
import { VoiceInput } from '../custom/voice-input';
import { CodeCopyDialog } from './code/CodeCopyDialog';
import { Alert, AlertTitle } from '../ui/alert';
import {
  Select, SelectContent, SelectItem, SelectValue, SelectTrigger,
} from '../ui/select';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

export function CreatePickupDialog({
  open,
  close,
  newPickup,
  setNewPickup,
  handleAddPickup,
}) {
  const [addressFetched, setAddressFetched] = useState(false);
  // Initialize marker state with default values
  const [pickupState, setPickupState] = React.useState({
    verified: 'false',
    status: 'DESCONOCIDO',
    description: '',
    policy_accepted: false,
    ...newPickup, // Spread the incoming props to override defaults if they exist
  });

  const [showCodeDialog, setShowCodeDialog] = React.useState(false);
  const [needs, setNeeds] = React.useState([]);
  const [selectedNeeds, setSelectedNeeds] = React.useState([]);

  const [direccion, setDireccion] = React.useState({
    calle: null,
    poblacion: null,
    direccionCompleta: null,
  });

  const [errors, setErrors] = React.useState({
    type: false,
    description: false,
    policy_accepted: false,
  });

  // Update local state when props change
  useEffect(() => {
    setPickupState((prev) => ({
      ...prev,
      ...newPickup,
    }));
  }, [newPickup]);

  const updatePickup = useCallback((updates) => {
    const newState = { ...pickupState, ...updates };
    setPickupState(newState);
    setNewPickup(newState); // Update parent state
  }, [pickupState, setPickupState, setNewPickup]);

  const handleClose = async () => {
    const newErrors = {
      address: false,
      needs: false,
      name: false,
      policy_accepted: false,
      status: false,
      verified: false,
    };

    if (!pickupState.policy_accepted) newErrors.policy_accepted = true;
    if (isEmpty(pickupState.address)) newErrors.address = true;
    if (isEmpty(pickupState.name)) newErrors.name = true;
    if (isEmpty(pickupState.needs)) newErrors.needs = true;

    setErrors(newErrors);

    if (newErrors.type || newErrors.description) {
      toast.error('Por favor, complete todos los campos correctamente', {
        duration: 2000,
        classNames: TOAST_ERROR_CLASSNAMES,
      });
    }

    const needsPosts = selectedNeeds.join(',');

    handleAddPickup({
      ...pickupState,
      needs: needsPosts,
      location: direccion?.poblacion?.toUpperCase() ?? 'unknown',
    });
  };

  const selectNeed = (need) => {
    setSelectedNeeds((prev) => {
      if (prev.includes(need)) {
        return prev.filter((item) => item !== need); // Remove if it exists
      }
      return [...prev, need]; // Add if it doesn't exist
    });
  };

  const fetchNeeds = () => {
    fetch('/api/pickups/needs')
      .then((response) => response.json())
      .then((data) => setNeeds(data))
      .catch((error) => toast.error(`Error loading markers: ${error}`));
  };

  useEffect(() => {
    fetchNeeds();
  }, []);

  useEffect(() => {
    const fetchAddress = async () => {
      const addressData = await getAddress(newPickup.latitude, newPickup.longitude);
      setAddressFetched(true);
      setDireccion(addressData);
      updatePickup({ address: addressData.calle });
    };

    if (newPickup.latitude && newPickup.longitude && !addressFetched) {
      fetchAddress();
    }
  }, [newPickup.latitude, newPickup.longitude, updatePickup, addressFetched]);

  useEffect(() => {
    setSelectedNeeds([]);
    setErrors({
      type: false,
      telf: false,
      description: false,
      policy_accepted: false,
    });
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl overflow-y-auto max-h-[90%] gap-2">
          <DialogHeader>
            <DialogTitle className="uppercase font-bold text-[14px] text-center flex gap-2 items-center justify-center">
              <Icon icon="ph:package" width={20} />
              AÑADIR PUNTO DE RECOGIDA
            </DialogTitle>
            <DialogDescription className="text-center font-medium text-[12px]">
              Añade un punto de recogida para ayudar a las personas afectadas por la DANA
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <VoiceInput
              placeholder="Nombre del punto"
              className={errors.name ? 'border-red-500 ring-red-500' : ''}
              value={pickupState.name}
              onChange={(e) => {
                updatePickup({ name: e.target.value });
                setErrors({ ...errors, name: false });
              }}
            />
            {direccion?.calle && (
              <div className="!text-[13px] font-semibold flex gap-2 items-center px-0">
                <Alert className="border-zinc-200 bg-zinc-100 px-3 py-1">
                  <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0">
                    <p className="uppercase text-[11px]">Ubicación:</p>
                    <span className="uppercase">
                      {direccion?.poblacion ?? '-'}
                    </span>
                  </AlertTitle>
                </Alert>
              </div>
            )}
            <Input
              placeholder="Dirección Postal"
              type="tel"
              className={errors.address ? 'border-red-500 ring-red-500' : ''}
              value={pickupState.address}
              onChange={(e) => {
                if (e.target.value !== pickupState.address) {
                  updatePickup({ address: e.target.value });
                  setErrors({ ...errors, address: false });
                }
              }}
            />
          </div>
          <div
            className="flex flex-wrap w-full gap-1.5"
          >
            {needs.map((need) => {
              const { label, icon, key } = need;
              return (
                <div
                  onClick={() => (selectNeed(key))}
                  key={label}
                  className={`flex items-center mb-0 basis-[100px] gap-1.5 flex-1 ${
                    selectedNeeds.includes(key) ? 'bg-blue-400 border-blue-600 border-1' : 'bg-zinc-100'
                  } rounded-xl border border-zinc-200 p-1.5`}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                  >
                    <Icon
                      icon={icon}
                      width="20"
                      height="20"
                      style={{ color: '#202020' }}
                    />
                  </div>
                  <span
                    className="font-semibold text-[13px] uppercase leading-tight"
                  >
                    {label}
                  </span>
                </div>
              );
            })}
            <div className="py-2 w-full flex flex-col gap-2">
              <Label htmlFor="airplane-mode">Estado del punto</Label>
              <Select
                value={pickupState.status}
                onValueChange={(value) => {
                  updatePickup({ status: value });
                  setErrors({ ...errors, status: false });
                }}
              >
                <SelectTrigger className={`w-full ${errors.status ? 'border-red-500 ring-red-500' : ''}`}>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {['DESCONOCIDO', 'CERRADO', 'PARCIALMENTE', 'ABIERTO']?.map((t) => (
                    <SelectItem key={t} value={t}>
                      <span className="flex items-center">
                        {t}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between w-full py-1">
              <Label htmlFor="airplane-mode">Punto de recogida verificado?</Label>
              <Switch
                value={pickupState?.verified ?? false}
                onCheckedChange={(checked) => {
                  updatePickup({ verified: checked });
                  setErrors({ ...errors, verified: false });
                }}
              />
            </div>
          </div>
          <DialogFooter className="mt-2">
            <div className="flex flex-col w-full gap-2">
              <div className="flex items-center pb-2">
                <Checkbox
                  id="privacy-policy"
                  className={`mr-2 ${errors.policy_accepted ? 'border-red-500 ring-red-500' : ''}`}
                  checked={pickupState.policy_accepted}
                  onCheckedChange={(checked) => {
                    updatePickup({ policy_accepted: checked });
                    setErrors({ ...errors, policy_accepted: false });
                  }}
                />
                <label
                  htmlFor="privacy-policy"
                  className={`${errors.policy_accepted ? 'text-red-500 ring-red-500 animate-pulse' : ''} text-[13px]`}
                >
                  Acepto las
                  {' '}
                  <a href="/privacy-policy" className="text-blue-500 underline">
                    políticas de privacidad
                  </a>
                </label>
              </div>
              <Button
                className="w-full uppercase text-[12px] font-semibold"
                onClick={handleClose}
              >
                <Icon
                  icon="line-md:circle-twotone-to-confirm-circle-twotone-transition"
                  width="20"
                  height="20"
                />
                Añadir Marcador
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CodeCopyDialog open={showCodeDialog} close={setShowCodeDialog} />
    </>
  );
}
