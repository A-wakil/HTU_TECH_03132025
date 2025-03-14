import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const apiKey = process.env.REPLICATE_API_TOKEN.trim();
    console.log("Using API key (first few chars):", apiKey.substring(0, 5) + "...");

    // Enhanced test prompt
    const prompt = `Create a realistic professional advertisement for an eco-friendly product.
Use a modern, clean design style optimized for social media.

IMPORTANT: Include compelling advertising text and copy that is clearly readable. The ad should have:
- A catchy headline or slogan
- Brief body text that communicates value
- A clear call-to-action
- Properly sized text that integrates well with images
- Professional text placement and layout

Make the advertisement look completely realistic, as if created by a professional ad agency. The final result should look indistinguishable from a real-world advertisement.`;
    
    // Make the API request with minimal parameters
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${apiKey}`,
      },
      body: JSON.stringify({
        // Use the correct model identifier
        version: "black-forest-labs/flux-1.1-pro",
        input: {
          prompt: prompt,
          prompt_upsampling: true
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("API Response Error:", error);
      return NextResponse.json({ error: error.detail || "API error" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ 
      message: "Request submitted successfully", 
      data 
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 