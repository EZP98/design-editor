// Supabase Edge Function: AI Studio
// Unified API for Image Generation/Editing (Ideogram, Flux) and 3D (Tripo3D)
// Supports fal.ai (fast) and Replicate (fallback)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// API Keys
const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
const TRIPO_API_KEY = Deno.env.get("TRIPO_API_KEY");
const IDEOGRAM_API_KEY = Deno.env.get("IDEOGRAM_API_KEY");

// Cloudflare Workers AI
const CF_ACCOUNT_ID = Deno.env.get("CF_ACCOUNT_ID");
const CF_API_TOKEN = Deno.env.get("CF_API_TOKEN");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ============================================================================
// TYPES
// ============================================================================

interface RequestBody {
  // Operation type
  operation:
    // Image operations
    | "generate" | "inpaint" | "outpaint" | "remove-bg" | "upscale" | "remix" | "replace-bg"
    // 3D operations
    | "image-to-3d" | "text-to-3d" | "multiview-to-3d" | "refine-3d" | "retopology"
    | "texture-3d" | "segment-3d" | "stylize-3d" | "rig-3d" | "convert-3d";

  // Image generation
  prompt?: string;
  negativePrompt?: string;
  style?: "auto" | "general" | "realistic" | "design" | "render_3d" | "anime";
  width?: number;
  height?: number;
  model?: "ideogram" | "ideogram-turbo" | "flux" | "flux-schnell" | "sdxl";
  magicPrompt?: boolean;
  seed?: number;

  // Image editing
  imageUrl?: string;
  maskUrl?: string;  // For inpainting
  direction?: "left" | "right" | "up" | "down" | "all";  // For outpaint
  expandPixels?: number;  // How many pixels to expand

  // Upscale
  scale?: number;  // 2x or 4x

  // 3D generation
  textPrompt?: string;  // For text-to-3d
  imageUrls?: string[];  // For multiview-to-3d

  // 3D Image-to-3D options (Tripo)
  stylePreset?: string;  // e.g., "person:person2cartoon", "object:clay"
  faceLimit?: number;  // Limit polygon count (0 = auto)
  pbr?: boolean;  // Enable PBR materials
  autoScale?: boolean;  // Scale to real-world dimensions

  // 3D post-processing
  taskId?: string;  // Reference to previous 3D task
  targetPolycount?: number;  // For retopology
  texturePrompt?: string;  // For AI texture
  style3d?: "lego" | "voxel" | "voronoi" | "clay" | "steampunk" | "cartoon";
  outputFormat?: "glb" | "fbx" | "obj" | "stl" | "usdz";
  exportFormat?: "glb" | "fbx" | "obj" | "stl" | "usdz";
}

// ============================================================================
// CLOUDFLARE WORKERS AI HELPERS
// ============================================================================

async function cloudflareRequest(model: string, input: Record<string, any>): Promise<any> {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    throw new Error("CF_ACCOUNT_ID and CF_API_TOKEN not configured");
  }

  console.log(`[Cloudflare] Calling model: ${model}`);

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${model}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("[Cloudflare] Error:", error);
    throw new Error(`Cloudflare AI error: ${response.status} - ${error}`);
  }

  // Check if response is an image (binary)
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("image/")) {
    // Convert image to base64 data URL
    const imageBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const mimeType = contentType.split(";")[0];
    return {
      images: [{ url: `data:${mimeType};base64,${base64}` }],
    };
  }

  return await response.json();
}

// ============================================================================
// FAL.AI HELPERS
// ============================================================================

