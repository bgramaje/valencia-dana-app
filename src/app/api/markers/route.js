import fs from 'fs';
import path from 'path';

const markersFilePath = path.join(process.cwd(), 'data', 'markers.json');

// Leer los marcadores del archivo JSON
const readMarkers = () => {
    if (fs.existsSync(markersFilePath)) {
        const jsonData = fs.readFileSync(markersFilePath);
        return JSON.parse(jsonData);
    }
    return [];
};

// Guardar los marcadores en el archivo JSON
const saveMarkers = (markers) => {
    fs.writeFileSync(markersFilePath, JSON.stringify(markers, null, 2));
};

export async function GET(request) {
    const markers = readMarkers();
    return new Response(JSON.stringify(markers), { status: 200 });
}

export async function POST(request) {
    const newMarker = await request.json();
    const markers = readMarkers();
    markers.push(newMarker);
    saveMarkers(markers);
    return new Response(JSON.stringify(newMarker), { status: 201 });
}

export async function DELETE(request) {
    const { id } = await request.json(); // Asumiendo que envías un ID para eliminar el marcador
    const markers = readMarkers();
    const updatedMarkers = markers.filter((marker, index) => index !== id);
    saveMarkers(updatedMarkers);
    return new Response(JSON.stringify({ message: 'Marker deleted' }), { status: 200 });
}
