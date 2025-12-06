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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Different system prompts based on mode
    const systemPrompts: Record<string, string> = {
      mentor: `You are an expert tech mentor on FutoraOne, a social platform for tech enthusiasts. You help users with:
- Code debugging and optimization
- Learning new technologies
- Project ideas based on their skills
- Career advice in tech
- Best practices and design patterns

Be friendly, encouraging, and provide practical examples. Use emojis sparingly. Keep responses concise but helpful. When showing code, use proper formatting.`,

      enhance: `You are an AI content enhancer for FutoraOne. Your job is to:
- Improve post descriptions for clarity and engagement
- Suggest relevant hashtags for tech posts
- Format code snippets properly
- Suggest improvements while keeping the original message

Return a JSON object with: { "enhanced_content": "...", "hashtags": ["...", "..."], "suggestions": "..." }`,

      ideas: `You are a creative project idea generator for tech enthusiasts. Based on user skills and interests, generate innovative project ideas with:
- Clear project title
- Brief description
- Tech stack suggestions
- Difficulty level
- Unique features that make it stand out

Return as JSON: { "title": "...", "description": "...", "tech_stack": ["..."], "difficulty": "...", "features": ["..."] }`
    };

    const systemPrompt = systemPrompts[mode] || systemPrompts.mentor;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI mentor error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
