import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Icon } from '@iconify/react'
import { Button } from "@/components/ui/button"
import { ASSISTANCE_TYPES } from '@/lib/enums'
import { getAddress } from '@/lib/getAdress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export const CreateDialog = ({ open, close, newMarker, handleAddMarker, setNewMarker }) => {
    const [direccion, setDireccion] = useState({
        calle: null,
        poblacion: null,
        direccionCompleta: null,
    });

    useEffect(() => {
        const fetchAddress = async () => {
            const addressData = await getAddress(newMarker.latitude, newMarker.longitude);
            setDireccion(addressData);
        };

        fetchAddress();
    }, [newMarker]);

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl">
                <DialogHeader>
                    <DialogTitle>{'Añadir nuevo marcador'}</DialogTitle>
                </DialogHeader>
                <Select
                    value={newMarker.type}
                    onValueChange={(value) => setNewMarker({ ...newMarker, type: value })}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Tipo de asistencia" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(ASSISTANCE_TYPES).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                                <span className="flex items-center">
                                    <Icon icon={value.icon} width="20" height="20" className="mr-2" />
                                    {value.label}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    className="mt-0"
                    placeholder="Qué necesitas? Telf?"
                    value={newMarker.description}
                    onChange={(e) => setNewMarker({ ...newMarker, description: e.target.value })}
                />
                {direccion.calle ? (
                    <div>
                        <p><strong>Calle:</strong> {direccion.calle}</p>
                        <p><strong>Población:</strong> {direccion.poblacion}</p>
                    </div>
                ) : (
                    <p>Cargando dirección...</p>
                )}
                <DialogFooter>
                    <Button className="w-full mt-0" onClick={handleAddMarker}>
                        Confirmar y añadir marcador
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}