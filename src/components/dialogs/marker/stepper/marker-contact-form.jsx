/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { PhoneInput } from '@/components/custom/phone-input';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { getAddress } from '@/lib/getAdress';
import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

function MarkerContactForm({ selectedCoordinates }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext();

  useEffect(() => {
    const fetchAddress = async () => {
      const { latitude, longitude } = selectedCoordinates;
      const addressData = await getAddress(latitude, longitude);

      setValue('address', addressData.calle.trim() ?? '-', { shouldValidate: true }); // Update form state
      setValue('location', addressData.poblacion ?? '-', { shouldValidate: true }); // Update form state
      setLoading(false);
    };

    if (selectedCoordinates && !getValues('address')) {
      setLoading(true);
      fetchAddress();
    }
  }, [selectedCoordinates, setValue, getValues]);

  if (loading) {
    return (
      <div className="py-4 flex flex-col gap-1 w-full justify-center items-center">
        <Icon
          icon="line-md:loading-loop"
          width="30"
          height="30"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-2 mt-0">
        {getValues('location') && (
          <div className="!text-[13px] font-semibold flex gap-2 items-center px-0">
            <Alert className="border-zinc-200 bg-zinc-100 px-3 py-1">
              <AlertTitle className="text-center text-[13px] flex items-center w-full justify-between mb-0">
                <p className="uppercase text-[11px]">Ubicación:</p>
                <span className="uppercase">
                  {getValues('location') ?? '-'}
                </span>
              </AlertTitle>
            </Alert>
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <div className="flex flex-col">
            <p className="uppercase text-[11px] m-0 p-0 font-medium">
              DIRECCIÓN POSTAL
            </p>
            <p className=" text-[11px] m-0 p-0 font-regular">
              Añadir una dirección postal para saber donde exactamente acudir
            </p>
          </div>
          <Input
            placeholder="Dirección Postal"
            type="text"
            id={register('address').name}
            {...register('address')}
            className={errors.address ? 'border-[1px] border-red-500 ring-red-500' : ''}
          />
          {errors.address && (
            <code className="text-red-500 text-[11px] font-semibold">
              {errors?.address?.message}
            </code>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex flex-col">
            <p className="uppercase text-[11px] m-0 p-0 font-medium">
              NOMBRE DE CONTACTO
            </p>
            <p className=" text-[11px] m-0 p-0 font-regular">
              Añadir un nombre para saber a quien nos dirigimos
            </p>
          </div>
          <Input
            placeholder="Introduzca su nombre"
            type="text"
            id={register('name').name}
            {...register('name')}
            className={errors.name ? 'border-[1px] border-red-500 ring-red-500' : ''}
          />
          {errors.name && (
            <code className="text-red-500 text-[11px] font-semibold">
              {errors?.name?.message}
            </code>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-col">
            <p className="uppercase text-[11px] m-0 p-0 font-medium">
              TELÉFONO
            </p>
            <p className=" text-[11px] m-0 p-0 font-regular">
              Añadir un teléfono es esencial para que peudas recibir la ayuda
            </p>
          </div>

          <PhoneInput
            id={register('telf').name}
            {...register('telf')}
            value={getValues('telf')}
            onChange={(val) => {
              setValue('telf', val.replace(/\s/g, '').trim());
            }}
            country={getValues('_country')}
            onCountryChange={(_country) => setValue('_country', _country)}
            className={errors.telf ? 'border-[1px] border-red-500 ring-red-500 rounded-md' : ''}
          />

          {errors.telf && (
            <code className="text-red-500 text-[11px] font-semibold">
              {errors?.telf?.message}
            </code>
          )}
        </div>
      </div>
    </div>
  );
}

export default MarkerContactForm;
