'use client'

import React, { useState, useEffect } from 'react'
import { Map as ReactMap } from 'react-map-gl/maplibre'
import { DeckGL } from '@deck.gl/react'
import { IconLayer, ScatterplotLayer } from '@deck.gl/layers'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'
import { WarningDialog } from '@/components/dialogs/WarningDialog'
import { InfoDialog } from '@/components/dialogs/InfoDialog'
import { ASSISTANCE_TYPES, INITIAL_VIEW_STATE } from '@/lib/enums'
import { getGoogleMapsUrl } from '@/lib/getAdress'
import { CreateDialog } from '@/components/dialogs/CreateDialog'
import { InfoMarkerDialog } from '@/components/dialogs/InfoMarkerDialog'

export default function Home() {
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)
    const [markers, setMarkers] = useState([])
    const [newMarker, setNewMarker] = useState({ type: 'WATER', description: '', longitude: 0, latitude: 0 })
    const [selectedMarker, setSelectedMarker] = useState(null)
    const [isModalOpen, setModalOpen] = useState(false)
    const [isSelectingLocation, setIsSelectingLocation] = useState(false)
    const [isWarningModalOpen, setWarningModalOpen] = useState(true)
    const [isInfoOpen, setIsInfoOpen] = useState(false)
    const [userLocation, setUserLocation] = useState(null)

    useEffect(() => {
        // Obtiene la ubicación actual
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                setViewState({
                    ...viewState,
                    latitude,
                    longitude,
                    zoom: 13, // Ajusta el nivel de zoom inicial
                });
                setUserLocation({ latitude, longitude });
            },
            error => console.error('Error getting location:', error),
            { enableHighAccuracy: true }
        );
    }, []);

    useEffect(() => {
        const warningModalState = localStorage.getItem('warningModalClosed');
        setWarningModalOpen(warningModalState !== 'true');
    }, []);

    const closeWarningModal = () => {
        setWarningModalOpen(false);
        localStorage.setItem('warningModalClosed', 'true');
    };

    useEffect(() => {
        if (!isModalOpen) setSelectedMarker(null);
    }, [isModalOpen]);

    useEffect(() => {
        fetch('/api/markers')
            .then(response => response.json())
            .then(data => {
                setMarkers(data);
            })
            .catch(error => console.error('Error loading markers:', error));
    }, []);

    const layers = [
        new IconLayer({
            id: 'icon-layer',
            data: markers,
            pickable: true,
            getIcon: d => ({
                url: ASSISTANCE_TYPES[d.type].iconMap,
                width: 20,
                height: 20,
            }),
            getPosition: d => [d.longitude, d.latitude],
            getColor: d => ASSISTANCE_TYPES[d.type].color,
            sizeScale: 1,
            parameters: { depthTest: false },
            getAngle: 0,
            getSize: 20,
            onClick: ({ object }) => {
                if (object) {
                    setSelectedMarker(object);
                    setModalOpen(true);
                }
            }
        }),
        new ScatterplotLayer({
            id: 'scatter-plot',
            data: markers,
            pickable: true,
            opacity: 0.2,
            filled: true,
            radiusScale: 4,
            radiusMinPixels: 20,
            radiusMaxPixels: 20,
            getPosition: d => [d.longitude, d.latitude],
            getRadius: d => 5,
            getFillColor: d => ASSISTANCE_TYPES[d.type].color,
            onClick: ({ object }) => {
                if (object) {
                    setSelectedMarker(object);
                    setModalOpen(true);
                }
            }
        }),
        userLocation && new ScatterplotLayer({
            id: 'user-location-layer',
            data: [userLocation],
            getPosition: d => [d.longitude, d.latitude],
            getFillColor: [0, 0, 255],
            getRadius: 100,
            pickable: false
        })
    ].filter(Boolean);

    const handleMapClick = (event) => {
        if (isSelectingLocation && event.coordinate) {
            setNewMarker({
                ...newMarker,
                longitude: event.coordinate[0],
                latitude: event.coordinate[1],
            })
            setIsSelectingLocation(false)
            setModalOpen(true)
        }
    }

    const handleAddMarker = () => {
        setNewMarker({ id: Date.now(), ...newMarker })

        fetch('/api/markers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newMarker),
        })
            .then(response => response.json())
            .then(data => {
                setMarkers(prevMarkers => [...prevMarkers, data]); // Actualiza los marcadores en el estado
                setNewMarker({ type: 'WATER', description: '', longitude: 0, latitude: 0 }); // Reinicia el nuevo marcador
                setModalOpen(false);
            })
            .catch(error => console.error('Error adding marker:', error));
    }

    const handleDeleteMarker = () => {
        fetch('/api/markers', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: selectedMarker.id }), // Envía el índice o ID
        })
            .then(response => response.json())
            .then(data => {
                console.log('Marker deleted:', data);
                // Actualiza la lista de marcadores
                const updatedMarkers = markers.filter(marker => marker !== selectedMarker);
                setMarkers(updatedMarkers);
                setModalOpen(false);
                setSelectedMarker(null);
            })
            .catch(error => console.error('Error deleting marker:', error));
    };

    return (
        <div className="relative w-full h-dvh">
            <DeckGL
                height="100dvh"
                initialViewState={viewState}
                controller={true}
                layers={layers}
                onClick={handleMapClick}
                getCursor={() => (isSelectingLocation ? 'crosshair' : 'grab')}
            >
                <ReactMap
                    attributionControl={false}
                    reuseMaps
                    mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=3l2Dsb6tXQ0t2OzWLivd"
                    onClick={handleMapClick}
                />
            </DeckGL>

            <div className="flex absolute top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center gap-4">
                <div className="bg-white p-2 py-2 m-0 rounded-xl shadow flex gap-1 flex-wrap justify-between">
                    <span className="font-semibold text-[13px] uppercase leading-tight text-blue-500 text-center font-bold">Total Marcadores: {markers.length}</span>
                </div>
            </div>

            {isSelectingLocation && (
                <div className="flex absolute top-[90px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center gap-4">
                    <div className="bg-white p-2 py-2 m-0 rounded-xl shadow flex gap-1 flex-wrap justify-between">
                        <span className="font-semibold text-[13px] uppercase leading-tight text-red-500 animate-pulse text-center">Añadiendo marcador: Seleccione coordenada</span>
                    </div>
                </div>
            )}

            {/* Modal de advertencia que aparece por defecto */}
            <WarningDialog
                isWarningModalOpen={isWarningModalOpen}
                closeWarningModal={closeWarningModal}
            />

            {selectedMarker
                ? <InfoMarkerDialog
                    open={isModalOpen}
                    close={setModalOpen}
                    selectedMarker={selectedMarker}
                    handleDeleteMarker={handleDeleteMarker}
                />
                : <CreateDialog
                    open={isModalOpen}
                    close={setModalOpen}
                    newMarker={newMarker}
                    handleAddMarker={handleAddMarker}
                    setNewMarker={setNewMarker}
                />
            }

            <div className="flex absolute bottom-0 left-1/2 transform -translate-x-1/2 items-center gap-1 flex-col-reverse md:flex-row -translate-y-4 md:-translate-y-1/2 ">
                <div className="bg-white p-2 py-2 m-0 rounded-xl shadow flex gap-1 flex-wrap justify-between">
                    {Object.entries(ASSISTANCE_TYPES).map(([key, value]) => (
                        <div key={key} className="flex items-center mb-0">
                            <div
                                className="w-8 h-8 mr-2 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `rgb(${value.color.join(',')})` }}
                            >
                                <Icon
                                    icon={value.icon}
                                    width="20"
                                    height="20"
                                    style={{ color: 'white' }} // Color blanco para los iconos
                                />
                            </div>
                            <span className="font-semibold w-[100px] text-[13px] uppercase leading-tight">{value.label}</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className={`min-w-[60px] h-[60px] rounded-xl ${isSelectingLocation && 'animate-pulse bg-red-400'}`} onClick={() => setIsSelectingLocation(true)}>
                        <Icon
                            icon="lets-icons:add-ring"
                            width="40"
                            height="40"
                            className='text-red-300'
                            style={{ color: isSelectingLocation ? 'white' : 'black', width: 40, height: 40 }} // Color blanco para los iconos
                        />
                    </Button>
                    <Button onClick={() => setIsInfoOpen(true)} variant="outline" size="icon" className={`min-w-[60px] h-[60px] rounded-xl`}>
                        <Icon
                            icon="ph:info-bold"
                            width="40"
                            height="40"
                            className='text-red-300'
                            style={{ color: 'black', width: 40, height: 40 }} // Color blanco para los iconos
                        />
                    </Button>
                </div>
                <Link href="https://github.com/bgramaje" passHref className="ml-1 hidden lg:block">
                    <Image
                        alt="github"
                        src="https://avatars.githubusercontent.com/u/56760866?s=400&u=85f1f7114a7c9f4afc1c63e3d06d35a7e204ce1a&v=4"
                        width={50}
                        height={50}
                        className="rounded-xl p-1 bg-white hidden md:block"
                    />
                </Link>
            </div>

            {/* Modal de advertencia que aparece por defecto */}
            <InfoDialog
                open={isInfoOpen}
                close={() => setIsInfoOpen(false)}
            />

        </div>
    )
}
