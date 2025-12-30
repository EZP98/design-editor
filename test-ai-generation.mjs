// Test AI Generation - Simulates the full flow and checks results
// Uses built-in fetch (Node 18+)

const SUPABASE_URL = 'https://tyskftlhwdstsjvddfld.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5c2tmdGxod2RzdHNqdmRkZmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzg0OTEsImV4cCI6MjA2NDY1NDQ5MX0.maoj5RFFeP_dCe5zv-ROVHUTBjayDvUnf4tfAiAlptQ';

async function testAIGeneration() {
  console.log('=== Testing AI Design Generation ===\n');

  // 1. Call the Edge Function
  console.log('1. Calling Edge Function...');
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      message: 'Create a hero section with title, subtitle and button',
      mode: 'design',
    }),
  });

  if (!response.ok) {
    console.error('Edge Function error:', response.status);
    return;
  }

  // 2. Read streaming response
  console.log('2. Reading streaming response...\n');
  const text = await response.text();

  // Parse SSE chunks
  let fullContent = '';
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
      try {
        const data = JSON.parse(line.slice(6));
        if (data.text) {
          fullContent += data.text;
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }

  // 3. Reconstruct JSON with prefix (as client does)
  console.log('3. Raw AI response (first 500 chars):');
  console.log(fullContent.substring(0, 500) + '...\n');

  // Add prefix since Edge Function prefills it
  const jsonStr = '{"elements":[' + fullContent;

  console.log('4. With prefix added:');
  console.log(jsonStr.substring(0, 200) + '...\n');

  // 4. Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
    console.log('5. JSON parsed successfully!\n');
  } catch (e) {
    console.error('5. JSON parse error:', e.message);
    console.log('\nTrying to find valid sections...');

    // Try to extract sections from broken JSON
    const sectionMatches = fullContent.match(/"type"\s*:\s*"section"/g);
    console.log(`Found ${sectionMatches?.length || 0} section markers`);
    return;
  }

  // 5. Analyze the structure
  console.log('6. Structure Analysis:');
  const elements = parsed.elements || [parsed];

  function analyzeElement(el, depth = 0) {
    const indent = '  '.repeat(depth);
    const hasResizeX = el.styles?.resizeX !== undefined;
    const hasDisplay = el.styles?.display !== undefined;

    console.log(`${indent}- ${el.type}: "${el.name || el.content?.substring(0, 20) || 'unnamed'}"`);
    console.log(`${indent}  display: ${el.styles?.display || 'NOT SET'}`);
    console.log(`${indent}  resizeX: ${el.styles?.resizeX || 'NOT SET (will default to fixed)'}`);
    console.log(`${indent}  minHeight: ${el.styles?.minHeight || 'NOT SET'}`);

    if (el.children) {
      for (const child of el.children) {
        analyzeElement(child, depth + 1);
      }
    }
  }

  for (const el of elements) {
    analyzeElement(el);
  }

  // 6. Check what our fix would do
  console.log('\n7. What addElementsFromAI.ts will do:');
  const containerTypes = ['section', 'frame', 'stack', 'container', 'row'];

  function checkFixes(el, parentHasAutoLayout = true) {
    const isContainer = containerTypes.includes(el.type);

    if (isContainer) {
      console.log(`\n   ${el.type} "${el.name}":`);
      console.log(`     - Will FORCE resizeX: 'fill' (currently: ${el.styles?.resizeX || 'not set'})`);
      console.log(`     - Will set positionType: 'relative' (parent has auto-layout: ${parentHasAutoLayout})`);

      if (el.type === 'section') {
        console.log(`     - Will set display: 'flex' if not set (currently: ${el.styles?.display || 'not set'})`);
        console.log(`     - Will set minHeight: 400 if not set (currently: ${el.styles?.minHeight || 'not set'})`);
      }
    }

    // Check children
    const childParentHasAutoLayout = el.styles?.display === 'flex' || el.styles?.display === 'grid';
    if (el.children) {
      for (const child of el.children) {
        checkFixes(child, childParentHasAutoLayout);
      }
    }
  }

  for (const el of elements) {
    checkFixes(el);
  }

  console.log('\n=== Test Complete ===');
}

testAIGeneration().catch(console.error);
