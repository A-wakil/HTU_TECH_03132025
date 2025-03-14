import { NextResponse } from "next/server";

// This would be replaced by a real LLM API call (like OpenAI's API) in a production environment
// For now, we'll use a simulated response to demonstrate the concept
async function simulateLLMAnalysis(userInputs) {
  const { adType, demographic, theme, platforms, customText, basePrompt } = userInputs;
  
  // Define 4 demographics for the ad
  let demographics = [];
  
  if (demographic === "multiple") {
    // If the user selected "multiple", we'll generate prompts for 4 standard demographics
    demographics = [
      {
        demographic: "Gen Z (18-24)",
        description: "Digital natives who value authenticity, social causes, and innovative approaches"
      },
      {
        demographic: "Millennials (25-40)",
        description: "Tech-savvy professionals balancing career growth with personal well-being"
      },
      {
        demographic: "Gen X (41-56)",
        description: "Practical consumers with established careers seeking reliability and value"
      },
      {
        demographic: "Baby Boomers (57-75)",
        description: "Experience-focused audience that appreciates quality and proven solutions"
      }
    ];
  } else {
    // If the user selected a specific demographic, we'll create 4 sub-segments within that demographic
    // For example, if they chose "young-adults", we'll create 4 types of young adults
    const demographicSegments = {
      "young-adults": [
        { demographic: "Tech-Savvy Young Professionals", description: "Career-focused 20-somethings in urban settings" },
        { demographic: "College Students", description: "Budget-conscious students balancing education and social life" },
        { demographic: "Creative Young Adults", description: "Artistic and trend-setting individuals in their 20s" },
        { demographic: "Active Young Adults", description: "Health and fitness-oriented individuals aged 18-30" }
      ],
      "middle-aged": [
        { demographic: "Career-Focused Professionals", description: "Established professionals prioritizing career advancement" },
        { demographic: "Parents of Young Children", description: "Family-oriented individuals balancing work and childcare" },
        { demographic: "Wellness-Minded Adults", description: "Health-conscious individuals focused on maintaining well-being" },
        { demographic: "Tech-Adopting Professionals", description: "Digitally fluent adults embracing new technologies" }
      ],
      "seniors": [
        { demographic: "Active Retirees", description: "Physically active seniors enjoying their retirement years" },
        { demographic: "Tech-Curious Seniors", description: "Older adults embracing digital technologies and solutions" },
        { demographic: "Traditional Seniors", description: "Value-oriented seniors appreciating familiar approaches" },
        { demographic: "Grandparent Seniors", description: "Family-focused seniors engaged with grandchildren and extended family" }
      ]
    };
    
    demographics = demographicSegments[demographic] || [
      { demographic: "Segment 1", description: "First segment of your selected demographic" },
      { demographic: "Segment 2", description: "Second segment of your selected demographic" },
      { demographic: "Segment 3", description: "Third segment of your selected demographic" },
      { demographic: "Segment 4", description: "Fourth segment of your selected demographic" }
    ];
  }
  
  // Create enhanced prompts for each demographic
  const enhancedPrompts = demographics.map(demo => {
    // Generate tailored prompt for each demographic
    const enhancedPrompt = generateEnhancedPrompt(adType, demo.demographic, theme, platforms, customText);
    
    return {
      demographic: demo.demographic,
      description: demo.description,
      prompt: enhancedPrompt
    };
  });
  
  return enhancedPrompts;
}

