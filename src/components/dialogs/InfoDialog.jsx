import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Icon } from '@iconify/react'
import { Button } from "@/components/ui/button"

export const InfoDialog = ({ open, close }) => {
    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent>
                <DialogHeader className="flex-row gap-1 items-center m-0">
                    <Icon
                        icon="ph:info-bold"
                        style={{ color: 'blue', width: 24, height: 24, marginTop: 4 }} // Color blanco para los iconos
                    />
                    <DialogTitle className="text-blue-600 m-0 pt-0 mb-1">Instrucciones para un buen uso</DialogTitle>
                </DialogHeader>
                <div className="flex-col gap-0">
                    <p>1. Para añadir un marcador, pulsa en el botón <strong>"+"</strong>.</p>
                    <p>2. Se habilitará el mapa en modo marcador; es decir, donde pulses, se establecerá la coordenada del marcador.</p>
                    <p>3. Indica el tipo de ayuda que necesitas y añade una descripción.</p>
                    <strong>4. Cuando hayas recibido ayuda, ELIMINA el marcador, porfavor.</strong>
                    <p>Para cualquier cosa, dejo mi email: boraal.dev@gmail.com</p>
                </div>
                <DialogFooter>
                    <Button onClick={close} className="w-full mt-2 bg-blue-500 font-semibold">Entendido</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}