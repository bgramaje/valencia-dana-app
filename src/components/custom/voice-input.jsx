import React, { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Icon } from '@iconify/react';

export const VoiceInput = React.forwardRef(({
  placeholder, onChange, value, ...props
}, ref) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Update the parent form value when transcript changes
  useEffect(() => {
    if (transcript !== value) {
      onChange(transcript);
    }
  }, [transcript, value, onChange]);

  const handleListen = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  return (
    <div className="flex gap-1 items-start">
      <Textarea
        ref={ref}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Speak or type here...'}
        rows={4}
        {...props}
      />
      {browserSupportsSpeechRecognition && (
        <Button
          type="button"
          onClick={handleListen}
          variant={listening ? 'destructive' : 'default'}
          className="rounded-lg"
        >
          <Icon
            icon={listening ? 'ic:twotone-mic-off' : 'ic:twotone-mic'}
            width="20"
            height="20"
          />
        </Button>
      )}
    </div>
  );
});

VoiceInput.displayName = 'VoiceInput';
