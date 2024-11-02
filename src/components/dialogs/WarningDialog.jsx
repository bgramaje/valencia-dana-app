import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Icon } from '@iconify/react'
import { Button } from "@/components/ui/button"

export const WarningDialog = ({ isWarningModalOpen, closeWarningModal }) => {
    return (
        <Dialog open={isWarningModalOpen} onOpenChange={closeWarningModal}>
            <DialogContent>
                <DialogHeader className="flex-row gap-1 items-center m-0">
                    <Icon
                        icon="ph:seal-warning-duotone"
                        style={{ color: 'red', width: 24, height: 24, marginTop: 4 }} // Color blanco para los iconos
                    />
                    <DialogTitle className="text-red-600 m-0 pt-0 mb-1">Advertencia Importante</DialogTitle>
                </DialogHeader>
                <p className="font-semibold">
                    Los voluntarios que se dirijan a las zonas afectadas deben llevar mascarillas y guantes, ya que el agua ha estado en contacto con cuerpos sin vida y posiblemente químicos. ¡Por favor, tomen precauciones!
                </p>
                <DialogFooter>
                    <Button onClick={closeWarningModal} className="w-full mt-2" variant="destructive">Entendido</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}