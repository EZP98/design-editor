// Supabase Edge Function: AI Image & 3D Generation
// Uses Replicate API for image generation (SDXL, Flux) and 3D (TripoSR)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBody {
  // Common
  type?: "image" | "3d" | "remove-bg" | "upscale";

  // Image generation
  prompt?: string;
  negativePrompt?: string;
  style?: string;
  width?: number;
  height?: number;
  model?: string;

  // 3D generation / Image editing
  imageUrl?: string;
  foregroundRatio?: number;
  mcResolution?: number;

  // Upscale
  scale?: number;
}

// Style presets that modify the prompt
const STYLE_MODIFIERS: Record<string, { prefix: string; suffix: string }> = {
  realistic: {
    prefix: "photorealistic, highly detailed, 8k resolution, ",
    suffix: ", professional photography, sharp focus",
  },
  illustration: {
    prefix: "digital illustration, vibrant colors, artstation trending, ",
    suffix: ", detailed artwork, concept art",
  },
  anime: {
    prefix: "anime style, japanese animation, studio ghibli inspired, ",
    suffix: ", detailed anime art, beautiful anime",
  },
  "3d": {
    prefix: "3d render, octane render, volumetric lighting, ",
    suffix: ", unreal engine 5, highly detailed 3d model",
  },
  watercolor: {
    prefix: "watercolor painting, soft colors, artistic, ",
    suffix: ", traditional media, beautiful watercolor art",
  },
  pixel: {
    prefix: "pixel art, 16-bit style, retro game graphics, ",
    suffix: ", detailed pixel art, nostalgic gaming aesthetic",
  },
  logo: {
    prefix: "minimalist logo design, simple shapes, vector style, ",
    suffix: ", clean design, professional branding, white background",
  },
  pattern: {
    prefix: "seamless pattern, repeating tile, decorative, ",
    suffix: ", tileable texture, surface design",
  },
  // Special 3D text styles
  balloon: {
    prefix: "3D metallic balloon letters, inflated glossy balloon text, ",
    suffix: ", reflective surface, colorful, party decoration style, white background",
  },
  chrome: {
    prefix: "chrome metallic 3D text, mirror finish, reflective metal letters, ",
    suffix: ", shiny chrome effect, studio lighting, white background",
  },
  neon: {
    prefix: "neon sign glowing text, bright neon lights, ",
    suffix: ", glowing effect, dark background, cyberpunk aesthetic",
  },
  gold: {
    prefix: "3D gold metallic text, luxury golden letters, ",
    suffix: ", premium gold finish, elegant, white background",
  },
};

// Helper to poll for prediction completion
async function pollPrediction(predictionId: string, maxAttempts = 30): Promise<any> {
  let attempts = 0;
  let result: any = { status: "starting" };

  while (result.status !== "succeeded" && result.status !== "failed" && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { "Authorization": `Bearer ${REPLICATE_API_KEY}` },
    });

    if (!statusResponse.ok) {
      throw new Error(`Failed to check prediction status: ${statusResponse.status}`);
    }

    result = await statusResponse.json();
    attempts++;
    console.log(`[AI] Status: ${result.status} (attempt ${attempts})`);
  }

  if (result.status === "failed") {
    throw new Error(result.error || "Generation failed");
  }

  if (result.status !== "succeeded") {
    throw new Error("Generation timed out");
  }

  return result;
}

// Remove background from image
async function removeBackground(imageUrl: string): Promise<string> {
  console.log(`[AI RemoveBG] Removing background from: ${imageUrl}`);

  // Using lucataco/remove-bg model on Replicate
  const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${REPLICATE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1", // lucataco/remove-bg
      input: {
        image: imageUrl,
      },
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    console.error("[AI RemoveBG] Replicate create error:", error);
    throw new Error(`Replicate API error: ${createResponse.status}`);
  }

  const prediction = await createResponse.json();
  console.log(`[AI RemoveBG] Prediction created: ${prediction.id}`);

  const result = await pollPrediction(prediction.id, 15); // Usually fast, ~2-5s
  return result.output;
}

