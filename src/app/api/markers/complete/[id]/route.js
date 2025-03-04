import { checkCode } from '@/lib/api/code';
import { markersTable, supabase, townsTable } from '../../route';

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
    .select('*, location(*)')
    .eq('id', id) // Reemplaza "id" con el valor del ID que buscas
    .single(); // .single() devuelve un solo objeto en lugar de un array

  if (errorSelect) {
    return new Response(JSON.stringify({ error: errorSelect.message }), { status: 500 });
  }

  if (!checkCode(code, marker)) {
    return new Response(JSON.stringify({ message: 'El código no es correcto' }), { status: 403 });
  }

  // Update the `status` field of the specified marker
  const { data, error } = await supabase
    .from(markersTable)
    .update({ status: rest.status })
    .eq('id', id)
    .select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const { error: updateError } = await supabase.rpc('increment_column', {
    table_name: townsTable,
    column_name: 'total_helpers_markers',
    increment_value: -1,
    id_column_name: 'name', // La columna usada como identificador
    id_value: marker.location.name, // El valor del identificador (en este caso, el valor de location)
  });

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data[0]), { status: 200 });
}