async function falRequest(model: string, input: Record<string, any>): Promise<any> {
  if (!FAL_API_KEY) {
    throw new Error("FAL_API_KEY not configured");
  }

  console.log(`[FAL] Calling model: ${model}`);

  // fal.ai uses queue-based API
  const submitResponse = await fetch(`https://queue.fal.run/${model}`, {
    method: "POST",
    headers: {
      "Authorization": `Key ${FAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!submitResponse.ok) {
    const error = await submitResponse.text();
    console.error("[FAL] Submit error:", error);
    throw new Error(`fal.ai error: ${submitResponse.status} - ${error}`);
  }

  const result = await submitResponse.json();

  // If sync response, return immediately
  if (result.images || result.output || result.model_mesh_url) {
    return result;
  }

  // Otherwise poll for completion
  const requestId = result.request_id;
  if (!requestId) {
    return result;
  }

  console.log(`[FAL] Request ID: ${requestId}, polling for completion...`);

  // Poll for result using the correct fal.ai queue API
  let attempts = 0;
  const maxAttempts = 60; // 2 minutes max

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Use the correct status endpoint
    const statusResponse = await fetch(`https://queue.fal.run/requests/${requestId}/status`, {
      method: "GET",
      headers: { "Authorization": `Key ${FAL_API_KEY}` },
    });

    if (!statusResponse.ok) {
      // Try alternative status check
      const altResponse = await fetch(`https://fal.run/${model}`, {
        method: "GET",
        headers: {
          "Authorization": `Key ${FAL_API_KEY}`,
          "X-Fal-Request-Id": requestId,
        },
      });

      if (altResponse.ok) {
        const result = await altResponse.json();
        if (result.images || result.output || result.model_mesh_url) {
          return result;
        }
      }

      attempts++;
      continue;
    }

    const status = await statusResponse.json();
    console.log(`[FAL] Status: ${status.status} (attempt ${attempts + 1})`);

    if (status.status === "COMPLETED") {
      // Fetch the result
      const resultResponse = await fetch(`https://queue.fal.run/requests/${requestId}`, {
        headers: { "Authorization": `Key ${FAL_API_KEY}` },
      });
      return await resultResponse.json();
    }

    if (status.status === "FAILED") {
      throw new Error(status.error || "Generation failed");
    }

    attempts++;
  }

  throw new Error("Generation timed out");
}

// ============================================================================
// REPLICATE HELPERS
// ============================================================================

async function replicateRequest(version: string, input: Record<string, any>): Promise<any> {
  if (!REPLICATE_API_KEY) {
    throw new Error("REPLICATE_API_KEY not configured");
  }

  console.log(`[Replicate] Creating prediction...`);

  const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${REPLICATE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version, input }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Replicate error: ${createResponse.status} - ${error}`);
  }

  const prediction = await createResponse.json();
  console.log(`[Replicate] Prediction ID: ${prediction.id}`);

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60;
  let result = prediction;

  while (result.status !== "succeeded" && result.status !== "failed" && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { "Authorization": `Bearer ${REPLICATE_API_KEY}` },
    });

    result = await statusResponse.json();
    console.log(`[Replicate] Status: ${result.status} (attempt ${attempts + 1})`);
    attempts++;
  }

  if (result.status === "failed") {
    throw new Error(result.error || "Generation failed");
  }

  if (result.status !== "succeeded") {
    throw new Error("Generation timed out");
  }

  return result;
}

// ============================================================================
// TRIPO3D DIRECT API
// ============================================================================

async function tripoRequest(endpoint: string, body: Record<string, any>): Promise<any> {
  if (!TRIPO_API_KEY) {
    throw new Error("TRIPO_API_KEY not configured. Get one at https://platform.tripo3d.ai/");
  }

  console.log(`[Tripo] Calling endpoint: ${endpoint}`);

  const response = await fetch(`https://api.tripo3d.ai/v2/openapi/${endpoint}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TRIPO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[Tripo] Error:", error);
    throw new Error(`Tripo API error: ${response.status} - ${error}`);
  }

  const result = await response.json();

  // If task-based, poll for completion
  if (result.data?.task_id) {
    return await pollTripoTask(result.data.task_id);
  }

  return result;
}

