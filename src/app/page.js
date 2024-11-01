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

// Coordenadas iniciales para Valencia
const INITIAL_VIEW_STATE = {
    longitude: -0.3763,
    latitude: 39.4699,
    zoom: 12,
    pitch: 0,
    bearing: 0
}

const ASSISTANCE_TYPES = {
    WATER: { color: [0, 0, 255], label: 'Agua', iconMap: 'https://api.iconify.design/mdi/water.svg', icon: 'mdi:water' },
    FOOD: { color: [0, 255, 0], label: 'Comida', iconMap: 'https://api.iconify.design/mdi/food.svg', icon: 'mdi:food' },
    MEDICAL: { color: [255, 0, 0], label: 'Asistencia Médica', iconMap: 'https://api.iconify.design/mdi/medical-bag.svg', icon: 'mdi:medical-bag' },
    OTHER: { color: [165, 3, 252], label: 'Otros', iconMap: 'https://api.iconify.design/bxs/shopping-bags.svg', icon: 'bxs:shopping-bags' }

}


export default function Home() {
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)
    const [markers, setMarkers] = useState([])
    const [newMarker, setNewMarker] = useState({ type: 'WATER', description: '', longitude: 0, latitude: 0 })
    const [selectedMarker, setSelectedMarker] = useState(null)
    const [isModalOpen, setModalOpen] = useState(false)
    const [isSelectingLocation, setIsSelectingLocation] = useState(false)

    const getGoogleMapsUrl = () => {
      return `https://www.google.com/maps?q=${selectedMarker.latitude},${selectedMarker.longitude}`;
  }

    useEffect(() => {
        // Cargar marcadores al montar el componente
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
                    setModalOpen(true); // Abre el modal con la información del marcador
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
                    setModalOpen(true); // Abre el modal con la información del marcador
                }
            }
        })
    ]

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
                initialViewState={viewState}
                controller={true}
                layers={layers}
                onClick={handleMapClick}
                getCursor={() => (isSelectingLocation ? 'crosshair' : 'grab')}
            >
                <ReactMap
                    mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=3l2Dsb6tXQ0t2OzWLivd"
                    onClick={handleMapClick}
                    
                />
            </DeckGL>

            <div className="absolute top-0 left-0 bg-white p-4 m-4 rounded shadow">
                <h2 className="text-lg font-bold mb-2">Añadir punto de asistencia</h2>
                <Button className="mt-2 w-full" onClick={() => setIsSelectingLocation(true)}>
                    Seleccionar ubicación y añadir marcador
                </Button>

                <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedMarker ? 'Información del Marcador' : 'Añadir nuevo marcador'}</DialogTitle>
                        </DialogHeader>
                        {selectedMarker ? (
                            <div>
                                <p className="flex"><strong>Tipo:</strong>
                                    <Icon
                                        icon={ASSISTANCE_TYPES[selectedMarker.type].icon}
                                        width="20"
                                        height="20"
                                    />
                                </p>
                                <p className="text-xl"><strong>Descripción:</strong> {selectedMarker.description}</p>
                                <div className="flex gap-2">
                                    <p><strong>Longitud:</strong> {selectedMarker.longitude.toFixed(4)}</p>
                                    <p><strong>Latitud:</strong> {selectedMarker.latitude.toFixed(4)}</p>
                                </div>
                                <Button onClick={handleDeleteMarker} variant="destructive" className="w-full mt-2">Eliminar Marcador</Button> {/* Botón para eliminar el marcador */}
                                <Button onClick={() => window.open(getGoogleMapsUrl(), '_blank')} className="w-full mt-2">Abrir en Google Maps</Button> {/* Botón para abrir en Google Maps */}
                            </div>
                        ) : (
                            <>
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
                                    className="mt-2"
                                    placeholder="Descripción"
                                    value={newMarker.description}
                                    onChange={(e) => setNewMarker({ ...newMarker, description: e.target.value })}
                                />
                                <DialogFooter>
                                    <Button className="w-full mt-2" onClick={handleAddMarker}>
                                        Confirmar y añadir marcador
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
            <div className="absolute bottom-0 right-0 bg-white p-4 m-4 rounded shadow">
                <h3 className="font-bold mb-2">Leyenda</h3>
                {Object.entries(ASSISTANCE_TYPES).map(([key, value]) => (
                    <div key={key} className="flex items-center mb-1">
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
                        <span className="font-bold">{value.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
