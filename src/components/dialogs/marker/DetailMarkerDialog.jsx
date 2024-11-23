import React, { useEffect, useState } from 'react';

import { toast } from 'sonner';

import { Icon } from '@iconify/react';
import { MARKER_STATUS } from '@/lib/enums';
import { getAddress } from '@/lib/getAdress';
import { Button } from '@/components/ui/button';
import { isOlderThanThreeDays } from '@/lib/date';
import { MarkerBadge } from '@/components/custom/marker-badge';
import { GoogleMapsButtton } from '@/components/custom/buttons/google-maps-button';
import { MarkerPrivacyPolicyAlert } from '@/components/custom/alerts/privacy-policy';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import isEmpty from 'lodash/isEmpty';
import { HelperDialog } from './HelperDialog';
import { OldAlert } from './children/OldAlert';
import { CodeCrudDialog } from '../code/CodeCrudDialog';
import { TelephoneButtons } from './children/TelephoneButtons';
import { MarkerImgDisplay } from './children/MarkerImgDisplay';
import { CompleteButton, DeleteButton, HelperButton } from './children/MarkerButtons';
import { MarkerAddress, MarkerDescription, MarkerVolunteer } from './children/MarkerDisplays';

function BaseDialogHeader({ marker }) {
  return (
    <DialogHeader className="pt-4">
      <DialogTitle className="uppercase font-bold text-[13px] flex flex-col items-center justify-center gap-1">
        Información
        {!isEmpty(marker) && (<MarkerBadge marker={marker} />)}

      </DialogTitle>
      <DialogDescription className="text-center font-medium text-[12px] p-0 m-0 hidden">
        -
      </DialogDescription>
    </DialogHeader>
  );
}

export function DetailMarkerDialog({
  open,
  close,
  selectedMarker,
  deleteMarker,
  assignMarker,
  completeMarker,
}) {
  const [showHelperDialog, setShowHelperDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(true);

  const [direccion, setDireccion] = useState({
    calle: null,
    poblacion: null,
    direccionCompleta: null,
  });

  const fetchMarker = (id) => {
    fetch(`/api/markers/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setMarker(data);
        setLoading(false);
      })
      .catch((error) => toast.error(`Error loading marker ${error}`));
  };

  useEffect(() => {
    setLoading(true);
    const fetchAddress = async () => {
      const addressData = await getAddress(selectedMarker.latitude, selectedMarker.longitude);
      setDireccion(addressData);
      fetchMarker(selectedMarker.id);
    };

    fetchAddress();
  }, [selectedMarker.id, selectedMarker.latitude, selectedMarker.longitude]);

  const handleDelete = () => setShowCodeDialog(true);
  const handleComplete = () => setShowCompleteDialog(true);
  const handleHelper = () => setShowHelperDialog(true);

  if (loading || isEmpty(marker)) {
    return (
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-w-[90%] md:max-w-[450px] w-fit min-w-[350px] rounded-xl p-0">
          <BaseDialogHeader marker={null} />
          <div className="w-full flex items-center justify-center h-[170px]">
            <Icon
              icon="line-md:loading-loop"
              width="30"
              height="30"
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-w-[90%] md:max-w-[450px] w-fit min-w-[350px] rounded-xl p-0 overflow-y-auto max-h-[90%] gap-2">
          <BaseDialogHeader marker={marker} />
          <div className="px-4 py-0 m-0 text-xs flex flex-col gap-2 ">
            {isOlderThanThreeDays(marker?.created_at) && <OldAlert marker={marker} />}

            <MarkerPrivacyPolicyAlert marker={marker} />

            {marker?.status === MARKER_STATUS.ASIGNADO && <MarkerVolunteer marker={marker} />}

            {marker?.img && <MarkerImgDisplay img={marker?.img} />}

            <MarkerDescription marker={marker} />

            {direccion?.calle && <MarkerAddress marker={marker} direccion={direccion} />}
          </div>

          <div className="p-4 pt-0 flex flex-col gap-1">
            <div className="flex gap-1 mt-0">
              {marker?.status !== MARKER_STATUS.COMPLETADO && (
                <CompleteButton onClick={handleComplete} />
              )}
              <DeleteButton onClick={handleDelete} />
            </div>

            {marker?.status === MARKER_STATUS.PENDIENTE && <HelperButton onClick={handleHelper} />}

            {(marker?.telf && marker?.status !== MARKER_STATUS.COMPLETADO) && (
              <TelephoneButtons telf={marker?.telf} entity={marker} />
            )}

            <GoogleMapsButtton entity={marker} />
          </div>
        </DialogContent>
      </Dialog>

      <HelperDialog
        open={showHelperDialog}
        close={setShowHelperDialog}
        selectedMarker={marker}
        callback={(body) => {
          setShowHelperDialog(false);
          assignMarker(body, () => fetchMarker(selectedMarker.id));
        }}
      />

      <CodeCrudDialog
        open={showCodeDialog}
        close={setShowCodeDialog}
        selectedMarker={marker}
        callback={(code) => {
          deleteMarker(marker.id, code);
          close(false);
        }}
      >
        <Button
          variant="destructive"
          className="w-full mt-2 uppercase text-[12px] font-semibold"
        >
          <Icon
            icon="ic:twotone-delete"
            width="20"
            height="20"
          />
          Eliminar
        </Button>
      </CodeCrudDialog>

      <CodeCrudDialog
        open={showCompleteDialog}
        close={setShowCompleteDialog}
        handleDeleteMarker={deleteMarker}
        selectedMarker={marker}
        callback={(code) => {
          completeMarker(marker?.id, code);
          close(false);
        }}
      >
        <Button className="w-full mt-2 bg-green-500 uppercase text-[12px] font-semibold">
          <Icon
            icon="line-md:circle-twotone-to-confirm-circle-twotone-transition"
            width="20"
            height="20"
          />
          Completar
        </Button>
      </CodeCrudDialog>
    </>
  );
}