async function pollTripoTask(taskId: string): Promise<any> {
  console.log(`[Tripo] Polling task: ${taskId}`);

  let attempts = 0;
  const maxAttempts = 90; // 3 minutes for 3D

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
      headers: { "Authorization": `Bearer ${TRIPO_API_KEY}` },
    });

    if (!response.ok) {
      throw new Error(`Task check failed: ${response.status}`);
    }

    const result = await response.json();
    const status = result.data?.status;
    console.log(`[Tripo] Task status: ${status} (attempt ${attempts + 1})`);

    if (status === "success") {
      return result.data;
    }

    if (status === "failed") {
      throw new Error(result.data?.error || "3D generation failed");
    }

    attempts++;
  }

  throw new Error("3D generation timed out");
}

// ============================================================================
// IMAGE OPERATIONS
// ============================================================================

async function generateImage(body: RequestBody): Promise<{ imageUrl: string; seed?: number }> {
  const { prompt, style = "auto", width = 1024, height = 1024, model = "ideogram", magicPrompt = true, seed } = body;

  if (!prompt) throw new Error("Prompt is required");

  // Try Cloudflare Workers AI first (100k free requests/day!)
  if (CF_ACCOUNT_ID && CF_API_TOKEN) {
    console.log("[Generate] Using Cloudflare Workers AI");

    // Map model to Cloudflare model
    const cfModels: Record<string, string> = {
      "flux": "@cf/black-forest-labs/flux-1-schnell",
      "flux-schnell": "@cf/black-forest-labs/flux-1-schnell",
      "sdxl": "@cf/stabilityai/stable-diffusion-xl-base-1.0",
      "ideogram": "@cf/black-forest-labs/flux-1-schnell", // Fallback to Flux
      "ideogram-turbo": "@cf/black-forest-labs/flux-1-schnell",
      "leonardo": "@cf/leonardo/lucid-origin",
      "leonardo-phoenix": "@cf/leonardo/phoenix-1.0",
    };

    const cfModel = cfModels[model] || cfModels["flux-schnell"];

    try {
      const result = await cloudflareRequest(cfModel, {
        prompt,
        width: Math.min(width, 1024),
        height: Math.min(height, 1024),
        num_steps: model.includes("schnell") ? 4 : 20,
      });

      const imageUrl = result.images?.[0]?.url || result.image;
      if (imageUrl) {
        return { imageUrl };
      }
    } catch (cfError) {
      console.log("[Generate] Cloudflare failed, trying fal.ai...", cfError);
    }
  }

  // Use Ideogram via fal.ai (fastest)
  if (model === "ideogram" || model === "ideogram-turbo") {
    const falModel = model === "ideogram-turbo" ? "fal-ai/ideogram/v2/turbo" : "fal-ai/ideogram/v2";

    const result = await falRequest(falModel, {
      prompt,
      style_type: style.toUpperCase(),
      magic_prompt_option: magicPrompt ? "AUTO" : "OFF",
      aspect_ratio: getAspectRatio(width, height),
      seed,
    });

    return {
      imageUrl: result.images?.[0]?.url || result.output?.[0],
      seed: result.seed,
    };
  }

  // Use Flux via fal.ai
  if (model === "flux" || model === "flux-schnell") {
    const falModel = model === "flux-schnell" ? "fal-ai/flux/schnell" : "fal-ai/flux-pro/v1.1";

    const result = await falRequest(falModel, {
      prompt,
      image_size: { width, height },
      seed,
    });

    return {
      imageUrl: result.images?.[0]?.url,
      seed: result.seed,
    };
  }

  // Fallback to Replicate for other models
  const versions: Record<string, string> = {
    sdxl: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  };

  const result = await replicateRequest(versions[model] || versions.sdxl, {
    prompt,
    width,
    height,
    seed,
  });

  return {
    imageUrl: Array.isArray(result.output) ? result.output[0] : result.output,
  };
}

