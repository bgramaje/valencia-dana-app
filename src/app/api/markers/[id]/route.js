// Add a new marker to Supabase

import { isEqual } from 'lodash';
import { markersTable, supabase } from '../route';

export async function GET(request, { params }) {
  const { id } = await params; // Get the `id` from the URL params

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });
  }

  // Update the `status` field of the specified marker
  const { data: marker, error } = await supabase
    .from(markersTable)
    .select(
      'id, created_at, type, telf, description, longitude, latitude, status, img, policy_accepted, data_usage, helper_telf, helper_name',
    )
    .eq('id', id) // Reemplaza "id" con el valor del ID que buscas
    .single(); // .single() devuelve un solo objeto en lugar de un array

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(marker), { status: 200 });
}

export async function PUT(request, { params }) {
  const { id } = await params; // Get the `id` from the URL params
  const { code, ...rest } = await request.json(); // Get the `status` from the request body

  // Validate if id and status are provided
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });
  }

  // Update the `status` field of the specified marker
  const { data: marker, error: errorSelect } = await supabase
    .from(markersTable)
    .select('*')
    .eq('id', id) // Reemplaza "id" con el valor del ID que buscas
    .single(); // .single() devuelve un solo objeto en lugar de un array

  if (errorSelect) {
    return new Response(JSON.stringify({ error: errorSelect.message }), { status: 500 });
  }

  if (!isEqual(code, marker.password)) {
    return new Response(JSON.stringify({ message: 'El código no es correcto' }), { status: 403 });
  }

  // Update the `status` field of the specified marker
  const { data, error } = await supabase
    .from(markersTable)
    .update(rest)
    .eq('id', id)
    .select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data[0]), { status: 200 });
}
