/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable consistent-return */

import React, { useCallback, useEffect, useState } from 'react';

import { toast } from 'sonner';
import { isEmpty } from 'lodash';

import { Icon } from '@iconify/react';
import { getAddress } from '@/lib/getAdress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TOAST_ERROR_CLASSNAMES } from '@/lib/enums';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Alert, AlertTitle } from '../ui/alert';
import { VoiceInput } from '../custom/voice-input';
import { CodeCopyDialog } from './code/CodeCopyDialog';
import { PhoneInput } from '../custom/phone-input';

export function CreatePickupDialog({
  open,
  close,
  newPickup,
  setNewPickup,
  handleAddPickup,
  needs,
}) {
  const [addressFetched, setAddressFetched] = useState(false);
  // Initialize marker state with default values
  const [pickupState, setPickupState] = React.useState({
    verified: 'false',
    status: 'DESCONOCIDO',
    description: '',
    policy_accepted: false,
    address: '',
    responsable_nombre: '',
    responsable_telf: '',
    ...newPickup, // Spread the incoming props to override defaults if they exist
  });

  const [showCodeDialog, setShowCodeDialog] = React.useState(false);
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
      address: isEmpty(newPickup.address) || newPickup.address === ' '
        ? null
        : newPickup.address,
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

    const needsPosts = selectedNeeds.map((need) => ({ key: need, value: 0 }));
    // generate array filled of 0 for capacity base value

    let statusDB;

    if (selectedNeeds.length === needs.length) statusDB = 'ABIERTO';
    else if (selectedNeeds.length === 0) statusDB = 'CERRADO';
    else if (selectedNeeds.length !== needs.length) statusDB = 'PARCIALMENTE';
    else statusDB = 'DESCONOCIDO';

    handleAddPickup({
      ...pickupState,
      needs: needsPosts,
      location: direccion?.poblacion?.toUpperCase() ?? 'unknown',
      status: statusDB,
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
    if (open) return;
    setSelectedNeeds([]);
    setAddressFetched(false);

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
            <Input
              placeholder="Nombre del responsable"
              type="text"
              className={errors.responsable_nombre ? 'border-red-500 ring-red-500' : ''}
              value={pickupState.responsable_nombre}
              onChange={(e) => {
                if (e.target.value !== pickupState.address) {
                  updatePickup({ responsable_nombre: e.target.value });
                  setErrors({ ...errors, responsable_nombre: false });
                }
              }}
            />
            <PhoneInput
              className={errors.responsable_telf ? 'border-red-500 ring-red-500' : ''}
              value={pickupState.responsable_telf}
              placeholder="Teléfono del responsable"
              defaultCountry="ES"
              onChange={(e) => {
                updatePickup({ responsable_telf: e });
                setErrors({ ...errors, responsable_telf: false });
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
              type="text"
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
          <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="airplane-mode" className="text-[13px] uppercase">Necesidades</Label>
              <p className="text-[11px] font-light text-justify">
                Porfavor, selecciona lo que este recogiendose ahora mismo en el punto de recogida.
              </p>
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
                    className={`flex items-center mb-0 basis-[100px] gap-1.5 flex-1 
                      ${selectedNeeds.includes(key) ? 'bg-blue-500 border-blue-800 border-1' : 'bg-zinc-100'
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
            </div>
          </div>
          <div className="flex items-center justify-between w-full py-2 pt-1 gap-8">
            <div className="flex flex-col gap-1">
              <Label htmlFor="airplane-mode" className="text-[13.5px]">Punto de recogida verificado?</Label>
              <p className="text-[11px] font-light text-justify">
                Has verificado personalmente los datos introducidos?
              </p>
            </div>
            <Switch
              value={pickupState?.verified ?? false}
              onCheckedChange={(checked) => {
                updatePickup({ verified: checked });
                setErrors({ ...errors, verified: false });
              }}
            />
          </div>
          <DialogFooter className="mt-0">
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
