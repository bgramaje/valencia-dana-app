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
        <Input
          placeholder="Dirección Postal"
          type="text"
          id={register('address').name}
          {...register('address')}
        />
        {errors.address && (
          <span className="text-sm text-destructive">
            {errors.address.message}
          </span>
        )}
        <PhoneInput
          id={register('telf').name}
          {...register('telf')}
          defaultCountry="ES" // Default country code
        />
        {errors.telf && (
          <span className="text-sm text-destructive">
            {errors.telf.message}
          </span>
        )}
      </div>
    </div>
  );
}

export default MarkerContactForm;
