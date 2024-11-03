/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';

import { toast } from 'sonner';

import { Icon } from '@iconify/react';
import { DATE_OPTIONS } from '@/lib/enums';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

export function CodeCopyDialog({ open, close, code }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 4000); // Hide the message after 2 seconds
      })
      .catch((err) => toast.error(`Error copying code: ${err}`));
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="uppercase font-bold text-[14px]">Código</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-0 justify-center items-center">
          <Alert>
            <AlertTitle>Se ha añadido tu marcador!</AlertTitle>
            <AlertDescription>
              <p
                className="text-[13px] max-w-[260px] text-left mb-2"
              >
                Guarda el siguiente código generado para poder borrar
                el marcador generado
              </p>
              <div className="w-full flex items-start justify-start gap-2">
                <InputOTP
                  maxLength={6}
                  value={code}
                  disabled
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <Button size="icon" variant="outline" className="mt-0 m-0 p-0" onClick={copyCode}>
                  <Icon
                    icon="mingcute:copy-fill"
                    style={{
                      color: 'black', width: 20, height: 20, margin: 0,
                    }}
                  />
                </Button>
              </div>

              {copied && (
              <p className="text-green-500 text-xs mt-1 font-semibold">Código copiado con éxito!</p>
              )}
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button
            className="w-full mt-0"
            onClick={() => {
              close(false);
              toast.success('Marcador creado correctamente', {
                description: new Intl.DateTimeFormat('es-ES', DATE_OPTIONS).format(new Date()),
                duration: 2000,
              });
            }}
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}