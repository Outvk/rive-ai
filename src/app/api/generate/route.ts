// Import the Supabase server client, Next.js response utilities, and the Replicate SDK.
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from "next/server";
import Replicate from "replicate";

// Initialize the Replicate client using the API token from environment variables.
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

// Handle POST requests to generate images using state-of-the-art AI models.
export async function POST(req: Request) {
    try {
        const supabase = await createClient()

        // Ensure the Replicate API token is configured in the environment.
        if (!process.env.REPLICATE_API_TOKEN) {
            return NextResponse.json(
                { error: "REPLICATE_API_TOKEN is not set" },
                { status: 500 }
            );
        }

        // Authenticate the user before processing the request.
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Use a database function (RPC) to deduct 10 credits for each image generation.
        const { data: success, error: rpcError } = await supabase.rpc('deduct_credits', {
            charge_amount: 10,
            tool_name: 'Image Generator'
        })

        if (rpcError) {
            return NextResponse.json({ error: rpcError.message }, { status: 500 });
        }
        
        // Handle cases where the user doesn't have enough credits.
        if (!success) {
            return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
        }

        // Parse relevant generation parameters from the JSON request body.
        const { prompt, aiModel, resolution, aspectRatio, negativePrompt, mode, ...rest } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }
        
        // Define the high-quality Flux model ID on Replicate.
        let modelId = "black-forest-labs/flux-1.1-pro";
        
        let input: any = { prompt };

        // Logic for standard image or avatar generation mode.
        if (mode === "image" || mode === "avatar") {
            let finalPrompt = prompt;
            const styleModifiers = [];
            
            // Apply optional style modifiers based on user selections (e.g., professional, studio lighting).
            if (rest.style && rest.style !== "professional") styleModifiers.push(`${rest.style} style`);
            if (rest.backgroundColor && rest.backgroundColor !== "transparent") styleModifiers.push(`${rest.backgroundColor} background`);
            if (rest.lighting && rest.lighting !== "studio") styleModifiers.push(`${rest.lighting} lighting`);
            if (rest.pose && rest.pose !== "auto" && mode === "image") styleModifiers.push(`${rest.pose} pose`);

            if (styleModifiers.length > 0) {
                finalPrompt = `${prompt}, ${styleModifiers.join(', ')}`;
            }

            // Map frontend aspect ratio strings to the allowed values for the Flux model.
            let mappedRatio = "1:1";
            if (aspectRatio === "16:9") mappedRatio = "16:9";
            else if (aspectRatio === "9:16") mappedRatio = "9:16";
            else if (aspectRatio === "4:3") mappedRatio = "4:3";
            else if (aspectRatio === "3:4") mappedRatio = "3:4";
            else if (aspectRatio === "4:5") mappedRatio = "4:5";

            // Construct the final payload for the Replicate model.
            input = {
                prompt: finalPrompt,
                aspect_ratio: mappedRatio,
                output_format: "png",
                output_quality: 90
            };
        } else {
            return NextResponse.json(
                { error: "Unsupported generation mode" },
                { status: 400 }
            );
        }

        // Execute the AI prediction on Replicate's cloud infrastructure.
        const output = await replicate.run(modelId as `${string}/${string}`, { input }) as any;

        // Extract the resulting image URL or binary stream from the API output.
        const firstOutput = Array.isArray(output) ? output[0] : output;

        if (!firstOutput) {
            throw new Error("No image generated");
        }

        let base64: string;
        
        // Case handling: If the API returns a direct URL, fetch the image and convert it to Base64.
        if (typeof firstOutput === 'string') {
            const imageRes = await fetch(firstOutput);
            if (!imageRes.ok) throw new Error("Failed to fetch generated image");
            base64 = Buffer.from(await imageRes.arrayBuffer()).toString('base64');
        } 
        // Case handling: If the API returns a file-like object, extract the binary data directly.
        else if (typeof firstOutput === 'object' && firstOutput !== null) {
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

        // Return the final image as a Data URL for immediate display in the frontend.
        return NextResponse.json({ url: `data:image/png;base64,${base64}` });
    } catch (error: any) {
        // Log errors and return a 500 status if the generation pipeline fails.
        console.error("Error generating with Replicate:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to generate image" },
            { status: 500 }
        );
    }
}

