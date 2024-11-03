export async function getAddress(lat, lon) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
    );

    if (!response.ok) {
      throw new Error('Error fetching address');
    }
    const data = await response.json();

    const {
      road, city, town, village, house_number: houseNumber,
    } = data?.address ?? {
      road: '', city: '', town: '', village: '',
    };
    const calle = `${road ?? ''}, ${houseNumber ?? ''}` || 'Calle no disponible';
    const poblacion = city || town || village || 'Población no disponible';
    const direccionCompleta = data.display_name;

    return { calle, poblacion, direccionCompleta };
  } catch (error) {
    return { calle: null, poblacion: null, direccionCompleta: null };
  }
}

export const getGoogleMapsUrl = (marker) => `https://www.google.com/maps?q=${marker.latitude},${marker.longitude}`;
