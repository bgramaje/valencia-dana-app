import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Icon } from '@iconify/react'
import { Button } from "@/components/ui/button"
import { ASSISTANCE_TYPES, DATE_OPTIONS } from '@/lib/enums'
import { getAddress } from '@/lib/getAdress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { X, Upload, Camera } from "lucide-react"

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"

import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { VoiceInput } from '../input/voice-input'

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
    const [isMobile, setIsMobile] = useState(false)
    const fileInputRef = useRef(null)
    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    useEffect(() => {
        const fetchAddress = async () => {
            const addressData = await getAddress(newMarker.latitude, newMarker.longitude);
            setDireccion(addressData);
        };

        fetchAddress();
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }, [newMarker]);

    const handleClose = async () => {
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

    const removeImage = () => {
        setImage(null);
    }

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

    const activateCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        } catch (err) {
            console.error("Error accessing the camera: ", err);
        }
    }

    const capturePhoto = () => {
        const context = canvasRef.current.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, 300, 150);
        const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');

        // Convert data URL to File object
        fetch(imageDataUrl)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "camera_photo.jpg", { type: "image/jpeg" });
                setImage(file);
            });

        // Stop the video stream
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }

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
                        {isMobile && (
                            <div className="mt-2">
                                <Button onClick={activateCamera} className="w-full">
                                    <Camera className="mr-2 h-4 w-4" /> Usar cámara
                                </Button>
                                <video ref={videoRef} className="mt-2 w-full hidden" />
                                <canvas ref={canvasRef} className="hidden" width="300" height="150" />
                                {videoRef.current && videoRef.current.srcObject && (
                                    <Button onClick={capturePhoto} className="w-full mt-2">
                                        Capturar foto
                                    </Button>
                                )}
                            </div>
                        )}
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