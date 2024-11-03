import React, { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { toast } from "sonner"
import { Textarea } from '../ui/textarea'

export const VoiceInput = (props) => {
    const { setter, ...rest } = props;

    const [listening, setListening] = useState(false);

    // Verifica que el navegador soporte SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        // Configuración del reconocimiento de voz
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-ES'; // Configura el idioma, por ejemplo, español
        recognition.maxAlternatives = 1;

        // Evento que se activa cuando el reconocimiento detecta resultados
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log(transcript);

            setter((prev) => ({ ...prev, description: transcript })); // Escribe el texto transcrito en el input
            setListening(false);
        };

        recognition.onaudiostart = () => console.log('Audio capturing started');
        recognition.onsoundstart = () => console.log('Sound detected');
        recognition.onspeechstart = () => console.log('Speech detected');
        recognition.onspeechend = () => console.log('Speech ended');
        recognition.onsoundend = () => console.log('Sound ended');
        recognition.onend = () => {
            console.log('Recognition ended');
            setListening(false)
        }
        recognition.onnomatch = () => console.log('No match found');

        recognition.onerror = (event) => {
            if (event.error === 'network') {
                toast('Error de red: verifica tu conexión a Internet.');
            } else if (event.error === 'not-allowed') {
                toast('Permiso denegado: permite el acceso al micrófono.');
            } else {
                toast(`Error en el reconocimiento de voz: ${event.error}`);
            }
            setListening(false);
        };
    }

    const handleStartListening = () => {
        if (recognition) {
            setListening(true);
            recognition.start();
        } else {
            alert('Tu navegador no soporta reconocimiento de voz.');
        }
    };

    return (
        <div className="relative flex items-center gap-2">
            <Textarea
                {...rest}
            />
            {recognition && (
                <Button
                    onClick={handleStartListening}
                    className="`ml-2`"
                    disabled={listening}
                    size="icon"
                >
                    <Icon
                        icon="ic:baseline-mic"
                        style={{ color: 'white', width: 20, height: 20, margin: 0 }} // Color blanco para los iconos
                    />
                </Button>
            )}

        </div>
    );
}
