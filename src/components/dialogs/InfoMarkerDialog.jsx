import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Icon } from '@iconify/react'
import { Button } from "@/components/ui/button"
import { ASSISTANCE_TYPES } from '@/lib/enums'
import { getAddress, getGoogleMapsUrl } from '@/lib/getAdress'

export const InfoMarkerDialog = ({ open, close, selectedMarker, handleDeleteMarker }) => {
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

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="max-w-[90%] w-fit min-w-[350px]">
                <DialogHeader>
                    <DialogTitle>{'Información del Marcador'}</DialogTitle>
                </DialogHeader>
                <div>
                    <p className="flex gap-1 items-center text-md font-medium">Tipo:
                        <Icon
                            icon={ASSISTANCE_TYPES[selectedMarker.type].icon}
                            width="20"
                            height="20"
                        />
                        <p className="font-bold">{ASSISTANCE_TYPES[selectedMarker.type].label}</p>
                    </p>
                    <p className="text-md font-bold">Ayuda: {selectedMarker.description === '' ? '-' : selectedMarker.description}</p>
                    {direccion.calle ? (
                        <div>
                            <p className="font-bold"><span className="text-md font-medium">Calle:</span> {direccion.calle}</p>
                            <p className="font-bold"><span className="text-md font-medium">Población:</span> {direccion.poblacion}</p>
                        </div>
                    ) : (
                        <p>Cargando dirección...</p>
                    )}
                    <Button onClick={handleDeleteMarker} variant="destructive" className="w-full mt-2">Eliminar Marcador</Button> {/* Botón para eliminar el marcador */}
                    <Button onClick={() => window.open(getGoogleMapsUrl(selectedMarker), '_blank')} className="w-full mt-2">Abrir en Google Maps</Button> {/* Botón para abrir en Google Maps */}
                </div>
            </DialogContent>
        </Dialog>
    )
}