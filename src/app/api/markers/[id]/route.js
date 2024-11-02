// Add a new marker to Supabase

import { supabase } from "../route";

export async function POST(request, { params }) {
    const { id } =  await params; // Get the `id` from the URL params
    const { status } = await request.json(); // Get the `status` from the request body
  
    // Validate if id and status are provided
    if (!id || !status) {
      return new Response(JSON.stringify({ error: 'ID and status are required' }), { status: 400 });
    }
  
    // Update the `status` field of the specified marker
    const { data, error } = await supabase
      .from('markers')
      .update({ status })
      .eq('id', id)
      .select();
  
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  
    return new Response(JSON.stringify(data[0]), { status: 200 });
  }