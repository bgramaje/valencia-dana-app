import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Icon } from '@iconify/react'
import { Button } from "@/components/ui/button"
import { ASSISTANCE_TYPES, DATE_OPTIONS } from '@/lib/enums'
import { getAddress, getGoogleMapsUrl } from '@/lib/getAdress'
import { Badge } from "@/components/ui/badge"

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

const CodeDialog = ({ open, close, handleDeleteMarker, selectedMarker }) => {
    const [value, setValue] = React.useState("")

    const handleClose = () => {
        if (value !== selectedMarker.password) {
            toast.error("Error borrando marcador", {
                description: "El código de borrado no es correcto.",
                duration: 2000,
            })
            return;
        }

        handleDeleteMarker()
        close(false)
        toast.success("Marcador borrado correctamente", {
            description: new Intl.DateTimeFormat('es-ES', DATE_OPTIONS).format(new Date()),
            duration: 2000,
        })
    }

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl">
                <DialogHeader>
                    <DialogTitle>{'Código de borrado'}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-0 justify-center items-center">
                    <Alert>
                        <AlertTitle></AlertTitle>
                        <AlertDescription>
                            <p className="text-[13px] max-w-[260px] text-left mb-2">
                                Escriba el código facilitado durante la creación para borrar el marcador.
                            </p>
                            <div className="w-full flex items-center justify-center">
                                <InputOTP
                                    variant="destructive"
                                    maxLength={6}
                                    value={value}
                                    onChange={(value) => setValue(value)}
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
                    <Button className="w-full mt-0" variant="destructive" onClick={handleClose}>
                        Borrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export const InfoMarkerDialog = ({ open, close, selectedMarker, handleDeleteMarker }) => {
    const [showCodeDialog, setShowCodeDialog] = useState(false);
    const [direccion, setDireccion] = useState({
        calle: null,
        poblacion: null,
        direccionCompleta: null,
    });

    useEffect(() => {
        const fetchAddress = async () => {
            const addressData = await getAddress(selectedMarker.latitude, selectedMarker.longitude);
            setDireccion(addressData);
        };

        fetchAddress();
    }, [selectedMarker]);

    const handleDelete = () => setShowCodeDialog(true)

    return (
        <>
            <Dialog open={open} onOpenChange={close}>
                <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-left flex flex-col items-center gap-1">
                            {'Información'}
                            <Badge variant={"outline"}>
                                <p className="uppercase text-[11px]">
                                    {selectedMarker.status}
                                </p>
                            </Badge>
                        </DialogTitle>
                    </DialogHeader>
                    <div>
                        <div className="flex gap-1 items-center text-md font-medium">Tipo:
                            <Icon
                                icon={ASSISTANCE_TYPES[selectedMarker.type].icon}
                                width="20"
                                height="20"
                            />
                            <p className="font-bold">{ASSISTANCE_TYPES[selectedMarker.type].label}</p>
                        </div>
                        <p className="text-md font-bold">Ayuda: {selectedMarker.description === '' ? '-' : selectedMarker.description}</p>
                        <p className="text-md font-bold">Teléfono: {selectedMarker.telf === '' ? '-' : selectedMarker.telf}</p>
                        {direccion.calle ? (
                            <div>
                                <p className="font-bold"><span className="text-md font-medium">Calle:</span> {direccion.calle}</p>
                                <p className="font-bold"><span className="text-md font-medium">Población:</span> {direccion.poblacion}</p>
                            </div>
                        ) : (
                            <p>Cargando dirección...</p>
                        )}
                        <Button onClick={handleDelete} variant="destructive" className="w-full mt-2">Eliminar Marcador</Button> {/* Botón para eliminar el marcador */}
                        <Button onClick={() => window.open(getGoogleMapsUrl(selectedMarker), '_blank')} className="w-full mt-2">Abrir en Google Maps</Button> {/* Botón para abrir en Google Maps */}
                    </div>
                </DialogContent>
            </Dialog>
            <CodeDialog
                open={showCodeDialog}
                close={setShowCodeDialog}
                handleDeleteMarker={handleDeleteMarker}
                selectedMarker={selectedMarker}
            />
        </>
    )
}