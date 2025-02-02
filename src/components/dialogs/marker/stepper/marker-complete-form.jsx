/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable consistent-return */

import React, { useCallback, useRef, useState } from 'react';

import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import imageCompression from 'browser-image-compression';

import Image from 'next/image';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertTitle } from '@/components/ui/alert';

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
        setImagePreview(base64Image);
        setValue('img', base64Image); // Almacenar la imagen en Base64 en el formulario
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
    setImagePreview(null);
    setValue('img', ''); // Limpiar el valor de la imagen en el formulario
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
      <div className="mt-0.5 flex flex-col gap-1">
        <div className="flex flex-col gap-0">
          <p className="uppercase text-[11px] m-0 p-0 font-medium">
            DESCRIPCIÓN
          </p>
          <p className=" text-[11px] m-0 p-0 font-regular">
            Introduzca una breve descripción de lo que necesita
          </p>
        </div>

        <Textarea
          placeholder="Qué necesitas?"
          id={register('description').name}
          {...register('description')}
        />
        {errors.description && (
        <code className="text-red-500 text-[11px] font-semibold">
          {errors?.description?.message}
        </code>
        )}
      </div>

      {/* Sección de subida de imagen */}
      <div className="py-1">
        <p className="uppercase text-[11px] m-0 p-0 font-medium">
          IMAGEN
        </p>
        <p className=" text-[11px] m-0 p-0 font-regular">
          Añadir una imagen puede ser beneficiosa a la hora de localiar y identificar la ayuda
        </p>
        <div
          className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer relative"
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
                Arrastra o pulsa para añadir
                {' '}
                <br />
                una imagen de la ayuda a realizar
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
        <div className="mt-4 space-y-2">
          <div className="flex items-center">
            <Checkbox
              id="privacy-policy"
              className={`mr-2 ${errors.policy_accepted ? 'border-red-500 ring-red-500' : ''}`}
              checked={getValues('policy_accepted')}
              onCheckedChange={(checked) => {
                setValue('policy_accepted', checked);
              }}
            />
            <label
              htmlFor="privacy-policy"
              className={`${errors.policy_accepted ? 'text-red-500 ring-red-500' : ''} text-[13px]`}
            >
              Acepto las políticas de privacidad.
            </label>
          </div>

          <div className="flex items-center">
            <Checkbox
              id="data-usage"
              className={`mr-2 ${errors.data_usage ? 'border-red-500 ring-red-500' : ''}`}
              checked={getValues('data_usage')}
              onCheckedChange={(checked) => {
                setValue('data_usage', checked);
              }}
            />
            <label
              htmlFor="data-usage"
              className={`${errors.data_usage ? 'text-red-500 ring-red-500' : ''} text-[13px]`}
            >
              Acepto el uso de mis datos para ayudarme en la emergencia.
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarkerCompleteForm;
