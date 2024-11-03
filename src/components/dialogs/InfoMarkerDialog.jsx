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

const CodeDialog = ({ open, close, selectedMarker, callback, children }) => {
    const [value, setValue] = React.useState("")

    const handleClose = () => {
        if (value !== selectedMarker.password) {
            toast.error("Error borrando marcador", {
                description: "El código de borrado no es correcto.",
                duration: 2000,
            })
            return;
        }
        callback()
    }

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl">
                <DialogHeader>
                    <DialogTitle>{'Código'}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-0 justify-center items-center">
                    <Alert>
                        <AlertTitle></AlertTitle>
                        <AlertDescription>
                            <p className="text-[13px] max-w-[260px] text-left mb-2">
                                Escriba el código facilitado durante la creación para aplicar la operación.
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
                    {React.cloneElement(children, { onClick: handleClose })}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export const InfoMarkerDialog = ({ open, close, selectedMarker, handleDeleteMarker, handleCompleteMarker }) => {
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
            .then(response => response.json())
            .then(data => {
                setMarker(data);
            })
            .catch(error => console.error('Error loading markers:', error));
    }


    useEffect(() => {
        setLoading(true)
        const fetchAddress = async () => {
            const addressData = await getAddress(selectedMarker.latitude, selectedMarker.longitude);
            setDireccion(addressData);
        };

        fetchAddress();
        fetchMarker(selectedMarker.id)
        setLoading(false)
    }, [selectedMarker]);

    const handleDelete = () => setShowCodeDialog(true)
    const handleComplete = () => setShowCompleteDialog(true)

    if (loading || marker === null || marker === undefined) {
        return (
            <Dialog open={open} onOpenChange={close}>
                <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl p-0">
                    <DialogHeader className="pt-4">
                        <DialogTitle className="text-left flex flex-col items-center gap-1">
                            {'Información'}
                            {selectedMarker.status === "completado" && (
                                <Badge className="bg-green-500 text-green-900 animate-pulse hover:bg-green-500 hover:cursor-pointer">
                                    <p className="uppercase text-[11px]">
                                        {selectedMarker.status}
                                    </p>
                                </Badge>
                            )}
                            {selectedMarker.status === "pendiente" && (
                                <Badge variant={"outline"} className="animate-pulse bg-red-500 text-red-900">
                                    <p className="uppercase text-[11px]">
                                        {selectedMarker.status}
                                    </p>
                                </Badge>
                            )}
                            {selectedMarker.status === "asignado" && (
                                <Badge variant={"outline"} className="animate-pulse bg-orange-500 text-orange-900">
                                    <p className="uppercase text-[11px]">
                                        {selectedMarker.status}
                                    </p>
                                </Badge>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="w-full flex items-center justify-center h-[150px]">
                        <Icon
                            icon="line-md:loading-loop"
                            width="30"
                            height="30"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <>
            <Dialog open={open} onOpenChange={close}>
                <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl p-0">
                    <DialogHeader className="pt-4">
                        <DialogTitle className="text-left flex flex-col items-center gap-1">
                            {'Información'}
                            {selectedMarker.status === "completado" && (
                                <Badge className="bg-green-500 text-green-900 animate-pulse hover:bg-green-500 hover:cursor-pointer">
                                    <p className="uppercase text-[11px]">
                                        {selectedMarker.status}
                                    </p>
                                </Badge>
                            )}
                            {selectedMarker.status === "pendiente" && (
                                <Badge variant={"outline"} className="animate-pulse bg-red-500 text-red-900">
                                    <p className="uppercase text-[11px]">
                                        {selectedMarker.status}
                                    </p>
                                </Badge>
                            )}
                            {selectedMarker.status === "asignado" && (
                                <Badge variant={"outline"} className="animate-pulse bg-orange-500 text-orange-900">
                                    <p className="uppercase text-[11px]">
                                        {selectedMarker.status}
                                    </p>
                                </Badge>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    {marker?.img && (
                        <div className="w-full p-1">
                            <img src={marker.img} className="rounded-xl" />
                        </div>
                    )}
                    <div className="p-4 pt-0">
                        <div className="flex gap-1 items-center text-md font-medium">Tipo:
                            <Icon
                                icon={ASSISTANCE_TYPES[marker?.type].icon}
                                width="20"
                                height="20"
                            />
                            <p className="font-bold">{ASSISTANCE_TYPES[marker?.type].label}</p>
                        </div>
                        <p className=":text-md font-bold">Ayuda: {marker?.description === '' ? '-' : marker.description}</p>
                        <p className="text-md font-bold">Teléfono: {marker?.telf === '' ? '-' : marker?.telf}</p>
                        {direccion.calle ? (
                            <div>
                                <p className="font-bold"><span className="text-md font-medium">Calle:</span> {direccion.calle}</p>
                                <p className="font-bold"><span className="text-md font-medium">Población:</span> {direccion.poblacion}</p>
                            </div>
                        ) : (
                            <p>Cargando dirección...</p>
                        )}
                        <div className="flex gap-2">
                            {marker?.status !== "completado" &&
                                <Button onClick={handleComplete} className="w-full mt-2 bg-green-500 uppercase text-[12px] font-semibold">
                                    <Icon
                                        icon="line-md:circle-twotone-to-confirm-circle-twotone-transition"
                                        width="20"
                                        height="20"
                                    />
                                    Completar
                                </Button>
                            }
                            <Button onClick={handleDelete} variant="destructive" className="w-full mt-2 uppercase text-[12px] font-semibold">
                                <Icon
                                    icon="ic:twotone-delete"
                                    width="20"
                                    height="20"
                                />
                                Eliminar
                            </Button>
                        </div>
                        {marker?.telf && (
                            <a href={`tel:+34${marker?.telf}`}>
                                <Button className="w-full mt-2 bg-blue-500 uppercase text-[12px] font-semibold">
                                    <Icon
                                        icon="solar:phone-calling-bold"
                                        width="20"
                                        height="20"
                                    />
                                    Llamar
                                </Button> {/* Botón para abrir en Google Maps */}
                            </a>
                        )}

                        <Button onClick={() => window.open(getGoogleMapsUrl(marker), '_blank')} className="w-full mt-2">
                            <Icon
                                icon="mingcute:location-fill"
                                width="20"
                                height="20"
                            />
                            Abrir en Google Maps
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <CodeDialog
                open={showCodeDialog}
                close={setShowCodeDialog}
                selectedMarker={marker}
                callback={() => {
                    handleDeleteMarker()
                    close(false)
                    toast.success("Marcador borrado correctamente", {
                        description: new Intl.DateTimeFormat('es-ES', DATE_OPTIONS).format(new Date()),
                        duration: 2000,
                    })
                }}
            >
                <Button variant="destructive" className="w-full mt-2 uppercase text-[12px] font-semibold">
                    <Icon
                        icon="ic:twotone-delete"
                        width="20"
                        height="20"
                    />
                    Eliminar
                </Button>
            </CodeDialog>

            <CodeDialog
                open={showCompleteDialog}
                close={setShowCompleteDialog}
                handleDeleteMarker={handleDeleteMarker}
                selectedMarker={marker}
                callback={() => {
                    handleCompleteMarker()
                    close(false)
                    toast.success("Marcador marcado como completado correctamente", {
                        description: new Intl.DateTimeFormat('es-ES', DATE_OPTIONS).format(new Date()),
                        duration: 2000,
                    })
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
            </CodeDialog>
        </>
    )
}