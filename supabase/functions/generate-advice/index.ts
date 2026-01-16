
// Supabase Edge Function: generate-advice
// Purpose: Securely call OpenRouter AI to generate vocational layouts without exposing keys.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// NOTE: Use Deno.env.get("OPENROUTER_API_KEY") and set via `supabase secrets set`.
const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { user_metrics, prompt_template } = await req.json();

        if (!OPENROUTER_API_KEY) {
            throw new Error("Missing OPENROUTER_API_KEY");
        }

        // Construct the actual prompt
        const systemInstruction =
            "You are a Vocational Coach for neurodiverse youth (18+). Be encouraging, concise, professional, and focus on Transferable Job Skills. Do not be childish. Use 'Bạn' (You) and 'Tôi' (Coach).";

        // Context building
        const userContext = `User Metrics (0-100): Visual=${user_metrics.visual}, Logic=${user_metrics.logic}, Memory=${user_metrics.memory}, Speed=${user_metrics.speed}, Focus=${user_metrics.focus}`;
        const fullPrompt = `${prompt_template}\n\nContext:\n${userContext}`;

        // Payload for OpenRouter
        // Using meta-llama/llama-3.3-70b-instruct:free as requested
        const payload = {
            model: "meta-llama/llama-3.3-70b-instruct:free",
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: fullPrompt }
            ],
            temperature: 0.7,
            max_tokens: 800,
        };

        console.log("Calling OpenRouter with payload:", JSON.stringify(payload));

        // Call OpenRouter
        const response = await fetch(OPENROUTER_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://an-career.com",
                "X-Title": "An Neurodiversity Career Passport",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("OpenRouter Error:", err);
            throw new Error(`OpenRouter API Error: ${err}`);
        }

        const data = await response.json();
        const advice = data.choices[0]?.message?.content || "No advice generated.";

        return new Response(JSON.stringify({ advice }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error in generate-advice:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
