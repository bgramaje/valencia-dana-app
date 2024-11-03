// components/Camera.js

import React, { useEffect, useRef } from 'react';
import { Camera as CameraIcon } from 'lucide-react';

const Camera = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
            } catch (err) {
                console.error("Error accessing the camera: ", err);
            }
        };

        startCamera();

        // Cleanup function to stop the camera when the component is unmounted
        return () => {
            if (videoRef.current) {
                const stream = videoRef.current.srcObject;
                if (stream) {
                    const tracks = stream.getTracks();
                    tracks.forEach(track => track.stop());
                }
            }
        };
    }, []);

    const captureImage = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the video frame to the canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get the image data URL
        const imageDataUrl = canvas.toDataURL('image/png');
        console.log(imageDataUrl); // Use this URL as needed
    };

    return (
        <div>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: 'auto' }} />
            <button onClick={captureImage} style={{ display: 'flex', alignItems: 'center' }}>
                <CameraIcon size={24} style={{ marginRight: '8px' }} />
                Capture Image
            </button>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default Camera;
