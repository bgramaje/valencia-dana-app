import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get markers from Supabase
export async function GET(request) {
    const { data: markers, error } = await supabase
        .from('markers')
        .select('*');

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(markers), { status: 200 });
}

// Add a new marker to Supabase
export async function POST(request) {
    const newMarker = await request.json();
    
    const { data, error } = await supabase
        .from('markers')
        .insert([newMarker])
        .select()

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    console.log(data);
    
    return new Response(JSON.stringify(data[0]), { status: 201 });
}

// Delete a marker from Supabase
export async function DELETE(request) {
    const { id } = await request.json();
    
    const { error } = await supabase
        .from('markers')
        .delete()
        .eq('id', id);

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Marker deleted' }), { status: 200 });
}
