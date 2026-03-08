import { createClient } from '@/utils/supabase/server'
import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient()

        if (!process.env.REPLICATE_API_TOKEN) {
            return NextResponse.json(
                { error: "REPLICATE_API_TOKEN is not set" },
                { status: 500 }
            );
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Deduct credits like the old API
        const { data: success, error: rpcError } = await supabase.rpc('deduct_credits', {
            charge_amount: 10,
            tool_name: 'Image Generator'
        })

        if (rpcError) {
            return NextResponse.json({ error: rpcError.message }, { status: 500 });
        }
        if (!success) {
            return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
        }

        const { prompt, aiModel, resolution, aspectRatio, negativePrompt, mode, ...rest } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // Use the working model from the old design
        const modelId = "google/imagen-4";
        let input: any = { prompt };

        // Basic mapping based on frontend values
        if (mode === "image" || mode === "avatar") {
            let finalPrompt = prompt;
            const styleModifiers = [];
            if (rest.style && rest.style !== "professional") styleModifiers.push(`${rest.style} style`);
            if (rest.backgroundColor && rest.backgroundColor !== "transparent") styleModifiers.push(`${rest.backgroundColor} background`);
            if (rest.lighting && rest.lighting !== "studio") styleModifiers.push(`${rest.lighting} lighting`);
            if (rest.pose && mode === "image") styleModifiers.push(`${rest.pose} pose`);

            if (styleModifiers.length > 0) {
                finalPrompt = `${prompt}, ${styleModifiers.join(', ')}`;
            }

            // Map to supported aspect ratios for google/imagen-4: "1:1", "9:16", "16:9", "3:4", "4:3"
            let mappedRatio = "1:1";
            if (aspectRatio === "16:9") mappedRatio = "16:9";
            else if (aspectRatio === "9:16") mappedRatio = "9:16";
            else if (aspectRatio === "4:3" || aspectRatio === "4:5") mappedRatio = "3:4"; // 4:5 is not supported, using 3:4
            else if (aspectRatio === "3:4") mappedRatio = "3:4";

            input = {
                prompt: finalPrompt,
                negative_prompt: negativePrompt || "blurry, poor quality",
                aspect_ratio: mappedRatio
            };
        } else {
            return NextResponse.json(
                { error: "Unsupported generation mode" },
                { status: 400 }
            );
        }

        const output = await replicate.run(modelId as `${string}/${string}` | `${string}/${string}:${string}`, { input }) as any;

        // Most Replicate image models return an array of URLs or a FileOutputStream-like object
        const firstOutput = Array.isArray(output) ? output[0] : output;

        if (!firstOutput) {
            throw new Error("No image generated");
        }

        let base64: string;
        if (typeof firstOutput === 'string') {
            const imageRes = await fetch(firstOutput);
            if (!imageRes.ok) throw new Error("Failed to fetch generated image");
            base64 = Buffer.from(await imageRes.arrayBuffer()).toString('base64');
        } else if (typeof firstOutput === 'object' && firstOutput !== null) {
            // Handle file-like output (Replicate SDK 1.x)
            const fileOutput = firstOutput as any;
            if (typeof fileOutput.blob === 'function') {
                const blob = await fileOutput.blob();
                const arrayBuffer = await blob.arrayBuffer();
                base64 = Buffer.from(arrayBuffer).toString('base64');
            } else if (typeof fileOutput.arrayBuffer === 'function') {
                const arrayBuffer = await fileOutput.arrayBuffer();
                base64 = Buffer.from(arrayBuffer).toString('base64');
            } else if (typeof fileOutput.url === 'function') {
                const imageRes = await fetch(fileOutput.url());
                base64 = Buffer.from(await imageRes.arrayBuffer()).toString('base64');
            } else {
                throw new Error("Unsupported output type from model");
            }
        } else {
            throw new Error("Unexpected output format from model");
        }

        return NextResponse.json({ url: `data:image/png;base64,${base64}` });
    } catch (error: any) {
        console.error("Error generating with Replicate:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to generate image" },
            { status: 500 }
        );
    }
}