async function inpaintImage(body: RequestBody): Promise<{ imageUrl: string }> {
  const { imageUrl, maskUrl, prompt, style = "auto", magicPrompt = false } = body;

  if (!imageUrl) throw new Error("imageUrl is required for inpainting");
  if (!maskUrl) throw new Error("maskUrl is required for inpainting");
  if (!prompt) throw new Error("prompt is required for inpainting");

  // Use Ideogram v2 inpainting via fal.ai
  const result = await falRequest("fal-ai/ideogram/v2/edit", {
    image_url: imageUrl,
    mask_url: maskUrl,
    prompt,
    style_type: style.toUpperCase(),
    magic_prompt_option: magicPrompt ? "AUTO" : "OFF",
  });

  return {
    imageUrl: result.images?.[0]?.url || result.output?.[0],
  };
}

async function outpaintImage(body: RequestBody): Promise<{ imageUrl: string }> {
  const { imageUrl, prompt, direction = "all", expandPixels = 256 } = body;

  if (!imageUrl) throw new Error("imageUrl is required for outpainting");

  // Calculate expansion based on direction
  const expansion = {
    left: direction === "left" || direction === "all" ? expandPixels : 0,
    right: direction === "right" || direction === "all" ? expandPixels : 0,
    top: direction === "up" || direction === "all" ? expandPixels : 0,
    bottom: direction === "down" || direction === "all" ? expandPixels : 0,
  };

  // Use Ideogram extend via fal.ai
  const result = await falRequest("fal-ai/ideogram/v2/edit", {
    image_url: imageUrl,
    prompt: prompt || "extend the image naturally, seamless continuation",
    expand_left: expansion.left,
    expand_right: expansion.right,
    expand_up: expansion.top,
    expand_down: expansion.bottom,
  });

  return {
    imageUrl: result.images?.[0]?.url || result.output?.[0],
  };
}

async function removeBackground(body: RequestBody): Promise<{ imageUrl: string }> {
  const { imageUrl } = body;

  if (!imageUrl) throw new Error("imageUrl is required");

  // Try Cloudflare first (free!)
  if (CF_ACCOUNT_ID && CF_API_TOKEN) {
    try {
      // Fetch image and convert to base64
      const imgResponse = await fetch(imageUrl);
      const imgBuffer = await imgResponse.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));

      const result = await cloudflareRequest("@cf/meta/m2m100-1.2b", {
        image: [base64],
      });

      if (result.images?.[0]?.url) {
        return { imageUrl: result.images[0].url };
      }
    } catch (cfError) {
      console.log("[RemoveBG] Cloudflare failed, trying fal.ai...", cfError);
    }
  }

  // Use rembg via fal.ai
  if (FAL_API_KEY) {
    try {
      const result = await falRequest("fal-ai/imageutils/rembg", {
        image_url: imageUrl,
      });
      return { imageUrl: result.image?.url || result.output };
    } catch (falError) {
      console.log("[RemoveBG] fal.ai failed, trying Replicate...", falError);
    }
  }

  // Fallback to Replicate
  if (REPLICATE_API_KEY) {
    const result = await replicateRequest(
      "95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",
      { image: imageUrl }
    );
    return { imageUrl: result.output };
  }

  throw new Error("No background removal service available");
}

async function upscaleImage(body: RequestBody): Promise<{ imageUrl: string }> {
  const { imageUrl, scale = 2 } = body;

  if (!imageUrl) throw new Error("imageUrl is required");

  // Use Real-ESRGAN via fal.ai
  try {
    const result = await falRequest("fal-ai/imageutils/upscaler", {
      image_url: imageUrl,
      scale: Math.min(scale, 4),
    });
    return { imageUrl: result.image?.url || result.output };
  } catch {
    // Fallback to Replicate
    const result = await replicateRequest(
      "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      { image: imageUrl, scale: Math.min(scale, 4), face_enhance: false }
    );
    return { imageUrl: result.output };
  }
}

async function remixImage(body: RequestBody): Promise<{ imageUrl: string }> {
  const { imageUrl, prompt, style = "auto" } = body;

  if (!imageUrl) throw new Error("imageUrl is required for remix");
  if (!prompt) throw new Error("prompt is required for remix");

  // Use Ideogram remix via fal.ai
  const result = await falRequest("fal-ai/ideogram/v2", {
    prompt,
    image_url: imageUrl,
    image_weight: 70, // Balance between original and prompt
    style_type: style.toUpperCase(),
  });

  return {
    imageUrl: result.images?.[0]?.url || result.output?.[0],
  };
}

