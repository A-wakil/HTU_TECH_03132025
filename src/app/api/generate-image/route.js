import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    console.log("Received prompt:", prompt?.substring(0, 100) + "...");

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.REPLICATE_API_TOKEN;
    if (!apiKey) {
      console.error("API key is missing");
      return NextResponse.json(
        { error: "Replicate API key is not configured" },
        { status: 500 }
      );
    }

    // Make sure API token is properly formatted (remove any whitespace)
    const cleanApiKey = apiKey.trim();
    
    console.log("Making request to Replicate API...");
    // Call the Replicate API to generate an image using the Flux-1.1-pro model
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${cleanApiKey}`,
      },
      body: JSON.stringify({
        version: "black-forest-labs/flux-1.1-pro",
        input: {
          prompt: prompt,
          prompt_upsampling: true,
          width: 1024,  // Optional parameters to improve quality
          height: 768,
          num_outputs: 1
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Replicate API error:", error);
      return NextResponse.json(
        { error: `Replicate API error: ${error.detail || error.message || "Unknown error"}` },
        { status: response.status }
      );
    }

    const prediction = await response.json();
    console.log("Prediction started:", prediction);
    
    // Poll the prediction status until it's completed
    let result;
    let status = prediction.status;
    
    while (status !== "succeeded" && status !== "failed") {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between polls
      
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${cleanApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!statusResponse.ok) {
        const statusError = await statusResponse.json();
        console.error("Status check error:", statusError);
        return NextResponse.json(
          { error: "Error checking prediction status" },
          { status: statusResponse.status }
        );
      }
      
      result = await statusResponse.json();
      console.log("Poll status:", result.status);
      status = result.status;
    }
    
    if (status === "failed") {
      console.error("Generation failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Image generation failed" },
        { status: 500 }
      );
    }
    
    // Return the generated image URL
    // The output is expected to be an array of image URLs
    const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
} 