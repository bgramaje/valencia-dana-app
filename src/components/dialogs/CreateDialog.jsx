import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Icon } from '@iconify/react'
import { Button } from "@/components/ui/button"
import { ASSISTANCE_TYPES } from '@/lib/enums'
import { getAddress } from '@/lib/getAdress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const opciones = {
    weekday: 'long',    // Día de la semana completo (ej. "domingo")
    day: '2-digit',     // Día en formato de dos dígitos
    month: 'long',      // Mes en texto completo (ej. "diciembre")
    year: 'numeric',    // Año con cuatro dígitos
    hour: 'numeric',    // Hora en formato de 12 o 24 horas según configuración
    minute: '2-digit',  // Minutos en formato de dos dígitos
    hour12: true        // Formato de 12 horas con "AM" y "PM"
  };

const CodeDialog = ({ open, close, code }) => {
    const [copied, setCopied] = useState(false)

    const copyCode = () => {
        navigator.clipboard.writeText(code)
            .then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 4000)  // Hide the message after 2 seconds
            })
            .catch(err => console.error("Error copying code: ", err))
    }

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl">
                <DialogHeader>
                    <DialogTitle>{'Código'}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-0 justify-center items-center">
                    <Alert>
                        <AlertTitle>Se ha añadido tu marcador!</AlertTitle>
                        <AlertDescription>
                            <p className="text-[13px] max-w-[260px] text-left mb-2">Guarda el siguiente código generado para poder borrar el marcador generado</p>
                            <div className="w-full flex items-start justify-start gap-2">
                                <InputOTP
                                    maxLength={6}
                                    value={code}
                                    disabled
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
                                <Button size="icon" variant="outline" className="mt-0 m-0 p-0" onClick={copyCode}>
                                    <Icon
                                        icon="mingcute:copy-fill"
                                        style={{ color: 'black', width: 20, height: 20, margin: 0 }} // Color blanco para los iconos
                                    />
                                </Button>
                            </div>

                            {copied && (
                                <p className="text-green-500 text-xs mt-1 font-semibold">Código copiado con éxito!</p>
                            )}
                        </AlertDescription>
                    </Alert>
                </div>
                <DialogFooter>
                    <Button className="w-full mt-0" onClick={() => {
                        close(false)
                        toast.success("Alerta creada correctamente", {
                            description: new Intl.DateTimeFormat('es-ES', opciones).format(new Date()),
                            duration: 2000,
                        })
                    }}>
                        Aceptar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export const CreateDialog = ({ open, close, newMarker, handleAddMarker, setNewMarker }) => {
    const [showCodeDialog, setShowCodeDialog] = useState(false);
    const [code, setCode] = useState(null)
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

    const handleClose = () => {
        const code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
        setCode(code.toString())
        setShowCodeDialog(true)
        close(false);
        handleAddMarker(code.toString())
    }

    return (
        <>
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
                        <Button className="w-full mt-0" onClick={handleClose}>
                            Confirmar y añadir marcador
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <CodeDialog open={showCodeDialog} close={setShowCodeDialog} code={code} />
        </>

    )
}