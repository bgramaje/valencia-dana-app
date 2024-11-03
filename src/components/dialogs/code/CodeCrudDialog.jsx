import React from 'react';

import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

export function CodeCrudDialog({
  open, close, selectedMarker, callback, children,
}) {
  const [value, setValue] = React.useState('');

  const handleClose = () => {
    if (value !== selectedMarker?.password) {
      toast.error('Error borrando marcador', {
        description: 'El código de borrado no es correcto.',
        duration: 2000,
      });
      return;
    }
    callback(value);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="uppercase font-bold text-[14px]">Código</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-0 justify-center items-center">
          <Alert>
            <AlertTitle />
            <AlertDescription>
              <p className="text-[13px] max-w-[260px] text-center m-4 mt-0">
                Escriba el código facilitado durante la creación para aplicar la operación.
              </p>
              <div className="w-full flex items-center justify-center">
                <InputOTP
                  variant="destructive"
                  maxLength={6}
                  value={value}
                  onChange={(val) => setValue(val)}
                  required
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
              </div>
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          {React.cloneElement(children, { onClick: handleClose })}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
