// Supabase Edge Function: AI Chat
// Handles both Design mode (JSON canvas elements) and Code mode (React code)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  message: string;
  systemPrompt?: string;
  mode?: "design" | "code";
  model?: string; // Claude model ID (e.g., claude-sonnet-4-5-20250929)
  history?: ChatMessage[];
  projectContext?: string;
}

// Valid Claude model IDs
const VALID_MODELS = [
  "claude-sonnet-4-5-20250929",
  "claude-haiku-4-5-20251001",
  "claude-opus-4-5-20251101",
  // Fallback older model
  "claude-sonnet-4-20250514",
];

const DEFAULT_MODEL = "claude-sonnet-4-5-20250929";

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const body: RequestBody = await req.json();
    const { message, systemPrompt, mode = "code", model, history = [], projectContext } = body;

    // Validate and select model
    const selectedModel = model && VALID_MODELS.includes(model) ? model : DEFAULT_MODEL;

    if (!message) {
      throw new Error("Message is required");
    }

    // Build messages array for Claude
    const messages: Array<{ role: string; content: string }> = [];

    // Add history (last 10 messages)
    for (const msg of history.slice(-10)) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current user message
    messages.push({
      role: "user",
      content: message,
    });

    // No prefill - let the system prompt guide the output format
    // Design mode now generates React code, not JSON

    // Use provided systemPrompt or default based on mode
    const finalSystemPrompt = systemPrompt || getDefaultPrompt(mode);

    console.log(`[AI Chat] Mode: ${mode}, Model: ${selectedModel}, Messages: ${messages.length}`);

    // Call Claude API with streaming
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: 8192,
        system: finalSystemPrompt,
        messages: messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI Chat] Claude API error:", response.status, errorText);
      // Return detailed error to client for debugging
      return new Response(
        JSON.stringify({
          error: `Claude API error: ${response.status}`,
          details: errorText,
          model: selectedModel,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Stream the response back to client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);

                  // Handle different event types from Claude
                  if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                    const chunk = `data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`;
                    controller.enqueue(encoder.encode(chunk));
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          console.error("[AI Chat] Stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("[AI Chat] Error:", error);
    console.error("[AI Chat] Error stack:", error.stack);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
        type: error.name
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Default prompts based on mode
function getDefaultPrompt(mode: "design" | "code"): string {
  if (mode === "design") {
    // React/Tailwind design mode - AI generates React components that get parsed to canvas elements
    return `You are a world-class designer creating stunning UI components.

OUTPUT FORMAT: Generate a single React component with Tailwind CSS.
Wrap your code in a \`\`\`tsx code block.

CRITICAL RULES:
1. Use ONLY Tailwind classes - NO inline styles, NO CSS files
2. Use semantic HTML tags (section, header, nav, main, footer, article)
3. Content language must match user's language (Italian = Italian text)
4. Every design MUST be visually stunning and production-ready

TAILWIND PATTERNS YOU MUST USE:

BACKGROUNDS:
- Gradients: bg-gradient-to-br from-violet-600 to-indigo-600
- Dark backgrounds: bg-slate-900, bg-zinc-900, bg-neutral-900
- Glass effect: bg-white/10 backdrop-blur-lg

TYPOGRAPHY:
- Large titles: text-5xl md:text-7xl font-bold tracking-tight
- Subtitles: text-lg md:text-xl text-slate-300
- Gradient text: bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent

LAYOUT:
- Centered: flex flex-col items-center justify-center
- Full height: min-h-screen or min-h-[600px]
- Max width: max-w-4xl mx-auto
- Gaps: gap-4, gap-6, gap-8

BUTTONS:
- Primary: bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-full font-semibold
- Glass: bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20

CARDS:
- Dark cards: bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700
- Shadows: shadow-xl shadow-violet-500/10

EXAMPLE OUTPUT:
\`\`\`tsx
export default function HeroSection() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
          Stunning Design
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Create beautiful interfaces with AI-powered design
        </p>
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg shadow-violet-500/25">
            Get Started
          </button>
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-8 py-4 rounded-full font-semibold border border-white/20 transition-all">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
\`\`\`

DESIGN PRINCIPLES:
1. Visual hierarchy - Important elements are larger and bolder
2. Contrast - Dark backgrounds with light text or vice versa
3. Spacing - Generous padding and gaps (p-8+, gap-6+)
4. Consistency - Same border-radius, color palette throughout
5. Polish - Shadows, gradients, hover states, transitions

Generate the React component now. Match the user's language for all text content.`;
  }

  // Code mode prompt
  return `You are OBJECTS, an expert AI assistant and exceptional senior software developer.

When generating code:
1. Use React + TypeScript + Tailwind CSS
2. Create production-ready, visually stunning code
3. Use modern design patterns and best practices
4. Include all necessary imports
5. Use responsive design (sm:, md:, lg: breakpoints)

Always provide COMPLETE file contents in code blocks with the file path:
\`\`\`tsx
// filepath: src/components/MyComponent.tsx
import React from 'react';

export function MyComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Your component code */}
    </div>
  );
}
\`\`\`

Design principles:
- Use gradients for modern look
- Add hover states and transitions
- Use proper spacing (p-4, gap-6, etc.)
- Create visual hierarchy with typography
- Ensure accessibility`;
}
