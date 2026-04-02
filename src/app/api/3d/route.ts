// Import standard Next.js response utilities and the Supabase server client.
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Handle POST requests to initiate 3D model generation tasks.
export async function POST(req: Request) {
    // Initialize Supabase and a flag to track if credits have been deducted.
    const supabase = await createClient();
    let creditsCharged = false;

    // Helper function to refund credits if a task fails after deduction.
    const refundCredits = async (reason: string) => {
      if (!creditsCharged) return;
      const { error } = await supabase.rpc('add_credits', {
        add_amount: 30, // Refund 30 credits for 3D tasks.
        reason,
      });
      if (error) console.error('CREDIT REFUND ERROR:', error);
      else creditsCharged = false;
    };

    try {
        // Authenticate the user before allowing task creation.
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse relevant parameters from the request body (mode, prompt, image, etc.).
        const body = await req.json();
        const { mode, prompt, imageBase64, texture, editType, animationType, originalTaskId } = body;
        
        // Deduct 30 credits for the 3D generation service.
        const { data: success, error: rpcError } = await supabase.rpc('deduct_credits', {
            charge_amount: 30,
            tool_name: '3D Generator',
        });

        // Handle credit deduction errors or insufficient balance.
        if (rpcError) {
            return NextResponse.json({ error: rpcError.message }, { status: 500 });
        }

        if (!success) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
        }
        creditsCharged = true;
        
        // Ensure the Tripo3D API key is available in the environment.
        const apiKey = process.env.TRIPO_API_KEY;
        if (!apiKey) {
            throw new Error("TRIPO_API_KEY is missing from environment variables.");
        }

        let file_token;
        
        // If generating from an image, upload the image first to get a file token.
        if (mode === 'image' && imageBase64) {
            // Convert base64 image data to a Blob for multipart/form-data upload.
            const buffer = Buffer.from(imageBase64, 'base64');
            const blob = new Blob([buffer], { type: 'image/jpeg' });
            
            const formData = new FormData();
            formData.append('file', blob, 'image.jpg');
            
            // Upload to Tripo3D's secure storage.
            const uploadRes = await fetch('https://api.tripo3d.ai/v2/openapi/upload/sts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: formData as any
            });
            
            if (!uploadRes.ok) {
                const text = await uploadRes.text();
                throw new Error('Failed to upload image: ' + text);
            }
            
            // Store the returned image token for the subsequent task creation.
            const uploadData = await uploadRes.json();
            file_token = uploadData.data.image_token;
        }

        let payload: any;

        // Determine the type of task: Conversion, Animation, or New Generation.
        if (editType && originalTaskId) {
            // Task: Convert an existing model into a different format (e.g., FBX, GLB).
            payload = {
                type: 'convert_model',
                original_model_task_id: originalTaskId,
                format: editType === 'quad' ? 'FBX' : editType.toUpperCase(),
                quad: editType === 'quad'
            };
        } else if (animationType && originalTaskId) {
            // Task: Apply an animation preset to an existing model.
            payload = {
                type: 'animate',
                original_model_task_id: originalTaskId,
                out_format: 'glb',
                animation: animationType.startsWith('preset:') ? animationType : `preset:${animationType}`
            };
        } else {
            // Task: Create a new 3D model from text or an image.
            payload = {
                type: mode === 'image' ? 'image_to_model' : 'text_to_model',
            };

            if (mode === 'image') {
                payload.file = {
                    type: 'jpg',
                    file_token: file_token,
                };
                if (texture !== undefined) payload.texture = !!texture;
            } else {
                payload.prompt = prompt;
                if (texture !== undefined) payload.texture = !!texture;
            }
        }

        // Send the final task payload to the Tripo3D API.
        const taskRes = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!taskRes.ok) {
            const text = await taskRes.text();
            throw new Error('Failed to create task: ' + text);
        }

        const taskData = await taskRes.json();
        
        // Validate API success code.
        if (taskData.code !== 0) {
           throw new Error('API Error: ' + taskData.message);
        }
        
        // Return the task ID to the frontend for status polling.
        return NextResponse.json({ taskId: taskData.data.task_id });

    } catch (error: any) {
        // Automatically refund credits if the external API call fails.
        await refundCredits('3D task creation failed');
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Handle GET requests to check the status or result of a 3D generation task.
export async function GET(req: Request) {
    // Extract the taskId from the query parameters.
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
        return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
    }

    try {
        const apiKey = process.env.TRIPO_API_KEY;
        if (!apiKey) {
            throw new Error("TRIPO_API_KEY is missing from environment variables.");
        }

        // Poll the Tripo3D API for the current task status.
        const res = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!res.ok) {
             const text = await res.text();
             throw new Error('Failed to fetch status: ' + text);
        }

        // Return the full task status and data to the frontend.
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
         return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

