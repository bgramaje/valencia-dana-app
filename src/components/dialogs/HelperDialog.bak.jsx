/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable consistent-return */
import React, {
  useEffect,
  useState,
} from 'react';
import { toast } from 'sonner';
import { isEmpty } from 'lodash';
import parsePhoneNumber from 'libphonenumber-js';

import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { TOAST_ERROR_CLASSNAMES } from '@/lib/enums';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { CodeCopyDialog } from './code/CodeCopyDialog';

export function HelperDialog({
  open, close, callback, selectedMarker,
}) {
  const [helperMarker, setHelperMarker] = useState({ helper_name: '', helper_telf: '' });
  const [acceptedDataUsage, setAcceptedDataUsage] = useState(false);
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [code, setCode] = useState(null);

  const handleClose = async () => {
    const { helper_name: helperName, helper_telf: helperTelf } = helperMarker;

    if (!acceptedPrivacyPolicy) {
      toast.error('Debes aceptar las políticas de privacidad para continuar.', {
        duration: 2000,
        classNames: TOAST_ERROR_CLASSNAMES,
      });
      return;
    }

    if (!acceptedDataUsage) {
      toast.error('Debes aceptar el uso de tus datos para ayudar en la emergencia.', {
        duration: 2000,
        classNames: TOAST_ERROR_CLASSNAMES,
      });
      return;
    }

    if (isEmpty(helperName) || isEmpty(helperTelf)) {
      toast.error('Especifica tu nombre y número de telefono', {
        duration: 2000,
        classNames: TOAST_ERROR_CLASSNAMES,
      });
      return;
    }

    const phoneNumber = parsePhoneNumber(helperTelf, 'ES');
    if (!phoneNumber || !phoneNumber?.isValid()) {
      toast.error('El teléfono no es válido. Compruébalo', {
        duration: 2000,
        classNames: TOAST_ERROR_CLASSNAMES,
      });
      return;
    }

    const c = (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000).toString();
    setCode(c);
    setShowCodeDialog(true);

    callback({
      helper_name: helperName, helper_telf: helperTelf, status: 'asignado', helper_password: c,
    });
  };

  useEffect(() => {
    setHelperMarker({ helper_name: '', helper_telf: '' });
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={close} className="gap-2">
        <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl overflow-y-auto max-h-[90%] gap-2">
          <DialogHeader>
            <DialogTitle className="uppercase font-bold text-[14px] text-center">Ofrecerme Voluntario</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center font-medium text-[12px] p-0 m-0">
            Ofrecerme para completar:
            <br />
            &quot;
            {selectedMarker?.description ?? '-'}
            &quot;
          </DialogDescription>
          <div className="flex flex-col gap-2">
            <Input
              id="name"
              placeholder="Nombre"
              required
              type="text"
              className="mt-0"
              value={helperMarker.helper_name}
              onChange={(e) => setHelperMarker((prev) => ({ ...prev, helper_name: e.target.value }))}
            />
            <Input
              id="telf"
              placeholder="612 345 678"
              required
              type="tel"
              pattern="[6|7|8|9]{1}[0-9]{2} [0-9]{3} [0-9]{3}"
              className="mt-0"
              value={helperMarker.helper_telf}
              onChange={(e) => setHelperMarker((prev) => ({ ...prev, helper_telf: e.target.value }))}
            />
          </div>
          <DialogFooter className="mt-2">
            <div className="flex flex-col w-full gap-2">
              <div className="flex items-center">
                <Checkbox
                  id="privacy-policy"
                  checked={acceptedPrivacyPolicy}
                  onCheckedChange={(checked) => setAcceptedPrivacyPolicy(checked)}
                  className="mr-2"
                />
                <label htmlFor="privacy-policy" className="text-sm">
                  Acepto las
                  {' '}
                  <a href="/privacy-policy" className="text-blue-500 underline">políticas de privacidad</a>
                </label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  id="data-usage-agreement"
                  checked={acceptedDataUsage}
                  onCheckedChange={(checked) => setAcceptedDataUsage(checked)}
                  className="mr-2"
                />
                <label htmlFor="data-usage-agreement" className="text-sm">
                  Acepto que se puedan usar mis datos para ayudar en la emergencia.
                </label>
              </div>
              <Button
                className="w-full mt-0 uppercase text-[12px] font-semibold bg-orange-500"
                onClick={handleClose}
              >
                <Icon
                  icon="akar-icons:person"
                  width="20"
                  height="20"
                />
                Ofrecerme Voluntario
              </Button>
            </div>

          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CodeCopyDialog
        open={showCodeDialog}
        close={setShowCodeDialog}
        code={code}
        title="Gracias por contribuir!"
        subtitle="Recuerda marcar la ayuda como completada, ya sea por ti o por el solicitante.
        Para hacerlo, pulsa el botón 'COMPLETAR' e ingresa el siguiente código. ¡Guárdalo bien!"
      />
    </>

  );
}
