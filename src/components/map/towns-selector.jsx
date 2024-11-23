/* eslint-disable react/jsx-no-useless-fragment */

'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Icon } from '@iconify/react';

import useMediaQuery from '@/hooks/useMediaQuery';
import { Badge } from '../ui/badge';

export function ComboBoxResponsive({ towns, setSelectedTown, selectedTown }) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            {selectedTown
              ? (
                <div className="flex justify-between w-full items-center uppercase text-[11px] gap-1">
                  {selectedTown.name}
                  <Badge
                    className="p-1 py-0 animate-pulse min-w-[20px] flex-items-center justify-center"
                  >
                    {selectedTown.total_helpers_markers}
                  </Badge>
                </div>
              )
              : (
                <div className="flex justify-between w-full items-center uppercase text-[11px]">
                  Poblaciones
                  <Icon icon="material-symbols:keyboard-arrow-down-rounded" width={20} height={24} />
                </div>
              )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <TownsList
            towns={towns}
            setOpen={setOpen}
            setSelectedTown={setSelectedTown}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start px-2">
          {selectedTown
            ? (

              <div className="flex justify-between w-full items-center uppercase text-[11px] gap-1">
                <div className="flex w-full justify-between">
                  {selectedTown.name}
                  <Badge
                    className="p-1 py-0 animate-pulse min-w-[20px] flex-items-center justify-center"
                  >
                    {selectedTown.total_helpers_markers}
                  </Badge>
                </div>

                <Icon icon="material-symbols:keyboard-arrow-down-rounded" width={20} height={24} />
              </div>
            )
            : (
              <div className="flex justify-between w-full items-center uppercase text-[11px]">
                Poblaciones
                <Icon icon="material-symbols:keyboard-arrow-down-rounded" width={20} height={24} />
              </div>
            )}
        </Button>
      </DrawerTrigger>
      <DrawerTitle />
      <DrawerContent>
        <div className="mt-4 border-t">
          <TownsList
            towns={towns}
            setOpen={setOpen}
            setSelectedTown={setSelectedTown}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function TownsList({
  towns,
  setOpen,
  setSelectedTown,
}) {
  return (
    <Command>
      <CommandInput className="!text-[16px] p-0 focus:!text-[16px]" placeholder="Buscar poblaciones..." />
      <CommandList>
        <CommandEmpty>Población sin ayuda solicitada.</CommandEmpty>
        <CommandGroup>
          {towns.map((town) => (
            <CommandItem
              key={town.name}
              value={town.name}
              onSelect={(value) => {
                setSelectedTown(
                  towns.find((t) => t.name === value) || null,
                );
                setOpen(false);
              }}
            >
              <div className="flex w-full justify-between uppercase font-semibold text-xs">
                {town.name}
                <Badge
                  className="p-1 py-0 animate-pulse min-w-[20px] flex-items-center justify-center"
                >
                  {town.total_helpers_markers}
                </Badge>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
