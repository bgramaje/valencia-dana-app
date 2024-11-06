import { createClient } from '@supabase/supabase-js';
import { isEqual } from 'lodash';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const markersTable = process.env.SUPABASE_MARKERS_TABLE;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Get markers from Supabase
// eslint-disable-next-line no-unused-vars
export async function GET(request) {
  const { data: markers, error } = await supabase
    .from(markersTable)
    .select('id, type, longitude, latitude, status');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(markers), { status: 200 });
}

// Add a new marker to Supabase
export async function POST(request) {
  const newMarker = await request.json();
  const { data, error } = await supabase
    .from(markersTable)
    .insert([newMarker])
    .select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
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
