import React, { useEffect } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

export function CodeCrudDialog({
  open,
  close,
  callback,
  title = null,
  description = null,
  children,
}) {
  const [value, setValue] = React.useState('');

  const handleClose = () => callback(value);

  useEffect(() => {
    if (!open) setValue('');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="uppercase font-bold text-[14px] text-center">{title ?? 'Código'}</DialogTitle>
        </DialogHeader>
        <DialogDescription
          className="text-center font-medium text-[12px] p-0 m-0 hidden"
        >
          -
        </DialogDescription>
        <div className="flex flex-col gap-0 justify-center items-center">
          <Alert>
            <AlertTitle />
            <AlertDescription>
              <p className="text-[13px] max-w-[260px] text-center m-4 mt-0 font-medium !leading-tight">
                {description ?? 'Escriba el código facilitado durante la creación para aplicar la operación.'}
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
          {children && React.cloneElement(children, { onClick: handleClose })}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
