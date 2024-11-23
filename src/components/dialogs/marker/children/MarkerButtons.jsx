import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import React from 'react';

export function CompleteButton({ onClick, className }) {
  return (
    <Button
      onClick={onClick}
      className={cn('w-full bg-green-500 uppercase text-[12px] font-semibold hover:bg-green-700', className)}
    >
      <Icon
        icon="line-md:circle-twotone-to-confirm-circle-twotone-transition"
        width="20"
        height="20"
      />
      Completar
    </Button>
  );
}

export function DeleteButton({ onClick, className }) {
  return (
    <Button
      onClick={onClick}
      variant="destructive"
      className={cn('w-full uppercase text-[12px] font-semibold hover:bg-red-700', className)}
    >
      <Icon
        icon="ic:twotone-delete"
        width="20"
        height="20"
      />
      Eliminar
    </Button>
  );
}

export function HelperButton({ onClick }) {
  return (
    <Button
      onClick={onClick}
      className="w-full bg-orange-500 uppercase text-[12px] font-semibold"
    >
      <Icon
        icon="akar-icons:person"
        width="20"
        height="20"
      />
      Ofrecerme voluntario
    </Button>
  );
}
