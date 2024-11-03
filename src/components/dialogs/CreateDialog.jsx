import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Icon } from '@iconify/react'
import { Button } from "@/components/ui/button"
import { ASSISTANCE_TYPES, DATE_OPTIONS } from '@/lib/enums'
import { getAddress } from '@/lib/getAdress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { X, Upload, Camera } from "lucide-react"
import parsePhoneNumber from 'libphonenumber-js'

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"

import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { VoiceInput } from '../custom/voice-input'
import { isEmpty } from 'lodash'

const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

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
                        toast.success("Marcador creado correctamente", {
                            description: new Intl.DateTimeFormat('es-ES', DATE_OPTIONS).format(new Date()),
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

    const [image, setImage] = useState(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        const fetchAddress = async () => {
            const addressData = await getAddress(newMarker.latitude, newMarker.longitude);
            setDireccion(addressData);
        };

        fetchAddress();
    }, [newMarker]);

    const handleClose = async () => {
        console.log(newMarker);
        
        if (isEmpty(newMarker?.description) || isEmpty(newMarker?.telf)) {
            toast.error('Añade que necesitas en la ayuda y tu número de telefono', {
                duration: 2000,
                classNames: {
                    toast: 'bg-red-800',
                    title: 'text-red-400 text-md',
                    description: 'text-red-400',
                    icon: 'text-red-400',
                    closeButton: 'bg-lime-400',
                }
            })
            return;
        }

        const phoneNumber = parsePhoneNumber(newMarker?.telf, 'ES')
        if (!phoneNumber || !phoneNumber?.isValid()) {
            toast.error('El teléfono no es válido. Compruébalo', {
                duration: 2000,
                classNames: {
                    toast: 'bg-red-800',
                    title: 'text-red-400 text-md',
                    description: 'text-red-400',
                    icon: 'text-red-400',
                    closeButton: 'bg-lime-400',
                }
            })
            return;
        }

        newMarker.telf = phoneNumber.number;

        const code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
        setCode(code.toString())
        setShowCodeDialog(true)
        close(false);

        let base64Image = null;
        if (image) {
            base64Image = await convertToBase64(image);
        }

        handleAddMarker(code.toString(), base64Image)
    }

    const onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.type.startsWith('image/')) {
                setImage(file);
            } else {
                alert('Por favor, selecciona solo archivos de imagen.');
            }
        }
    }

    const removeImage = () => setImage(null);

    const handleDragOver = useCallback((event) => {
        event.preventDefault()
    }, [])

    const handleDrop = useCallback((event) => {
        event.preventDefault()
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
        } else {
            alert('Por favor, arrastra solo archivos de imagen.');
        }
    }, [])

    return (
        <>
            <Dialog open={open} onOpenChange={close}>
                <DialogContent className="max-w-[90%] w-fit min-w-[350px] rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-left">{'Añadir nuevo marcador'}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
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
                            placeholder="612 345 678"
                            required
                            type="tel"
                            pattern="[6|7|8|9]{1}[0-9]{2} [0-9]{3} [0-9]{3}"
                            className="mt-0"
                            value={newMarker.telf}
                            onChange={(e) => setNewMarker({ ...newMarker, telf: e.target.value })}
                        />
                        <VoiceInput
                            className="mt-0"
                            placeholder="Qué necesitas?"
                            value={newMarker.description}
                            setter={setNewMarker}
                            onChange={(e) => setNewMarker({ ...newMarker, description: e.target.value })}
                        />
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {image ? (
                                <div className="relative">
                                    <img src={URL.createObjectURL(image)} alt="Preview" className="max-h-32 mx-auto" />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-0 right-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage();
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                    <p className="mt-1 text-sm">Arrastra y suelta una imagen aquí, o haz clic para seleccionar</p>
                                </>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={onImageChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {direccion.calle ? (
                        <div>
                            <p><strong>Calle:</strong> {direccion.calle}</p>
                            <p><strong>Población:</strong> {direccion.poblacion}</p>
                        </div>
                    ) : (
                        <p>Cargando dirección...</p>
                    )}
                    <DialogFooter>
                        <Button className="w-full mt-0 uppercase text-[12px] font-semibold" onClick={handleClose}>
                            <Icon
                                icon="line-md:circle-twotone-to-confirm-circle-twotone-transition"
                                width="20"
                                height="20"
                            />
                            Añadir Marcador
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <CodeDialog open={showCodeDialog} close={setShowCodeDialog} code={code} />
        </>
    )
}