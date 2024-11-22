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
import { CodeCopyDialog } from '../code/CodeCopyDialog';

export function HelperDialog({
  open, close, callback, selectedMarker,
}) {
  const [helperMarker, setHelperMarker] = useState({ helper_name: '', helper_telf: '' });
  const [dataUsage, setDataUsage] = useState(false); // Changed from acceptedDataUsage
  const [policyAccepted, setPolicyAccepted] = useState(false); // Changed from acceptedPrivacyPolicy
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [code, setCode] = useState(null);
  const [errors, setErrors] = useState({
    helper_name: '',
    helper_telf: '',
  });

  const handleClose = async () => {
    const { helper_name: helperName, helper_telf: helperTelf } = helperMarker;

    const newErrors = {
      helperName: false,
      helperTelf: false,
      dataUsage: false,
      policyAccepted: false,
    };

    if (!dataUsage) newErrors.dataUsage = true;
    if (!policyAccepted) newErrors.policyAccepted = true;

    if (isEmpty(helperName)) newErrors.helperName = true;
    if (isEmpty(helperTelf)) newErrors.helperTelf = true;

    else {
      const phoneNumber = parsePhoneNumber(helperTelf, 'ES');
      if (!phoneNumber || !phoneNumber.isValid()) {
        newErrors.telf = true;
      }
    }

    setErrors(newErrors);

    if (newErrors.policyAccepted) { // Changed from acceptedPrivacyPolicy
      toast.error('Debes aceptar las políticas de privacidad para continuar.', {
        duration: 2000,
        classNames: TOAST_ERROR_CLASSNAMES,
      });
      return;
    }

    if (newErrors.dataUsage) { // Changed from acceptedDataUsage
      toast.error('Debes aceptar el uso de tus datos para ayudar en la emergencia.', {
        duration: 2000,
        classNames: TOAST_ERROR_CLASSNAMES,
      });
      return;
    }

    if (newErrors.helperName || newErrors.helperTelf) {
      toast.error('Especifica tu nombre y número de telefono', {
        duration: 2000,
        classNames: TOAST_ERROR_CLASSNAMES,
      });

      setErrors((prevErrors) => ({
        ...prevErrors,
        helper_name: isEmpty(helperName) ? 'Este campo es obligatorio' : '',
        helper_telf: isEmpty(helperTelf) ? 'Este campo es obligatorio' : '',
      }));
      return;
    }

    const phoneNumber = parsePhoneNumber(helperTelf, 'ES');
    if (!phoneNumber || !phoneNumber?.isValid()) {
      toast.error('El teléfono no es válido. Compruébalo', {
        duration: 2000,
        classNames: TOAST_ERROR_CLASSNAMES,
      });

      setErrors((prevErrors) => ({
        ...prevErrors,
        helper_telf: 'El teléfono no es válido',
      }));
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
    setErrors({
      helper_name: '',
      helper_telf: '',
    });
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={close} className="gap-2">
        <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl overflow-y-auto max-h-[90%] gap-2">
          <DialogHeader>
            <DialogTitle className="uppercase font-bold text-[14px] text-center">
              Asistencia para emergencia
            </DialogTitle>
            <div className="text-center font-medium text-[12px] max-h-[120px] overflow-y-auto">
              <DialogDescription className="text-[12px]">
                Ingresa tus datos para ofrecer ayuda a:
                <br />
              </DialogDescription>
              <p className="text-center w-full font-medium">
                &quot;
                {selectedMarker?.description ?? '-'}
                &quot;
              </p>
            </div>

          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Input
              placeholder="Nombre del ayudante"
              className={`w-full ${errors.helper_name ? 'border-red-500' : ''}`} // Add border-red-500 if error
              value={helperMarker.helper_name}
              onChange={(e) => {
                setHelperMarker({ ...helperMarker, helper_name: e.target.value });
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  helper_name: '', // Clear error on change
                }));
              }}
            />

            <Input
              placeholder="612 345 678"
              type="tel"
              pattern="[6|7|8|9]{1}[0-9]{2} [0-9]{3} [0-9]{3}"
              className={`w-full ${errors.helper_telf ? 'border-red-500' : ''}`} // Add border-red-500 if error
              value={helperMarker.helper_telf}
              onChange={(e) => {
                setHelperMarker({ ...helperMarker, helper_telf: e.target.value });
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  helper_telf: '', // Clear error on change
                }));
              }}
            />

            <div className="flex flex-col w-full gap-2">
              <div className="flex items-center">
                <Checkbox
                  id="privacy-policy"
                  className={`mr-2 ${errors.policyAccepted ? 'border-red-500 ring-red-500' : ''}`}
                  checked={policyAccepted}
                  onCheckedChange={(checked) => {
                    setPolicyAccepted(checked);
                    setErrors({ ...errors, policyAccepted: false });
                  }}
                />
                <label
                  htmlFor="privacy-policy"
                  className={`${errors.policyAccepted ? 'text-red-500 ring-red-500 animate-pulse' : ''} text-[13px]`}
                >
                  Acepto las
                  {' '}
                  <a href="/privacy-policy" className="text-blue-500 underline">
                    políticas de privacidad
                  </a>
                </label>
              </div>

              <div className="flex items-center">
                <Checkbox
                  id="data-usage-agreement"
                  className={`mr-2 ${errors.dataUsage ? 'border-red-500 ring-red-500' : ''}`}
                  checked={dataUsage}
                  onCheckedChange={(checked) => {
                    setDataUsage(checked);
                    setErrors({ ...errors, dataUsage: false });
                  }}
                />
                <label
                  htmlFor="data-usage-agreement"
                  className={`${errors.dataUsage ? 'text-red-500 ring-red-500 animate-pulse' : ''} text-[13px]`}
                >
                  Acepto que se usen mis datos para ayudarme en la emergencia.
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              className="w-full uppercase text-[12px] font-semibold"
              onClick={handleClose}
            >
              <Icon icon="line-md:circle-twotone-to-confirm-circle-twotone-transition" width="20" height="20" />
              Confirmar ayuda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CodeCopyDialog open={showCodeDialog} close={setShowCodeDialog} code={code} />
    </>
  );
}