// Helper function to generate enhanced prompts
function generateEnhancedPrompt(adType, demographic, theme, platforms, customText) {
  // Map theme values to style descriptions
  const themeDescriptions = {
    "modern": "modern, sleek, clean lines, contemporary design",
    "minimalist": "minimalist, simplified, essential elements only, uncluttered",
    "vibrant": "vibrant, colorful, energetic, bold design",
    "professional": "professional, polished, refined, sophisticated",
    "eco-friendly": "eco-friendly, sustainable, natural elements, green aesthetic"
  };

  // Map platform values to format descriptions
  const platformFormats = {
    "social-media": "social media format, engaging, shareable, optimal for mobile viewing",
    "website": "website banner format, responsive design, attention-grabbing",
    "print": "print advertisement format, high resolution, detailed",
    "mobile": "mobile app advertisement format, compact, clear call-to-action"
  };

  // Tailor the description based on demographic
  let demographicInsight = "";
  
  if (demographic.includes("Gen Z")) {
    demographicInsight = "Use bold colors, casual language, authentic imagery, and emphasize social impact. Include modern design elements that appeal to digital natives.";
  } else if (demographic.includes("Millennial")) {
    demographicInsight = "Balance aspirational with practical messaging, use authentic and diverse imagery, and highlight value and experiences over materialism.";
  } else if (demographic.includes("Gen X")) {
    demographicInsight = "Use straightforward messaging, demonstrate practical value, and balance innovation with reliability and proven performance.";
  } else if (demographic.includes("Boomer")) {
    demographicInsight = "Emphasize quality, reliability, and value. Use clear text, avoid excessive jargon, and feature relatable imagery of active, vibrant older adults.";
  } else if (demographic.includes("Tech-Savvy")) {
    demographicInsight = "Feature cutting-edge design, innovative solutions, and emphasize how the product/service integrates with digital lifestyle.";
  } else if (demographic.includes("Parents")) {
    demographicInsight = "Show how the product/service saves time, reduces stress, or benefits the whole family. Balance practical with emotional appeals.";
  } else if (demographic.includes("Active")) {
    demographicInsight = "Showcase energy, movement, and health benefits. Use dynamic imagery and emphasize how the product enhances an active lifestyle.";
  } else if (demographic.includes("Traditional")) {
    demographicInsight = "Emphasize reliability, tradition, and proven value. Use familiar imagery and straightforward messaging that connects to established values.";
  } else {
    demographicInsight = "Create a balanced appeal with clear value proposition and benefits relevant to this specific demographic.";
  }

  // Generate the enhanced prompt
  let prompt = `Create a realistic professional ${adType} advertisement targeting ${demographic}. 
Use a ${themeDescriptions[theme] || theme} style and optimize for ${platformFormats[platforms] || platforms}.
The advertisement should be high quality, persuasive, and visually appealing.

IMPORTANT: Include compelling advertising text and copy that is clearly readable. The ad should have:
- A catchy headline or slogan
- Brief body text that communicates value
- A clear call-to-action
- Any text should be appropriately sized and properly integrated with images
- Text placement and layout should follow professional advertising standards

${demographicInsight}

Make the advertisement look completely realistic, as if created by a professional ad agency. Avoid any AI-generated artifacts.`;

  // Add custom text if provided
  if (customText && customText.trim() !== "") {
    prompt += `\n\nIncorporate these specific elements/messages into the ad: ${customText}`;
  }

  prompt += `\n\nThe final result should look indistinguishable from a real-world advertisement that would appear in professional media. The text should be meaningful, persuasive and strategically placed.`;

  return prompt;
}

export async function POST(request) {
  try {
    const userInputs = await request.json();
    console.log("Received request to enhance prompt:", userInputs.basePrompt);

    // In a production environment, this would be a call to an actual LLM API
    // For demonstration purposes, we're using a simulated response
    const enhancedPrompts = await simulateLLMAnalysis(userInputs);
    
    console.log(`Generated ${enhancedPrompts.length} enhanced prompts for different demographics`);
    
    return NextResponse.json({ 
      enhancedPrompts,
      message: "Prompts enhanced successfully"
    });
  } catch (error) {
    console.error("Error enhancing prompts:", error);
    return NextResponse.json(
      { error: `Error enhancing prompts: ${error.message}` },
      { status: 500 }
    );
  }
} 