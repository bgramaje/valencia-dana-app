import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { DataTableDemo } from '@/components/tables/MarkersTable';

export function DrawerMarkers({ open, setIsOpen }) {
  return (
    <Sheet open={open} onOpenChange={setIsOpen}>
      <SheetContent className="!max-w-[60dvw] flex flex-col">
        <SheetHeader>
          <SheetTitle>Marcadores</SheetTitle>
          <SheetDescription>
            This action cannot be undone. This will permanently delete your account
            and remove your data from our servers.
          </SheetDescription>
        </SheetHeader>
        <DataTableDemo />
      </SheetContent>
    </Sheet>
  );
}
