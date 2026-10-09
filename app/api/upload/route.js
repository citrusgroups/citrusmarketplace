import { supabase } from "../../../lib/supabase";
import { nanoid } from "nanoid";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return Response.json({ error: "No file provided" }, { status: 400 });
        }

        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${nanoid()}.${ext}`;

        const { error } = await supabase.storage
            .from("products")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }

        const { data } = supabase.storage
            .from("products")
            .getPublicUrl(fileName);

        return Response.json({
            url: data.publicUrl,
        });
    } catch (error) {
        return Response.json(
            { error: error.message || "Upload failed" },
            { status: 500 }
        );
    }
}