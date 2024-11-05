import { supabase } from '../../route';

export async function PUT(request, { params }) {
  const { id } = await params; // Get the `id` from the URL params
  const { code, ...rest } = await request.json(); // Get the `status` from the request body

  // Validate if id and status are provided
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });
  }

  // Update the `status` field of the specified marker
  const { data, error } = await supabase
    .from('markers')
    .update(rest)
    .eq('id', id)
    .select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data[0]), { status: 200 });
}
