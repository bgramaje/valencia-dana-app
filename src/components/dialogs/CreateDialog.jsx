/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable consistent-return */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { toast } from 'sonner';
import { isEmpty } from 'lodash';
import { Upload } from 'lucide-react';
import parsePhoneNumber from 'libphonenumber-js';

import Image from 'next/image';
import { Icon } from '@iconify/react';
import { getAddress } from '@/lib/getAdress';
import { Input } from '@/components/ui/input';
import { ASSISTANCE_TYPES, TOAST_ERROR_CLASSNAMES } from '@/lib/enums';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

import { VoiceInput } from '../custom/voice-input';
import { CodeCopyDialog } from './code/CodeCopyDialog';
import { Badge } from '../ui/badge';

const convertToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});

export function CreateDialog({
  open, close, newMarker, handleAddMarker, setNewMarker,
}) {
  const [acceptedDataUsage, setAcceptedDataUsage] = useState(false);
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [code, setCode] = useState(null);
  const [direccion, setDireccion] = useState({
    calle: null,
    poblacion: null,
    direccionCompleta: null,
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Estado para la URL de la imagen
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchAddress = async () => {
      const addressData = await getAddress(newMarker.latitude, newMarker.longitude);
      setDireccion(addressData);
    };

    fetchAddress();
  }, [newMarker.latitude, newMarker.longitude]);

  useEffect(() => {
    if (image) {
      const imageURL = URL.createObjectURL(image);
      setImagePreview(imageURL);

      return () => {
        URL.revokeObjectURL(imageURL); // Limpia la URL cuando cambie o se elimine la imagen
      };
    }
  }, [image]);

  const handleClose = async () => {
    if (!acceptedPrivacyPolicy) {
      toast.error('Debes aceptar las políticas de privacidad para continuar.', {
        duration: 2000,
        classNames: {
          toast: 'bg-red-800',
          title: 'text-red-400 text-md',
          description: 'text-red-400',
          icon: 'text-red-400',
          closeButton: 'bg-lime-400',
        },
      });
      return;
    }

    if (!acceptedDataUsage) {
      toast.error('Debes aceptar el uso de tus datos para ayudar en la emergencia.', {
        duration: 2000,
        classNames: TOAST_ERROR_CLASSNAMES,
      });
      return;
    }

    if (isEmpty(newMarker?.description) || isEmpty(newMarker?.telf)) {
      toast.error('Añade que necesitas en la ayuda y tu número de telefono', {
        duration: 2000,
        classNames: {
          toast: 'bg-red-800',
          title: 'text-red-400 text-md',
          description: 'text-red-400',
          icon: 'text-red-400',
          closeButton: 'bg-lime-400',
        },
      });
      return;
    }

    const phoneNumber = parsePhoneNumber(newMarker?.telf, 'ES');
    if (!phoneNumber || !phoneNumber?.isValid()) {
      toast.error('El teléfono no es válido. Compruébalo', {
        duration: 2000,
        classNames: {
          toast: 'bg-red-800',
          title: 'text-red-400 text-md',
          description: 'text-red-400',
          icon: 'text-red-400',
          closeButton: 'bg-lime-400',
        },
      });
      return;
    }

    const c = (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000).toString();
    setCode(c);
    setShowCodeDialog(true);
    close(false);

    let base64Image = null;
    if (image) base64Image = await convertToBase64(image);

    handleAddMarker({ password: c, img: base64Image, telf: phoneNumber.number });
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

  // const removeImage = useCallback(() => setImage(null), []);

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
      <Dialog open={open} onOpenChange={close} className="gap-2">
        <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl overflow-y-auto max-h-[90%] gap-2">
          <DialogHeader>
            <DialogTitle className="uppercase font-bold text-[14px] text-center">Pedir ayuda</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center font-medium text-[12px] p-0 m-0">
            Solicita ayuda debido al temporal DANA
          </DialogDescription>
          <div className="flex flex-col gap-2">
            <Select
              value={newMarker.type}
              onValueChange={(value) => setNewMarker({ ...newMarker, type: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tipo de asistencia" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ASSISTANCE_TYPES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center">
                      <Icon icon={value.icon} width="20" height="20" className="mr-2" />
                      {value.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="612 345 678"
              required
              type="tel"
              pattern="[6|7|8|9]{1}[0-9]{2} [0-9]{3} [0-9]{3}"
              className="mt-0"
              value={newMarker.telf}
              onChange={(e) => setNewMarker({ ...newMarker, telf: e.target.value })}
            />
            <VoiceInput
              className="mt-0"
              placeholder="Qué necesitas?"
              value={newMarker.description}
              setter={setNewMarker}
              onChange={(e) => setNewMarker({ ...newMarker, description: e.target.value })}
            />
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
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
                  <p className="mt-1 text-sm">Arrasta o pulse para añadir una imagen de la ayuda a realizar</p>
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
              <div className="text-[14px] font-semibold flex gap-2 items-center">
                <Badge className="w-[80px] bg-zinc-700">Calle</Badge>
                {direccion.calle}
              </div>
              <div className="text-[14px] font-semibold flex gap-2 items-center">
                <Badge className="w-[80px] bg-zinc-700">Población</Badge>
                {direccion.poblacion}
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
                  checked={acceptedPrivacyPolicy}
                  onCheckedChange={(checked) => setAcceptedPrivacyPolicy(checked)}
                  className="mr-2"
                />
                <label htmlFor="privacy-policy" className="text-sm">
                  Acepto las
                  {' '}
                  <a href="/privacy-policy" className="text-blue-500 underline">políticas de privacidad</a>
                </label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  id="data-usage-agreement"
                  checked={acceptedDataUsage}
                  onCheckedChange={(checked) => setAcceptedDataUsage(checked)}
                  className="mr-2"
                />
                <label htmlFor="data-usage-agreement" className="text-sm">
                  Acepto que se puedan usar mis datos para ayudarme en la emergencia.
                </label>
              </div>
              <Button
                className="w-full mt-0 uppercase text-[12px] font-semibold"
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
      <CodeCopyDialog
        open={showCodeDialog}
        close={setShowCodeDialog}
        code={code}
      />
    </>
  );
}