// Upscale image using Real-ESRGAN
async function upscaleImage(imageUrl: string, scale = 2): Promise<string> {
  console.log(`[AI Upscale] Upscaling image ${scale}x: ${imageUrl}`);

  const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${REPLICATE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b", // nightmareai/real-esrgan
      input: {
        image: imageUrl,
        scale: Math.min(scale, 4), // Max 4x
        face_enhance: false,
      },
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    console.error("[AI Upscale] Replicate create error:", error);
    throw new Error(`Replicate API error: ${createResponse.status}`);
  }

  const prediction = await createResponse.json();
  console.log(`[AI Upscale] Prediction created: ${prediction.id}`);

  const result = await pollPrediction(prediction.id, 30); // Can take longer for big images
  return result.output;
}

// Generate 3D model from image using TripoSR
async function generate3D(imageUrl: string, foregroundRatio = 0.85, mcResolution = 256): Promise<string> {
  console.log(`[AI 3D] Generating 3D from image: ${imageUrl}`);

  // TripoSR model on Replicate
  const tripoVersion = "8d74ea2b84dd0a5a8a3a3c93875e75e2e88c3a29a0e8f05f4f8fc8f91bf72e4b";

  const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${REPLICATE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: tripoVersion,
      input: {
        image: imageUrl,
        foreground_ratio: foregroundRatio,
        mc_resolution: mcResolution,
        output_format: "glb",
      },
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    console.error("[AI 3D] Replicate create error:", error);
    throw new Error(`Replicate API error: ${createResponse.status}`);
  }

  const prediction = await createResponse.json();
  console.log(`[AI 3D] Prediction created: ${prediction.id}`);

  const result = await pollPrediction(prediction.id, 60); // 3D takes longer, up to 2 min
  return result.output;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY not configured. Add it to your Supabase secrets.");
    }

    const body: RequestBody = await req.json();
    const { type = "image" } = body;

    // Handle 3D generation
    if (type === "3d") {
      const { imageUrl, foregroundRatio = 0.85, mcResolution = 256 } = body;

      if (!imageUrl) {
        throw new Error("imageUrl is required for 3D generation");
      }

      const modelUrl = await generate3D(imageUrl, foregroundRatio, mcResolution);

      return new Response(
        JSON.stringify({
          success: true,
          type: "3d",
          modelUrl,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle remove background
    if (type === "remove-bg") {
      const { imageUrl } = body;

      if (!imageUrl) {
        throw new Error("imageUrl is required for background removal");
      }

      const resultUrl = await removeBackground(imageUrl);

      return new Response(
        JSON.stringify({
          success: true,
          type: "remove-bg",
          imageUrl: resultUrl,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle upscale
    if (type === "upscale") {
      const { imageUrl, scale = 2 } = body;

      if (!imageUrl) {
        throw new Error("imageUrl is required for upscaling");
      }

      const resultUrl = await upscaleImage(imageUrl, scale);

      return new Response(
        JSON.stringify({
          success: true,
          type: "upscale",
          imageUrl: resultUrl,
          scale,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle image generation
    const {
      prompt,
      negativePrompt = "blurry, low quality, distorted, deformed, ugly, bad anatomy",
      style = "realistic",
      width = 1024,
      height = 1024,
      model = "sdxl",
    } = body;

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    // Apply style modifiers
    const styleModifier = STYLE_MODIFIERS[style] || STYLE_MODIFIERS.realistic;
    const enhancedPrompt = styleModifier.prefix + prompt + styleModifier.suffix;

    console.log(`[AI Image] Generating: "${prompt}" with style: ${style}`);

    // Select model version based on request
    const modelVersions: Record<string, string> = {
      sdxl: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", // SDXL
      flux: "8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f", // Flux Pro 1.1
      "flux-schnell": "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637", // Flux Schnell (faster)
    };

    const version = modelVersions[model] || modelVersions.sdxl;

    // Create prediction on Replicate
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version,
        input: {
          prompt: enhancedPrompt,
          negative_prompt: negativePrompt,
          width,
          height,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 25,
          guidance_scale: 7.5,
          refine: "expert_ensemble_refiner",
          high_noise_frac: 0.8,
        },
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.error("[AI Image] Replicate create error:", error);
      throw new Error(`Replicate API error: ${createResponse.status}`);
    }

    const prediction = await createResponse.json();
    console.log(`[AI Image] Prediction created: ${prediction.id}`);

    // Poll for completion using shared helper
    const result = await pollPrediction(prediction.id);

    // Return the generated image URL
    const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;

    console.log(`[AI Image] Success! URL: ${imageUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl,
        prompt: enhancedPrompt,
        style,
        model,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[AI Image] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        hint: error.message.includes("REPLICATE_API_KEY")
          ? "Get your API key at https://replicate.com/account/api-tokens"
          : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