async function replaceBackground(body: RequestBody): Promise<{ imageUrl: string }> {
  const { imageUrl, prompt } = body;

  if (!imageUrl) throw new Error("imageUrl is required");
  if (!prompt) throw new Error("prompt is required for background replacement");

  // Step 1: Remove background
  const { imageUrl: noBgUrl } = await removeBackground({ ...body, imageUrl });

  // Step 2: Generate new background and composite
  // Use Ideogram with the subject and new background prompt
  const result = await falRequest("fal-ai/ideogram/v2/edit", {
    image_url: noBgUrl,
    prompt: `${prompt}, with the main subject in the foreground`,
    style_type: "REALISTIC",
  });

  return {
    imageUrl: result.images?.[0]?.url || result.output?.[0],
  };
}

// ============================================================================
// 3D OPERATIONS
// ============================================================================

async function imageToTripo3D(body: RequestBody): Promise<{ modelUrl: string; taskId: string; thumbnail?: string }> {
  const { imageUrl, prompt, stylePreset, faceLimit, pbr = true, autoScale = false, exportFormat = "glb" } = body;

  if (!imageUrl) throw new Error("imageUrl is required");

  // Try Tripo first (user has credits)
  if (TRIPO_API_KEY && TRIPO_API_KEY.startsWith("tsk_")) {
    console.log("[3D] Using Tripo direct API");
    const taskBody: Record<string, any> = {
      type: "image_to_model",
      file: { type: "url", url: imageUrl },
      model_version: "v2.5-20250123",
      texture: true,
      pbr: pbr,
    };

    // Optional text prompt to guide generation
    if (prompt) {
      taskBody.prompt = prompt;
    }

    // Style preset (e.g., "person:person2cartoon", "object:clay")
    if (stylePreset && stylePreset !== "none") {
      taskBody.style = stylePreset;
    }

    // Face limit (polygon count)
    if (faceLimit && faceLimit > 0) {
      taskBody.face_limit = faceLimit;
    }

    // Auto-scale to real world dimensions
    taskBody.auto_scale = autoScale;

    try {
      const result = await tripoRequest("task", taskBody);

      // Parse Tripo response - can be in output.pbr_model or result.pbr_model.url
      const modelUrl = result.output?.pbr_model ||
                       result.output?.model ||
                       result.result?.pbr_model?.url ||
                       result.model_url;

      return {
        modelUrl,
        taskId: result.task_id,
        thumbnail: result.thumbnail || result.output?.rendered_image,
      };
    } catch (tripoError) {
      console.log("[3D] Tripo API failed:", tripoError);
    }
  }

  // Fallback to fal.ai
  if (FAL_API_KEY) {
    console.log("[3D] Using fal.ai for image-to-3d");
    const falInput: Record<string, any> = {
      image_url: imageUrl,
    };

    if (faceLimit && faceLimit > 0) {
      falInput.face_limit = faceLimit;
    }

    if (stylePreset && stylePreset !== "none") {
      falInput.style = stylePreset;
    }

    try {
      const result = await falRequest("fal-ai/triposr", falInput);

      return {
        modelUrl: result.mesh?.url || result.model_mesh_url || result.output,
        taskId: result.request_id || `fal-${Date.now()}`,
      };
    } catch (falError) {
      console.log("[3D] fal.ai failed:", falError);
    }
  }

  throw new Error("No 3D generation service available. Please configure TRIPO_API_KEY (starts with tsk_) or FAL_API_KEY");
}

