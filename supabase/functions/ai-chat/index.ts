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
      const error = await response.text();
      console.error("[AI Chat] Claude API error:", error);
      throw new Error(`Claude API error: ${response.status}`);
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
    return new Response(
      JSON.stringify({ error: error.message }),
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
    return `You are a world-class designer. Generate React + Tailwind code.

OUTPUT FORMAT - Return ONLY a code block:
\`\`\`tsx
export default function Component() {
  return (
    // Your JSX here with Tailwind classes
  );
}
\`\`\`

RULES:
1. Use Tailwind CSS - NO inline styles
2. Create beautiful, production-ready UI
3. Content must match the user's topic and language
4. NO generic text like "Welcome", "Get Started", "Lorem ipsum"

Generate a complete, beautiful React component.`;
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
