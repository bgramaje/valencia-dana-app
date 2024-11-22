import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import React from 'react';

export function CompleteButton({ onClick }) {
  return (
    <Button
      onClick={onClick}
      className="w-full bg-green-500 uppercase text-[12px] font-semibold"
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

export function DeleteButton({ onClick }) {
  return (
    <Button
      onClick={onClick}
      variant="destructive"
      className="w-full uppercase text-[12px] font-semibold"
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
