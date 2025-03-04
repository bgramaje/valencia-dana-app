import React from 'react';

import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { DialogDescription } from '@radix-ui/react-dialog';

export function InfoDialog({ open, close }) {
  const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl overflow-y-auto max-h-[90%] gap-2">
        <DialogHeader className="flex-row gap-1 items-center m-0">
          <Icon
            icon="ph:info-bold"
            style={{
              color: 'blue', width: 24, height: 24, marginTop: 4,
            }}
          />
          <DialogTitle className="text-blue-600 m-0 pt-0 mb-1">Instrucciones para un buen uso</DialogTitle>
        </DialogHeader>
        {commitSha && (
        <DialogDescription className="text-center uppercase font-medium text-[12px]">
          <p>
            v.
            {commitSha || 'No disponible'}
          </p>
        </DialogDescription>
        )}
        <div className="flex-col gap-0">
          <p>
            1. Para añadir un marcador, pulsa en el botón
            <strong>&quot;+&quot;</strong>
            .
          </p>
          <p>2. Se habilitará el mapa en modo marcador; es decir, donde pulses, se establecerá la coordenada del marcador.</p>
          <p>3. Indica el tipo de ayuda que necesitas y añade una descripción.</p>
          <p><strong>4. Cuando hayas recibido ayuda, ELIMINA el marcador, porfavor.</strong></p>
          <p>Para cualquier cosa, dejo mi email: boraal.dev@gmail.com</p>
        </div>
        <DialogFooter>
          <Button onClick={close} className="w-full mt-2 bg-blue-500 font-semibold">Entendido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
