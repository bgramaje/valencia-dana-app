import { MARKER_STATUS } from '@/lib/enums';
import { createClient } from '@supabase/supabase-js';
import { isEmpty, isEqual } from 'lodash';
// eslint-disable-next-line import/no-extraneous-dependencies
import unidecode from 'unidecode';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const markersTable = process.env.SUPABASE_MARKERS_TABLE;
export const townsTable = process.env.SUPABASE_TOWNS_TABLE;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Get markers from Supabase
// eslint-disable-next-line no-unused-vars
export async function GET(request) {
  const { data: markers, error } = await supabase
    .from(markersTable)
    .select('id, longitude, latitude, status, location, type (*)');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(markers), { status: 200 });
}

// Add a new marker to Supabase
export async function POST(request) {
  const newMarker = await request.json();
  const { location, status } = newMarker;

  if (!location || location === 'Unknown' || location === '') {
    return new Response(JSON.stringify({ message: 'Una localización es necesaria' }), { status: 403 });
  }

  const { data: town, error: errorTown } = await supabase.rpc('get_similar_towns', {
    search_name: unidecode(location).toLowerCase(), // replace with your dynamic variable
  });

  if (errorTown || isEmpty(town)) {
    return new Response(JSON.stringify({ error: 'Location no encontrado en BBDD' }), { status: 500 });
  }

  const { data, error } = await supabase
    .from(markersTable)
    .insert([{ ...newMarker, location: town[0].name }])
    .select('id, longitude, latitude, status, location, type (*)');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (status !== MARKER_STATUS.COMPLETADO) {
    const { error: updateError } = await supabase.rpc('increment_column', {
      table_name: townsTable,
      column_name: 'total_helpers_markers',
      increment_value: 1,
      id_column_name: 'name', // La columna usada como identificador
      id_value: town[0].name, // El valor del identificador (en este caso, el valor de location)
    });

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
    }
  }

  return new Response(JSON.stringify(data[0]), { status: 201 });
}

// Delete a marker from Supabase
export async function DELETE(request) {
  const { id, code } = await request.json();

  // Update the `status` field of the specified marker
  const { data: marker, error: errorSelect } = await supabase
    .from(markersTable)
    .select('id, password')
    .eq('id', id) // Reemplaza "id" con el valor del ID que buscas
    .single(); // .single() devuelve un solo objeto en lugar de un array

  if (errorSelect) {
    return new Response(JSON.stringify({ error: errorSelect.message }), { status: 500 });
  }

  if (!isEqual(code, marker.password)) {
    return new Response(JSON.stringify({ message: 'El código no es correcto' }), { status: 403 });
  }

  const { error } = await supabase
    .from(markersTable)
    .delete()
    .eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: 'Marker deleted' }), { status: 200 });
}
