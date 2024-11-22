import React, { useEffect, useState } from 'react';

import { isEmpty, omit } from 'lodash';

import { Icon } from '@iconify/react';
import { formatDate } from '@/lib/date';
import useIsAdmin from '@/hooks/useIsAdmin';
import { AlertTitle } from '@/components/ui/alert';
import PrivacyPolicyAlert from '@/components/custom/alerts/privacy-policy';
import { GoogleMapsButtton } from '@/components/custom/buttons/google-maps-button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import { NeedsAddDialog } from './NeedsAddDialog';
import { NeedSlider } from './children/NeedSlider';
import { NeedsSliderDialog } from './NeedsSliderDialog';
import { TelephoneButtons } from './children/TelephoneButtons';
import { PickupLocation, PickupName, PickupResponsable } from './children/PickupDisplays';

function BaseDialogHeader({ pickup }) {
  return (
    <DialogHeader className="pt-4">
      <DialogTitle className="uppercase font-bold text-[13px] flex flex-col items-center justify-center gap-1">
        Información
        <div className="flex gap-1 items-center font-medium text-xs">
          <Icon
            icon="fluent:hourglass-three-quarter-16-regular"
            style={{ width: 14, height: 14 }}
          />
          {pickup?.created_at && formatDate(pickup?.created_at)}
        </div>
      </DialogTitle>
      <DialogDescription className="text-center font-medium text-[12px] p-0 m-0 hidden">
        -
      </DialogDescription>
    </DialogHeader>
  );
}

export function DetailPickerDialog({
  open, close, selectedPickup, needsDB, fetchPickup, updatePickup,
}) {
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNeeds, setSelectedNeeds] = React.useState([]);

  const isAdmin = useIsAdmin();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      fetchPickup(selectedPickup.id, (data) => {
        setLoading(false);
        setPickup(data);
        setSelectedNeeds(data.needs);
      });
    };

    if (!isEmpty(selectedPickup)) fetch();
  }, [selectedPickup, fetchPickup]);

  if (loading || isEmpty(pickup)) {
    return (
      <Dialog open={open} onOpenChange={close}>
        <DialogContent
          className="max-w-[90%] md:max-w-[450px] w-fit min-w-[350px] md:min-w-[400px] rounded-xl p-0 overflow-y-auto max-h-[90%] gap-2"
        >
          <BaseDialogHeader pickup={null} />
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
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        className="max-w-[90%] md:max-w-[450px] w-fit min-w-[350px] md:min-w-[400px] rounded-xl p-0 overflow-y-auto max-h-[90%] gap-2"
      >
        <BaseDialogHeader pickup={pickup} />
        <div className="px-4 flex flex-col gap-2">
          <PrivacyPolicyAlert entity={pickup} />

          <div className="!text-[13px] font-semibold flex gap-2 items-center flex-col">
            <PickupName pickup={pickup} />
            {!isEmpty(pickup.responsable_nombre) && (
            <PickupResponsable pickup={pickup} />
            )}
            <PickupLocation pickup={pickup} />
          </div>

          {(selectedNeeds ?? []).length > 0 && (
          <>
            <AlertTitle className="text-center text-[13px] flex items-center justify-between mb-0 px-0">
              <p className="uppercase text-[11px]">Recogen :</p>
            </AlertTitle>
            <div className="flex flex-col w-full gap-1.5 py-4 py-1 pt-0 pr-1 max-h-[280px] overflow-y-auto">
              {!isEmpty(needsDB) && (selectedNeeds ?? []).map((need) => {
                const needDB = needsDB.find((n) => n.key === need.key);
                if (!needDB) return null;
                return (
                  <NeedSlider
                    key={needDB.key}
                    {...omit(needDB, ['key'])}
                    value={need?.value ?? 0}
                  />
                );
              })}
            </div>
          </>
          )}
        </div>

        <div className="p-4 pt-0 flex flex-col gap-1">
          {!isEmpty(pickup.responsable_telf) && (
            <TelephoneButtons
              telf={pickup.responsable_telf}
              entity={pickup}
            />
          )}

          {isAdmin && (
            <div className="flex gap-2 flex-wrap">
              <NeedsAddDialog
                pickup={pickup}
                setPickup={setPickup}
                updatePickup={updatePickup}
                needs={needsDB}
                selectedNeeds={selectedNeeds ?? []}
                setSelectedNeeds={setSelectedNeeds}
              />

              <NeedsSliderDialog
                pickup={pickup}
                setPickup={setPickup}
                updatePickup={updatePickup}
                needs={needsDB}
                selectedNeeds={selectedNeeds ?? []}
                setSelectedNeeds={setSelectedNeeds}
              />
            </div>
          )}

          <GoogleMapsButtton entity={pickup} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