async function textToTripo3D(body: RequestBody): Promise<{ modelUrl: string; taskId: string; thumbnail?: string }> {
  const { textPrompt } = body;

  if (!textPrompt) throw new Error("textPrompt is required");

  if (TRIPO_API_KEY) {
    const result = await tripoRequest("task", {
      type: "text_to_model",
      prompt: textPrompt,
      model_version: "v2.5-20250123",
      texture: true,
      pbr: true,
    });

    // Parse Tripo response - can be in output.pbr_model or result.pbr_model.url
    const modelUrl = result.output?.pbr_model ||
                     result.output?.model ||
                     result.result?.pbr_model?.url ||
                     result.model_url;

    return {
      modelUrl,
      taskId: result.task_id,
      thumbnail: result.thumbnail || result.output?.rendered_image,
    };
  }

  // Fallback to fal.ai
  const result = await falRequest("tripo3d/tripo/v2.5/text-to-3d", {
    prompt: textPrompt,
  });

  return {
    modelUrl: result.model_mesh_url || result.output,
    taskId: result.request_id || "",
  };
}

// Helper to parse Tripo model URL from various response formats
function parseTripoModelUrl(result: any): string {
  return result.output?.pbr_model ||
         result.output?.model ||
         result.result?.pbr_model?.url ||
         result.result?.model?.url ||
         result.model_url ||
         "";
}

async function refine3D(body: RequestBody): Promise<{ modelUrl: string; taskId: string }> {
  const { taskId } = body;

  if (!taskId) throw new Error("taskId is required for refinement");
  if (!TRIPO_API_KEY) throw new Error("TRIPO_API_KEY required for 3D refinement");

  const result = await tripoRequest("task", {
    type: "refine_model",
    draft_model_task_id: taskId,
  });

  return {
    modelUrl: parseTripoModelUrl(result),
    taskId: result.task_id,
  };
}

async function retopology3D(body: RequestBody): Promise<{ modelUrl: string; taskId: string }> {
  const { taskId, targetPolycount = 5000 } = body;

  if (!taskId) throw new Error("taskId is required for retopology");
  if (!TRIPO_API_KEY) throw new Error("TRIPO_API_KEY required for retopology");

  const result = await tripoRequest("task", {
    type: "retopology",
    original_model_task_id: taskId,
    target_face_count: targetPolycount,
  });

  return {
    modelUrl: parseTripoModelUrl(result),
    taskId: result.task_id,
  };
}

async function texture3D(body: RequestBody): Promise<{ modelUrl: string; taskId: string }> {
  const { taskId, texturePrompt } = body;

  if (!taskId) throw new Error("taskId is required for texturing");
  if (!TRIPO_API_KEY) throw new Error("TRIPO_API_KEY required for texturing");

  const result = await tripoRequest("task", {
    type: "texture_model",
    original_model_task_id: taskId,
    prompt: texturePrompt,
  });

  return {
    modelUrl: parseTripoModelUrl(result),
    taskId: result.task_id,
  };
}

async function stylize3D(body: RequestBody): Promise<{ modelUrl: string; taskId: string }> {
  const { taskId, style3d = "lego" } = body;

  if (!taskId) throw new Error("taskId is required for stylization");
  if (!TRIPO_API_KEY) throw new Error("TRIPO_API_KEY required for stylization");

  const result = await tripoRequest("task", {
    type: "stylize_model",
    original_model_task_id: taskId,
    style: style3d,
  });

  return {
    modelUrl: parseTripoModelUrl(result),
    taskId: result.task_id,
  };
}

async function segment3D(body: RequestBody): Promise<{ modelUrl: string; taskId: string; parts: string[] }> {
  const { taskId } = body;

  if (!taskId) throw new Error("taskId is required for segmentation");
  if (!TRIPO_API_KEY) throw new Error("TRIPO_API_KEY required for segmentation");

  const result = await tripoRequest("task", {
    type: "segment_model",
    original_model_task_id: taskId,
  });

  return {
    modelUrl: parseTripoModelUrl(result),
    taskId: result.task_id,
    parts: result.output?.parts || [],
  };
}

