import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    const supabase = await createClient();
    let creditsCharged = false;

    const refundCredits = async (reason: string) => {
      if (!creditsCharged) return;
      const { error } = await supabase.rpc('add_credits', {
        add_amount: 30, // 30 credits for 3D
        reason,
      });
      if (error) console.error('CREDIT REFUND ERROR:', error);
      else creditsCharged = false;
    };

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { mode, prompt, imageBase64, texture, editType, animationType, originalTaskId } = body;
        
        // Deduct 30 credits
        const { data: success, error: rpcError } = await supabase.rpc('deduct_credits', {
            charge_amount: 30,
            tool_name: '3D Generator',
        });

        if (rpcError) {
            return NextResponse.json({ error: rpcError.message }, { status: 500 });
        }

        if (!success) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
        }
        creditsCharged = true;
        
        const apiKey = process.env.TRIPO_API_KEY;
        if (!apiKey) {
            throw new Error("TRIPO_API_KEY is missing from environment variables.");
        }

        let file_token;
        
        if (mode === 'image' && imageBase64) {
            // Upload the image first
            const buffer = Buffer.from(imageBase64, 'base64');
            const blob = new Blob([buffer], { type: 'image/jpeg' });
            
            const formData = new FormData();
            formData.append('file', blob, 'image.jpg');
            
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
            
            const uploadData = await uploadRes.json();
            file_token = uploadData.data.image_token;
        }

        let payload: any;

        if (editType && originalTaskId) {
            // Mesh Editing Task
            payload = {
                type: 'convert_model',
                original_model_task_id: originalTaskId,
                format: editType === 'quad' ? 'FBX' : editType.toUpperCase(),
                quad: editType === 'quad'
            };
        } else if (animationType && originalTaskId) {
            // Animation Task
            payload = {
                type: 'animate',
                original_model_task_id: originalTaskId,
                out_format: 'glb',
                animation: animationType.startsWith('preset:') ? animationType : `preset:${animationType}`
            };
        } else {
            // New Generation Task
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
        
        if (taskData.code !== 0) {
           throw new Error('API Error: ' + taskData.message);
        }
        
        return NextResponse.json({ taskId: taskData.data.task_id });

    } catch (error: any) {
        await refundCredits('3D task creation failed');
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
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

        const res = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!res.ok) {
             const text = await res.text();
             throw new Error('Failed to fetch status: ' + text);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
         return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
