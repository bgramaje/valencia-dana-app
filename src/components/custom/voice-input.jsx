import React, { useState } from 'react';

import { toast } from 'sonner';

import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

import { Textarea } from '../ui/textarea';

export function VoiceInput(props) {
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
      const { transcript } = event.results[0][0];
      setter((prev) => ({ ...prev, description: transcript })); // Escribe el texto transcrito en el input
      setListening(false);
    };

    recognition.onaudiostart = () => toast.info('Capturando voz, hable por favor');
    recognition.onspeechend = () => toast.info('Voz detectada');
    recognition.onend = () => {
      toast.info('Voz detectada');
      setListening(false);
    };

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
      toast.error('Tu navegador no soporta reconocimiento de voz.');
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      <Textarea {...rest} />
      {recognition && (
        <Button
          onClick={handleStartListening}
          className="`ml-2`"
          disabled={listening}
          size="icon"
        >
          <Icon
            icon={listening ? 'svg-spinners:3-dots-bounce' : 'ic:baseline-mic'}
            style={{
              color: 'white', width: 20, height: 20, margin: 0,
            }}
          />
        </Button>
      )}

    </div>
  );
}