async function rig3D(body: RequestBody): Promise<{ modelUrl: string; taskId: string }> {
  const { taskId } = body;

  if (!taskId) throw new Error("taskId is required for rigging");
  if (!TRIPO_API_KEY) throw new Error("TRIPO_API_KEY required for rigging");

  const result = await tripoRequest("task", {
    type: "rig_model",
    original_model_task_id: taskId,
  });

  return {
    modelUrl: parseTripoModelUrl(result),
    taskId: result.task_id,
  };
}

async function convert3D(body: RequestBody): Promise<{ modelUrl: string }> {
  const { taskId, outputFormat = "glb" } = body;

  if (!taskId) throw new Error("taskId is required for conversion");

  if (!TRIPO_API_KEY) throw new Error("TRIPO_API_KEY required for conversion");

  const result = await tripoRequest("task", {
    type: "convert_model",
    original_model_task_id: taskId,
    format: outputFormat,
  });

  return {
    modelUrl: result.output?.model || result.model_url,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function getAspectRatio(width: number, height: number): string {
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.1) return "ASPECT_1_1";
  if (Math.abs(ratio - 16/9) < 0.1) return "ASPECT_16_9";
  if (Math.abs(ratio - 9/16) < 0.1) return "ASPECT_9_16";
  if (Math.abs(ratio - 4/3) < 0.1) return "ASPECT_4_3";
  if (Math.abs(ratio - 3/4) < 0.1) return "ASPECT_3_4";
  if (Math.abs(ratio - 3/2) < 0.1) return "ASPECT_3_2";
  if (Math.abs(ratio - 2/3) < 0.1) return "ASPECT_2_3";
  return "ASPECT_1_1";
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { operation } = body;

    if (!operation) {
      throw new Error("operation is required");
    }

    console.log(`[AI Studio] Operation: ${operation}`);

    let result: any;

    switch (operation) {
      // Image operations
      case "generate":
        result = await generateImage(body);
        break;
      case "inpaint":
        result = await inpaintImage(body);
        break;
      case "outpaint":
        result = await outpaintImage(body);
        break;
      case "remove-bg":
        result = await removeBackground(body);
        break;
      case "upscale":
        result = await upscaleImage(body);
        break;
      case "remix":
        result = await remixImage(body);
        break;
      case "replace-bg":
        result = await replaceBackground(body);
        break;

      // 3D operations
      case "image-to-3d":
        result = await imageToTripo3D(body);
        break;
      case "text-to-3d":
        result = await textToTripo3D(body);
        break;
      case "refine-3d":
        result = await refine3D(body);
        break;
      case "retopology":
        result = await retopology3D(body);
        break;
      case "texture-3d":
        result = await texture3D(body);
        break;
      case "stylize-3d":
        result = await stylize3D(body);
        break;
      case "segment-3d":
        result = await segment3D(body);
        break;
      case "rig-3d":
        result = await rig3D(body);
        break;
      case "convert-3d":
        result = await convert3D(body);
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    return new Response(
      JSON.stringify({ success: true, operation, ...result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[AI Studio] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        hint: getErrorHint(error.message),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function getErrorHint(message: string): string | undefined {
  if (message.includes("CF_ACCOUNT_ID") || message.includes("CF_API_TOKEN")) {
    return "Get your Cloudflare credentials at https://dash.cloudflare.com - Account ID in URL, API Token in Profile > API Tokens";
  }
  if (message.includes("FAL_API_KEY")) {
    return "Get your API key at https://fal.ai/dashboard/keys";
  }
  if (message.includes("TRIPO_API_KEY") || message.includes("tsk_")) {
    return "Get your API key (starts with tsk_) at https://platform.tripo3d.ai/api-keys";
  }
  if (message.includes("REPLICATE_API_KEY")) {
    return "Get your API key at https://replicate.com/account/api-tokens";
  }
  if (message.includes("IDEOGRAM_API_KEY")) {
    return "Get your API key at https://ideogram.ai/manage-api";
  }
  if (message.includes("No") && message.includes("service available")) {
    return "Configure at least one provider: CF_ACCOUNT_ID+CF_API_TOKEN (free), FAL_API_KEY, or REPLICATE_API_KEY";
  }
  return undefined;
}
