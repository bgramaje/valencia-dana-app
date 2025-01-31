/* eslint-disable jsx-a11y/label-has-associated-control */
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

export function TypeItem({
  type, isSelected, onSelect, className, disabled = false,
}) {
  if (!type) return null;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(type.key)}
      className={cn(
        'flex items-center mb-0 w-full gap-2.5 flex-1 rounded-xl border p-1.5',
        isSelected ? 'bg-slate-800 border-slate-900 text-white' : 'bg-zinc-100 border-zinc-200',
        'basis-[140px]',
        className,
      )}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `rgb(${type?.color?.join(',') ?? '0,0,0'})` }}
      >
        <Icon
          icon={type.icon}
          width="16"
          height="16"
          style={{ color: isSelected ? '#fff' : '#202020' }}
        />
      </div>
      <span
        className={`font-semibold text-[13px] uppercase leading-tight text-left ${
          isSelected ? 'text-white' : 'text-black'
        }`}
      >
        {type.label}
      </span>
    </button>
  );
}

function MarkerTypeForm({ markersType }) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const selectedTypeId = watch('type'); // Watch the form value for "marker"

  const handleSelect = (key) => {
    setValue('type', key, { shouldValidate: true }); // Update form state
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap w-full gap-2 max-w-[350px]">
        {(markersType ?? []).map((type) => (
          <TypeItem
            key={type.key}
            type={type}
            isSelected={type.key === selectedTypeId}
            onSelect={handleSelect}
            className={errors.marker ? 'border-[1px] border-red-500 ring-red-500' : ''}
          />
        ))}
      </div>
      {errors?.type && <p className="text-red-500 text-xs font-medium">{errors?.type?.message}</p>}
    </div>

  );
}

export default MarkerTypeForm;
