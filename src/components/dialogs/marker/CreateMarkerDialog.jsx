/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable consistent-return */

import React, { useCallback, useEffect, useRef } from 'react';

import { toast } from 'sonner';
import { isEmpty } from 'lodash';
import { Upload } from 'lucide-react';
import parsePhoneNumber from 'libphonenumber-js';
import { isPossiblePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';

import Image from 'next/image';
import { Icon } from '@iconify/react';
import { getAddress } from '@/lib/getAdress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TOAST_ERROR_CLASSNAMES } from '@/lib/enums';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { PhoneInput } from '@/components/custom/phone-input';
import { VoiceInput } from '@/components/custom/voice-input';
import { CodeCopyDialog } from '../code/CodeCopyDialog';

const convertToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});

export function CreateMarkerDialog({
  open,
  close,
  newMarker,
  markersType,
  handleAddMarker,
  setNewMarker,
}) {
  // Initialize marker state with default values
  const [markerState, setMarkerState] = React.useState({
    type: '',
    telf: '',
    description: '',
    data_usage: false,
    policy_accepted: false,
    ...newMarker, // Spread the incoming props to override defaults if they exist
  });

  const [showCodeDialog, setShowCodeDialog] = React.useState(false);
  const [code, setCode] = React.useState(null);
  const [direccion, setDireccion] = React.useState({
    calle: null,
    poblacion: null,
    direccionCompleta: null,
  });

  const [image, setImage] = React.useState(null);
  const [imagePreview, setImagePreview] = React.useState(null);
  const [errors, setErrors] = React.useState({
    type: false,
    telf: false,
    description: false,
    data_usage: false,
    policy_accepted: false,
  });

  const fileInputRef = useRef(null);

  // Update local state when props change
  useEffect(() => {
    setMarkerState((prev) => ({
      ...prev,
      ...newMarker,
    }));
  }, [newMarker]);

  useEffect(() => {
    const fetchAddress = async () => {
      const addressData = await getAddress(markerState.latitude, markerState.longitude);
      setDireccion(addressData);
    };

    if (markerState.latitude && markerState.longitude) {
      fetchAddress();
    }
  }, [markerState.latitude, markerState.longitude]);

  useEffect(() => {
    if (image) {
      const imageURL = URL.createObjectURL(image);
      setImagePreview(imageURL);

      return () => {
        URL.revokeObjectURL(imageURL);
      };
    }
  }, [image]);

  useEffect(() => {
    setErrors({
      type: false,
      telf: false,
      description: false,
      data_usage: false,
      policy_accepted: false,
    });
  }, [open]);

  const updateMarker = (updates) => {
    const newState = { ...markerState, ...updates };
    setMarkerState(newState);
    setNewMarker(newState); // Update parent state
  };

  const handleClose = async () => {
    const newErrors = {
      type: false,
      telf: false,
      description: false,
      data_usage: false,
      policy_accepted: false,
    };

    if (!markerState.data_usage) newErrors.data_usage = true;
    if (!markerState.policy_accepted) newErrors.policy_accepted = true;

    if (isEmpty(markerState.type)) newErrors.type = true;
    if (isEmpty(markerState.description)) newErrors.description = true;

    if (isEmpty(markerState.telf)) newErrors.telf = true;
    else {
      const phoneNumber = isValidPhoneNumber(markerState.telf) && isPossiblePhoneNumber(markerState.telf);
      if (!phoneNumber) newErrors.telf = true;
    }

    setErrors(newErrors);

    if (newErrors.data_usage || newErrors.policy_accepted) {
      toast.error('Por favor, acepte las políticas de privacidad y la conformidad de uso de datos', {
        duration: 2000,
        classNames: TOAST_ERROR_CLASSNAMES,
      });
      return;
    }

    if (newErrors.type || newErrors.description) {
      toast.error('Por favor, complete todos los campos correctamente', {
        duration: 2000,
        classNames: TOAST_ERROR_CLASSNAMES,
      });
      return;
    }

    if (newErrors.telf) {
      toast.error('Por favor, compruebe el número de teléfono', {
        duration: 2000,
        classNames: TOAST_ERROR_CLASSNAMES,
      });
      return;
    }

    const c = (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000).toString();
    setCode(c);
    setShowCodeDialog(true);
    close(false);

    let base64Image = null;
    if (image) base64Image = await convertToBase64(image);

    const phoneNumber = parsePhoneNumber(markerState.telf, 'ES');
    handleAddMarker({
      ...markerState,
      password: c,
      img: base64Image,
      telf: phoneNumber.number,
      location: direccion?.poblacion?.toUpperCase() ?? 'unknown',
    });
  };

  const onImageChange = useCallback((event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type.startsWith('image/')) {
        setImage(file);
      } else {
        toast.warning('Por favor, selecciona solo archivos de imagen.');
      }
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
    } else {
      toast.warning('Por favor, arrastra solo archivos de imagen.');
    }
  }, []);

  return (
    <>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl overflow-y-auto max-h-[90%] gap-2">
          <DialogHeader>
            <DialogTitle className="uppercase font-bold text-[14px] text-center">
              Pedir ayuda
            </DialogTitle>
            <DialogDescription className="text-center font-medium text-[12px]">
              Solicita ayuda debido al temporal DANA
            </DialogDescription>
          </DialogHeader>

          {direccion?.calle && (
            <div className="flex flex-col gap-1">
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
              <div className="!text-[13px] font-semibold flex gap-2 items-center px-0">
                <Alert className="border-zinc-200 bg-zinc-100 px-3 py-1">
                  <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0 gap-2">
                    <p className="uppercase text-[11px]">Calle:</p>
                    <span className="uppercase text-left leading-tight">
                      {direccion?.calle ?? '-'}
                    </span>
                  </AlertTitle>
                </Alert>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Select
              value={markerState.type}
              onValueChange={(value) => {
                updateMarker({ type: value });
                setErrors({ ...errors, type: false });
              }}
            >
              <SelectTrigger className={`w-full ${errors.type ? 'border-red-500 ring-red-500' : ''}`}>
                <SelectValue placeholder="Tipo de asistencia" />
              </SelectTrigger>
              <SelectContent>
                {markersType?.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    <span className="flex items-center">
                      <Icon
                        icon={t.icon}
                        width="20"
                        height="20"
                        className="mr-2"
                      />
                      {t.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <PhoneInput
              className={errors.telf ? 'border-red-500 ring-red-500' : ''}
              value={markerState.telf}
              defaultCountry="ES"
              onChange={(e) => {
                updateMarker({ telf: e });
                setErrors({ ...errors, telf: false });
              }}
            />

            <VoiceInput
              placeholder="Qué necesitas?"
              className={errors.description ? 'border-red-500 ring-red-500' : ''}
              value={markerState.description}
              onChange={(e) => {
                updateMarker({ description: e.target.value });
                setErrors({ ...errors, description: false });
              }}
            />

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative max-h-52 overflow-auto">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-33 mx-auto rounded-xl"
                    width={100}
                    height={50}
                    style={{ width: 'auto', height: 'auto' }}
                    priority
                  />
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-1 text-sm">
                    Arrasta o pulse para añadir una imagen de la ayuda a realizar
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <div className="flex flex-col w-full gap-2">
              <div className="flex items-center">
                <Checkbox
                  id="privacy-policy"
                  className={`mr-2 ${errors.policy_accepted ? 'border-red-500 ring-red-500' : ''}`}
                  checked={markerState.policy_accepted}
                  onCheckedChange={(checked) => {
                    updateMarker({ policy_accepted: checked });
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

              <div className="flex items-center">
                <Checkbox
                  id="data-usage-agreement"
                  className={`mr-2 ${errors.data_usage ? 'border-red-500 ring-red-500' : ''}`}
                  checked={markerState.data_usage}
                  onCheckedChange={(checked) => {
                    updateMarker({ data_usage: checked });
                    setErrors({ ...errors, data_usage: false });
                  }}
                />
                <label
                  htmlFor="data-usage-agreement"
                  className={`${errors.data_usage ? 'text-red-500 ring-red-500 animate-pulse' : ''} text-[13px]`}
                >
                  Acepto que se usen mis datos para ayudarme en la emergencia.
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

      <CodeCopyDialog open={showCodeDialog} close={setShowCodeDialog} code={code} />
    </>
  );
}
