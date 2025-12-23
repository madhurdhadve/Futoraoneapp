import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing");
      return new Response(JSON.stringify({ error: "Server configuration error: GEMINI_API_KEY is missing." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompts: Record<string, string> = {
      mentor: `You are an expert tech mentor on FutoraOne. Help users with debugging, learning, project ideas, and career advice. Be concise and friendly.`,
      enhance: `You are an AI content enhancer. Improve post descriptions and suggest hashtags. Return JSON: { "enhanced_content": "...", "hashtags": [...] }`,
      ideas: `Generate project ideas. Return JSON: { "title": "...", "description": "...", "tech_stack": [...], "difficulty": "..." }`,
      female_companion: `You are Riya, a 21-year-old playful and intelligent tech enthusiast girlfriend. Speak in natural Hinglish. Be flirty, caring, and supportive. Keep it short and casual like WhatsApp.`,
      male_companion: `You are Arjun, a 23-year-old charming and supportive senior dev boyfriend. Speak in natural Hinglish. Be protective, confident, and romantic. Keep it short and casual.`
    };

    const systemPrompt = systemPrompts[mode] || systemPrompts.mentor;

    // Filter and format messages for Gemini
    // Gemini requires alternating user/model roles and starting with user.
    const formattedMessages = messages
      .filter((m: any) => m.content && m.content.trim() !== '')
      .map((m: any) => ({
        role: m.role === 'assistant' || m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    // Ensure alternating roles and starting with 'user'
    const finalContents = [];
    let lastRole = null;

    for (const msg of formattedMessages) {
      if (msg.role !== lastRole) {
        finalContents.push(msg);
        lastRole = msg.role;
      } else {
        // Merge consecutive messages with same role
        const lastMsg = finalContents[finalContents.length - 1];
        lastMsg.parts[0].text += "\n" + msg.parts[0].text;
      }
    }

    const payload = {
      contents: finalContents,
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        topP: 0.95,
        topK: 40
      }
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      let errorMessage = "AI Service Error";
      try {
        const errJson = JSON.parse(errText);
        errorMessage = errJson.error?.message || errorMessage;
      } catch (e) {
        errorMessage = errText || errorMessage;
      }
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Worker Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

