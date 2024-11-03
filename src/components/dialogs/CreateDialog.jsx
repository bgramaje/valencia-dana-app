import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';

import { toast } from 'sonner';
import { isEmpty } from 'lodash';
import { Upload, X } from 'lucide-react';
import parsePhoneNumber from 'libphonenumber-js';

import Image from 'next/image';
import { Icon } from '@iconify/react';
import { getAddress } from '@/lib/getAdress';
import { Input } from '@/components/ui/input';
import { ASSISTANCE_TYPES } from '@/lib/enums';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import { VoiceInput } from '../custom/voice-input';
import { CodeCopyDialog } from './code/CodeCopyDialog';

const convertToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});

export function CreateDialog({
  open, close, newMarker, handleAddMarker, setNewMarker,
}) {
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [code, setCode] = useState(null);
  const [direccion, setDireccion] = useState({
    calle: null,
    poblacion: null,
    direccionCompleta: null,
  });

  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchAddress = async () => {
      const addressData = await getAddress(newMarker.latitude, newMarker.longitude);
      setDireccion(addressData);
    };

    fetchAddress();
  }, [newMarker]);

  const handleClose = async () => {
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

  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type.startsWith('image/')) {
        setImage(file);
      } else {
        toast.warning('Por favor, selecciona solo archivos de imagen.');
      }
    }
  };

  const removeImage = () => setImage(null);

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
        <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-left">Añadir nuevo marcador</DialogTitle>
          </DialogHeader>
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
              aria-hidden="true"
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {image ? (
                <div className="relative max-h-52 overflow-auto">
                  <Image
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="max-h-33 mx-auto rounded-xl"
                    layout="responsive" // Para que ajuste su tamaño al contenedor
                    width={100}
                    height={50} // Ajusta el aspect ratio
                    style={{ width: '100%', height: 'auto' }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-1 text-sm">Arrastra y suelta una imagen aquí, o haz clic para seleccionar</p>
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
            <div>
              <p>
                <strong>Calle:</strong>
                {direccion.calle}
              </p>
              <p>
                <strong>Población:</strong>
                {direccion.poblacion}
              </p>
            </div>
          ) : (
            <p>Cargando dirección...</p>
          )}
          <DialogFooter>
            <Button className="w-full mt-0 uppercase text-[12px] font-semibold" onClick={handleClose}>
              <Icon
                icon="line-md:circle-twotone-to-confirm-circle-twotone-transition"
                width="20"
                height="20"
              />
              Añadir Marcador
            </Button>
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
