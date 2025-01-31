/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable consistent-return */

import React, { useCallback, useState, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import Image from 'next/image';

const convertToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});

function MarkerCompleteForm() {
  const {
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [image, setImage] = useState(null); // Estado para la imagen seleccionada
  const [imagePreview, setImagePreview] = useState(null); // Estado para la vista previa de la imagen
  const [isCompressing, setIsCompressing] = useState(false); // Estado para la compresión

  const fileInputRef = useRef(null);

  // Manejar la subida y compresión de la imagen
  const handleImageUpload = useCallback(async (file) => {
    if (file && file.type.startsWith('image/')) {
      setIsCompressing(true);

      try {
        // Opciones de compresión
        const options = {
          maxSizeMB: 0.5, // Tamaño máximo en MB
          maxWidthOrHeight: 1024, // Resolución máxima
          useWebWorker: true, // Usar Web Worker para mejor rendimiento
        };
        const compressedFile = await imageCompression(file, options);

        // Convertir la imagen comprimida a Base64
        const base64Image = await convertToBase64(compressedFile);

        // Actualizar estados y valor del formulario
        setImage(compressedFile);
        setImagePreview(base64Image);
        setValue('image', base64Image); // Almacenar la imagen en Base64 en el formulario
      } catch (error) {
        console.error('Error comprimiendo la imagen:', error);
        toast.error('Error al comprimir la imagen. Inténtalo de nuevo.');
      } finally {
        setIsCompressing(false);
      }
    } else {
      toast.warning('Por favor, selecciona solo archivos de imagen.');
    }
  }, [setValue]);

  // Manejar el evento de arrastrar y soltar
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  // Manejar el cambio en el input de archivo
  const onImageChange = useCallback((event) => {
    if (event.target.files && event.target.files[0]) {
      handleImageUpload(event.target.files[0]);
    }
  }, [handleImageUpload]);

  // Eliminar la imagen seleccionada
  const handleRemoveImage = useCallback(() => {
    setImage(null);
    setImagePreview(null);
    setValue('image', ''); // Limpiar el valor de la imagen en el formulario
  }, [setValue]);

  return (
    <div className="flex flex-col gap-1">
      {/* Campos existentes */}
      <div className="!text-[13px] font-semibold flex gap-2 items-center px-0">
        <Alert className="border-zinc-200 bg-zinc-100 px-3 py-1">
          <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0">
            <p className="uppercase text-[11px]">Ubicación:</p>
            <span className="uppercase">
              {getValues('location') ?? '-'}
            </span>
          </AlertTitle>
        </Alert>
      </div>
      <div className="!text-[13px] font-semibold flex gap-2 items-center px-0">
        <Alert className="border-zinc-200 bg-zinc-100 px-3 py-1">
          <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0">
            <p className="uppercase text-[11px]">Dirección:</p>
            <span className="uppercase text-wrap max-w-[160px] text-right" style={{ lineHeight: 1.2 }}>
              {getValues('address') ?? '-'}
            </span>
          </AlertTitle>
        </Alert>
      </div>
      <div className="!text-[13px] font-semibold flex gap-2 items-center px-0">
        <Alert className="border-zinc-200 bg-zinc-100 px-3 py-1">
          <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0">
            <p className="uppercase text-[11px]">Teléfono:</p>
            <span className="uppercase">
              {getValues('telf') ?? '-'}
            </span>
          </AlertTitle>
        </Alert>
      </div>

      {/* Campo de descripción */}
      <div className="mt-2">
        <Textarea
          placeholder="Qué necesitas?"
          id={register('description').name}
          {...register('description')}
        />
        {errors.description && (
          <span className="text-sm text-destructive">
            {errors.description.message}
          </span>
        )}
      </div>

      {/* Sección de subida de imagen */}
      <div className="py-2">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer relative"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <div className="relative max-h-52 overflow-auto">
              <Button
                size="sm"
                className="absolute top-0 right-0 p-2 text-white rounded-full bg-black/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation(); // Evitar que el clic en el botón active el input de archivo
                  handleRemoveImage();
                }}
              >
                <Icon
                  icon="iconamoon:close"
                  style={{ color: 'white' }}
                  width="20"
                  height="20"
                />
              </Button>
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
                Arrastra o pulsa para añadir una imagen de la ayuda a realizar
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
        {isCompressing && (
          <p className="text-sm text-gray-500 mt-2">Comprimiendo imagen...</p>
        )}
      </div>
    </div>
  );
}

export default MarkerCompleteForm;
