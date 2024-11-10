/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable consistent-return */

import React, { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import parsePhoneNumber from 'libphonenumber-js';
import Image from 'next/image';
import { Icon } from '@iconify/react';

import { getAddress } from '@/lib/getAdress';
import { ASSISTANCE_TYPES, TOAST_ERROR_CLASSNAMES } from '@/lib/enums';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { isEmpty } from 'lodash';
import { VoiceInput } from '../custom/voice-input';
import { CodeCopyDialog } from './code/CodeCopyDialog';
import { Separator } from '../ui/separator';

const convertToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});

export function CreateDialog({
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
      const phoneNumber = parsePhoneNumber(markerState.telf, 'ES');
      if (!phoneNumber || !phoneNumber.isValid()) {
        newErrors.telf = true;
      }
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

            <Input
              placeholder="612 345 678"
              type="tel"
              pattern="[6|7|8|9]{1}[0-9]{2} [0-9]{3} [0-9]{3}"
              className={errors.telf ? 'border-red-500 ring-red-500' : ''}
              value={markerState.telf}
              onChange={(e) => {
                updateMarker({ telf: e.target.value });
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

          {direccion.calle ? (
            <div className="flex flex-col gap-1">
              <div className="text-[14px] font-medium flex gap-2 items-center">
                <div className="flex gap-1.5 bg-zinc-200 rounded-sm px-2 py-0.5 items-center w-[85px] ">
                  <p className="text-[12px] font-medium">Calle</p>
                </div>
                <Separator orientation="vertical" />
                {direccion?.calle}
              </div>
              <div className="text-[14px] font-medium flex gap-2 items-center">
                <div className="flex gap-1.5 bg-zinc-200 rounded-sm px-2 py-0.5 items-center w-[85px] ">
                  <p className="text-[12px] font-medium">Población</p>
                </div>
                <Separator orientation="vertical" />
                {direccion?.poblacion}
              </div>
            </div>
          ) : (
            <p>Cargando dirección...</p>
          )}

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
