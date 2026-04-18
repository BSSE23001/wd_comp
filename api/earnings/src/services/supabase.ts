import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadScreenshot = async (
  fileBuffer: Buffer,
  filename: string,
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from("screenshots")
    .upload(`gigs/${Date.now()}-${filename}`, fileBuffer, {
      contentType: "image/jpeg",
    });

  if (error) throw new Error(error.message);

  const { data: publicUrlData } = supabase.storage
    .from("screenshots")
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
};
