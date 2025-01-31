/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable jsx-a11y/role-supports-aria-props */
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react';
import { defineStepper } from '@stepperize/react';
import { isPossiblePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'; // Assuming you're using libphonenumber-js
import React, {
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { CodeCopyDialog } from '../code/CodeCopyDialog';
import MarkerCompleteForm from './stepper/marker-complete-form';
import MarkerContactForm from './stepper/marker-contact-form';
import MarkerTypeForm from './stepper/marker-type-form';

const markerTypeSchema = z.object({
  type: z
    .string({
      required_error: 'Seleccion el tipo de ayuda que deseas',
    })
    .min(1, { message: 'Seleccion el tipo de ayuda que deseas' }),
});

const markerContactSchema = z.object({
  address: z
    .string({
      required_error: 'Ingrese la dirección postal donde deseas ayuda',
    })
    .min(1, { message: 'Seleccion el tipo de ayuda que deseas' }),
  location: z.string(),
  telf: z
    .string({
      required_error: 'Por favor, ingrese un número de teléfono',
    })
    .min(1, { message: 'Por favor, ingrese un número de teléfono' })
    .refine((value) => isValidPhoneNumber(value) && isPossiblePhoneNumber(value), {
      message: 'Por favor, ingrese un número de teléfono válido',
    })
    .default(''),
});

const completeSchema = z.object({
  description: z
    .string({
      required_error: 'Describa la ayuda que deseas',
    })
    .min(1, { message: 'Describa la ayuda que deseas' }),
  image: z.string().optional(), // Campo para la imagen en Base64 (opcional)

});

const { useStepper, steps, utils } = defineStepper(
  {
    id: 'markerType',
    title: 'Tipo',
    icon: 'ep:help',
    schema: markerTypeSchema,
  },
  {
    id: 'contact',
    title: 'Contacto',
    icon: 'mage:contact-book',
    schema: markerContactSchema,
  },
  {
    id: 'complete',
    title: 'Descripción',
    icon: 'bi:info-lg',
    schema: completeSchema,
  },
);

export function CreateMarkerForm({
  markersType,
  selectedCoordinates,
  handleAddMarker,
}) {
  const [newMarker, setNewMarker] = useState({});
  const stepper = useStepper();

  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(stepper.current.schema),
  });

  const onSubmit = (values) => {
    console.log(values);
    console.log(stepper.isLast);

    // biome-ignore lint/suspicious/noConsoleLog: <We want to log the form values>
    if (stepper.isLast) {
      handleAddMarker({ ...newMarker, ...values });
      stepper.reset();
    } else {
      setNewMarker(values);
      stepper.next();
    }
  };

  const currentIndex = utils.getIndex(stepper.current.id);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="rounded-lg min-w-[280px]"
      >
        <nav aria-label="Checkout Steps" className="group my-3">
          <ol
            className="flex items-center justify-center gap-0 w-full"
            aria-orientation="horizontal"
          >
            {stepper.all.map((step, index, array) => (
              <div key={step.id} className="flex gap-0 items-center w-full ">
                <li className="flex items-center gap-1.5 flex-shrink-0 flex-col justify-center">
                  <Button
                    type="button"
                    role="tab"
                    variant={index <= currentIndex ? 'default' : 'secondary'}
                    aria-current={stepper.current.id === step.id ? 'step' : undefined}
                    aria-posinset={index + 1}
                    aria-setsize={steps.length}
                    aria-selected={stepper.current.id === step.id}
                    style={{
                      backgroundColor: form.getValues('type') && index === 0
                        ? `rgb(${markersType.find((t) => t.key === form.getValues('type'))?.color?.join(',') ?? '0,0,0'})`
                        : '#202020',
                      color: form.getValues('type') && index === 0
                        ? '#202020' : '#fff',
                    }}
                    className={cn(
                      'flex w-4 h-8 items-center justify-center rounded-full',
                      stepper.current.id === step.id && 'animate-bounce',
                    )}
                    onClick={() => {
                      if (currentIndex === index) return;
                      if (currentIndex < index) return;
                      stepper.goTo(step.id);
                    }}
                  >
                    <Icon
                      icon={
                        form.getValues('type') && index === 0
                          ? markersType.find((t) => t.key === form.getValues('type'))?.icon
                          : step.icon
}
                      style={{ width: '22px', height: '22px' }}
                    />
                  </Button>
                  <div className="flex flex-col gap-0 text-center uppercase">
                    <span className="text-[11px] font-semibold w-[80px]">
                      {step.title}
                    </span>
                  </div>
                </li>
                {index < array.length - 1 && (
                <Separator className="max-w-[30px] mb-6" />
                )}
              </div>
            ))}
          </ol>
        </nav>
        <div className="space-y-2 min-w-[280px] max-w-[450px]">
          {stepper.switch({
            markerType: () => (
              <MarkerTypeForm markersType={markersType} />
            ),
            contact: () => (
              <MarkerContactForm
                selectedCoordinates={selectedCoordinates}
              />
            ),
            complete: () => (
              <MarkerCompleteForm
                selectedCoordinates={selectedCoordinates}
              />
            ),
          })}
          <div className="flex justify-between gap-2 w-full z-10">
            <Button
              type="button"
              variant="secondary"
              onClick={stepper.prev}
              disabled={stepper.isFirst}
              className="w-full border-zinc-300 border-[1px]"
            >
              Atrás
            </Button>
            <Button type="submit" className="w-full">
              {stepper.isLast ? 'Añadir Marcador' : 'Siguiente'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export function CreateMarkerDialog({
  open,
  close,
  currentLocation,
  markersType,
  handleAddMarker,
}) {
  const [showCodeDialog, setShowCodeDialog] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl overflow-y-auto max-h-[90%] gap-2 p-4">
          <DialogHeader>
            <DialogTitle className="uppercase font-bold text-[14px] text-center">
              Pedir ayuda
            </DialogTitle>
            <DialogDescription className="text-center font-regular text-[12px] !mt-0.5 !pt-0">
              Solicita ayuda debido al temporal DANA
            </DialogDescription>
          </DialogHeader>
          <CreateMarkerForm
            markersType={markersType}
            selectedCoordinates={currentLocation}
          />
        </DialogContent>
      </Dialog>

      <CodeCopyDialog open={showCodeDialog} close={setShowCodeDialog} code={null} />
    </>
  );
}
