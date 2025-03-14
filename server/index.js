const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// Upload and review endpoint
app.post('/api/review-ad', upload.single('adFile'), async (req, res) => {
  try {
    const { adContext } = req.body;
    const adFile = req.file;
    
    if (!adFile) {
      return res.status(400).json({ error: 'No ad file provided' });
    }
    
    // Determine file type and handle accordingly
    const fileExtension = path.extname(adFile.originalname).toLowerCase();
    let fileType = 'unknown';
    let analysisResult = '';
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension)) {
      fileType = 'image';
      
      // For images, use OpenAI's vision capabilities
      const imageBase64 = fs.readFileSync(adFile.path, { encoding: 'base64' });
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Updated from gpt-4-vision-preview to gpt-4o which supports vision
        response_format: { type: "json_object" }, // Enable JSON mode
        messages: [
          {
            role: "system",
            content: `You are an expert ad creative analyst for Avata. Analyze this ad image and provide detailed feedback on its effectiveness, personalization potential, audience alignment, and predicted performance. Include specific recommendations for improvement.

Your response MUST be a properly formatted JSON object with the following structure:

{
  "analysis": {
    "keyInsights": [
      {
        "category": "Visual Appeal",
        "description": "The ad uses effective visual elements",
        "details": [
          "Strong imagery with vibrant colors",
          "Good balance of text and visuals"
        ]
      },
      {
        "category": "Messaging",
        "description": "The messaging connects with the audience",
        "details": [
          "Clear value proposition",
          "Strong call to action"
        ]
      }
    ],
    "recommendations": [
      {
        "category": "Visual Enhancement",
        "description": "Improve specific visual elements",
        "details": [
          "Increase contrast between text and background",
          "Use more authentic imagery"
        ]
      },
      {
        "category": "Message Clarity",
        "description": "Enhance message clarity",
        "details": [
          "Simplify the main call to action",
          "Make value proposition more prominent"
        ]
      }
    ]
  }
}

Include at least 2-3 key insights and 2-3 recommendations, each with 2-3 specific details. Your JSON must be properly formatted with no syntax errors.`
          },
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Analyze this ad creative. Context provided by advertiser: ${adContext}` 
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/${fileExtension.substring(1)};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });
      
      try {
        // Parse the JSON response directly
        const jsonResponse = JSON.parse(response.choices[0].message.content);
        analysisResult = jsonResponse;
      } catch (jsonError) {
        console.error('Error parsing JSON from API response:', jsonError);
        // Fallback to string response if JSON parsing fails
        analysisResult = { 
          analysis: {
            keyInsights: [
              {
                category: "Analysis Error",
                description: "Could not parse the analysis result",
                details: ["Please try again with a clearer image"]
              }
            ],
            recommendations: []
          }
        };
      }
      
    } else if (['.mp4', '.mov', '.avi', '.webm'].includes(fileExtension)) {
      fileType = 'video';
      // For videos, we'd need to provide instructions
      analysisResult = {
        analysis: {
          keyInsights: [
            {
              category: "Video Analysis",
              description: "Video analysis requires manual review",
              details: ["Please describe your video content in the chat for AI-assisted feedback"]
            }
          ],
          recommendations: []
        }
      };
      
    } else if (['.pdf', '.doc', '.docx'].includes(fileExtension)) {
      fileType = 'document';
      // For documents, provide instructions
      analysisResult = {
        analysis: {
          keyInsights: [
            {
              category: "Document Analysis",
              description: "Document analysis requires text extraction",
              details: ["Please copy and paste the ad copy into the chat for AI-assisted feedback"]
            }
          ],
          recommendations: []
        }
      };
    }
    
    // Generate scores based on the analysis
    const personalizationScore = generatePersonalizationScore(analysisResult);
    const audienceAlignment = generateAudienceAlignmentScore(analysisResult);
    const performanceMetrics = generatePerformanceMetrics(analysisResult);
    
    // Generate HTML for display
    const htmlAnalysis = generateHTMLFromAnalysis(analysisResult);
    
    // Structure the response
    const result = {
      reviewId: `review-${Date.now()}`,
      fileType,
      analysis: {
        summary: htmlAnalysis,
        keyInsights: extractKeyInsights(analysisResult),
        recommendations: extractRecommendations(analysisResult),
        audienceAlignment,
        personalizationScore,
        predictedPerformanceMetrics: performanceMetrics
      },
      summary: extractFirstSentence(htmlAnalysis)
    };
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Error processing ad review:', error);
    return res.status(500).json({ error: 'Failed to process ad review' });
  }
});

// Chat endpoint for follow-up questions
app.post('/api/review-chat', async (req, res) => {
  try {
    const { message, reviewData, adContext } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get response from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Updated from gpt-4 to gpt-4o
      response_format: { type: "json_object" }, // Enable JSON mode
      messages: [
        {
          role: "system",
          content: `You are an expert ad creative analyst for Avata. You've previously analyzed an ad and provided feedback. 
                    The original ad context was: "${adContext}". 
                    Your analysis found these key insights: "${JSON.stringify(reviewData.analysis.keyInsights)}".
                    Now answer the user's follow-up question about this ad review.
                    
Return your response as a properly formatted JSON object with the following structure:

{
  "response": {
    "points": [
      {
        "category": "Response Category",
        "description": "Main response point",
        "details": [
          "Detail point 1",
          "Detail point 2"
        ]
      },
      {
        "category": "Another Category",
        "description": "Second main point",
        "details": [
          "Detail point 1",
          "Detail point 2"
        ]
      }
    ]
  }
}

Include at least 1-2 response points, each with 2-3 specific details. Your JSON must be properly formatted with no syntax errors.`
        },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
    });
    
    try {
      // Parse the JSON response directly
      const jsonResponse = JSON.parse(response.choices[0].message.content);
      
      // Convert JSON to HTML
      const htmlReply = generateHTMLFromChatResponse(jsonResponse);
      
      return res.status(200).json({ reply: htmlReply });
      
    } catch (jsonError) {
      console.error('Error parsing JSON from API chat response:', jsonError);
      // Fallback for parsing errors
      return res.status(200).json({ 
        reply: `<div class="analysis-content">
          <h3 class="section-title">Response to Your Question</h3>
          <div class="numbered-item"><span class="item-number">1.</span> <strong>Processing Error</strong>: I couldn't process that properly</div>
          <ul class="insight-list"><li>Please try rephrasing your question</li><li>You can ask something more specific about the ad</li></ul>
        </div>`
      });
    }
    
  } catch (error) {
    console.error('Error in review chat:', error);
    return res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Helper functions

// Extract key insights from the JSON analysis
function extractKeyInsights(analysisResult) {
  if (!analysisResult || !analysisResult.analysis || !analysisResult.analysis.keyInsights) {
    return ["The ad has some effective elements but could be more personalized.", 
            "The visual hierarchy could be improved for better user engagement.", 
            "The call-to-action could be more compelling."];
  }
  
  return analysisResult.analysis.keyInsights.map(insight => 
    `${insight.category}: ${insight.description}`
  );
}

// Extract recommendations from the JSON analysis
function extractRecommendations(analysisResult) {
  if (!analysisResult || !analysisResult.analysis || !analysisResult.analysis.recommendations) {
    return ["Add more personalized elements targeted to your specific audience.", 
            "Strengthen the call-to-action with clear value proposition.", 
            "Use more specific messaging that addresses customer pain points."];
  }
  
  return analysisResult.analysis.recommendations.map(rec => 
    `${rec.category}: ${rec.description}`
  );
}

// Generate personalization score based on analysis
function generatePersonalizationScore(analysisResult) {
  // Default middle score
  let score = 5;
  let potentialImprovements = [];
  
  if (analysisResult && analysisResult.analysis) {
    // Check insights and recommendations for personalization indicators
    const allText = JSON.stringify(analysisResult);
    
    // Positive indicators
    const positiveTerms = [
      'personalized', 'tailored', 'specific', 'targeted', 'customized',
      'relevant', 'individual', 'demographic', 'segment'
    ];
    
    // Negative indicators
    const negativeTerms = [
      'generic', 'general', 'broad', 'vague', 'unspecific',
      'impersonal', 'bland', 'standard', 'conventional'
    ];
    
    // Analyze text for indicators
    for (const term of positiveTerms) {
      if (allText.toLowerCase().includes(term)) {
        score += 0.5;
      }
    }
    
    for (const term of negativeTerms) {
      if (allText.toLowerCase().includes(term)) {
        score -= 0.5;
      }
    }
    
    // Cap score between 1-10
    score = Math.max(1, Math.min(10, Math.round(score)));
  }
  
  // Generate improvement suggestions based on score
  if (score < 5) {
    potentialImprovements = [
      "Add personalized elements specific to your target audience",
      "Include dynamic content that adapts to viewer preferences",
      "Consider segmenting your audience for more tailored messaging"
    ];
  } else if (score < 8) {
    potentialImprovements = [
      "Refine personalization by including more specific audience signals",
      "Add contextual elements that change based on user behavior"
    ];
  } else {
    potentialImprovements = [
      "Continue optimizing personalization with A/B testing",
      "Consider adding real-time personalization elements"
    ];
  }
  
  return {
    score,
    potentialImprovements
  };
}

// Generate audience alignment score based on analysis
function generateAudienceAlignmentScore(analysisResult) {
  // Default middle score
  let score = 5;
  
  if (analysisResult && analysisResult.analysis) {
    // Check insights and recommendations for audience alignment indicators
    const allText = JSON.stringify(analysisResult);
    
    // Positive indicators
    const positiveTerms = [
      'align', 'target audience', 'demographic', 'resonates', 'speaks to',
      'appeals to', 'relevant to', 'matches', 'appropriate'
    ];
    
    // Negative indicators
    const negativeTerms = [
      'misaligned', 'disconnect', 'irrelevant', 'inappropriate', 'mismatch',
      'wrong audience', 'doesn\'t resonate', 'doesn\'t appeal'
    ];
    
    // Analyze text for indicators
    for (const term of positiveTerms) {
      if (allText.toLowerCase().includes(term)) {
        score += 0.5;
      }
    }
    
    for (const term of negativeTerms) {
      if (allText.toLowerCase().includes(term)) {
        score -= 1;
      }
    }
    
    // Cap score between 1-10
    score = Math.max(1, Math.min(10, Math.round(score)));
  }
  
  // Determine category
  let category;
  if (score >= 8) {
    category = "Excellent";
  } else if (score >= 6) {
    category = "Good";
  } else if (score >= 4) {
    category = "Fair";
  } else {
    category = "Needs Improvement";
  }
  
  return {
    score,
    category
  };
}

// Generate performance metrics based on analysis
function generatePerformanceMetrics(analysisResult) {
  // Sentiment analysis to determine predicted performance
  let sentiment = 0;
  
  if (analysisResult && analysisResult.analysis) {
    const allText = JSON.stringify(analysisResult);
    
    const positiveTerms = [
      'effective', 'strong', 'compelling', 'clear', 'engaging',
      'successful', 'impactful', 'powerful', 'attention-grabbing'
    ];
    
    const negativeTerms = [
      'weak', 'confusing', 'unclear', 'ineffective', 'poor',
      'problematic', 'inconsistent', 'forgettable', 'bland'
    ];
    
    for (const term of positiveTerms) {
      if (allText.toLowerCase().includes(term)) {
        sentiment += 0.5;
      }
    }
    
    for (const term of negativeTerms) {
      if (allText.toLowerCase().includes(term)) {
        sentiment -= 0.5;
      }
    }
  }
  
  // Normalize sentiment to -3 to +3 range
  sentiment = Math.max(-3, Math.min(3, sentiment));
  
  // Base performance metrics
  const baseClickRate = 2.8;
  const baseConversionRate = 3.2;
  const baseEngagementRate = 4.5;
  
  // Adjust based on sentiment
  const clickRateFactor = 1 + (sentiment * 0.1);
  const conversionRateFactor = 1 + (sentiment * 0.08);
  const engagementRateFactor = 1 + (sentiment * 0.12);
  
  // Industry comparison
  let comparisonToIndustry;
  if (sentiment > 1.5) {
    comparisonToIndustry = "Well Above Average";
  } else if (sentiment > 0.5) {
    comparisonToIndustry = "Above Average";
  } else if (sentiment > -0.5) {
    comparisonToIndustry = "Average";
  } else if (sentiment > -1.5) {
    comparisonToIndustry = "Below Average";
  } else {
    comparisonToIndustry = "Well Below Average";
  }
  
  return {
    predictedClickRate: (baseClickRate * clickRateFactor).toFixed(1) + '%',
    predictedConversionRate: (baseConversionRate * conversionRateFactor).toFixed(1) + '%',
    predictedEngagementRate: (baseEngagementRate * engagementRateFactor).toFixed(1) + '%',
    confidenceLevel: "Medium",
    comparisonToIndustry
  };
}

// Function to generate HTML from JSON analysis
function generateHTMLFromAnalysis(analysisResult) {
  if (!analysisResult || !analysisResult.analysis) {
    return '<div class="analysis-content"><p>Analysis could not be processed.</p></div>';
  }
  
  let html = '<div class="analysis-content">';
  
  // Key Insights Section
  html += '<h3 class="section-title">Key Insights</h3>';
  
  if (analysisResult.analysis.keyInsights && analysisResult.analysis.keyInsights.length > 0) {
    analysisResult.analysis.keyInsights.forEach((insight, index) => {
      html += `<div class="numbered-item">
        <span class="item-number">${index + 1}.</span> 
        <strong>${insight.category}</strong>: ${insight.description}
      </div>
      <ul class="insight-list">`;
      
      if (insight.details && insight.details.length > 0) {
        insight.details.forEach(detail => {
          html += `<li>${detail}</li>`;
        });
      }
      
      html += '</ul>';
    });
  }
  
  // Recommendations Section
  html += '<h3 class="section-title">Recommendations for Improvement</h3>';
  
  if (analysisResult.analysis.recommendations && analysisResult.analysis.recommendations.length > 0) {
    analysisResult.analysis.recommendations.forEach((rec, index) => {
      html += `<div class="numbered-item">
        <span class="item-number">${index + 1}.</span> 
        <strong>${rec.category}</strong>: ${rec.description}
      </div>
      <ul class="insight-list">`;
      
      if (rec.details && rec.details.length > 0) {
        rec.details.forEach(detail => {
          html += `<li>${detail}</li>`;
        });
      }
      
      html += '</ul>';
    });
  }
  
  html += '</div>';
  return html;
}

// Function to generate HTML from chat JSON response
function generateHTMLFromChatResponse(jsonResponse) {
  if (!jsonResponse || !jsonResponse.response || !jsonResponse.response.points) {
    return '<div class="analysis-content"><p>Response could not be processed.</p></div>';
  }
  
  let html = '<div class="analysis-content">';
  html += '<h3 class="section-title">Response to Your Question</h3>';
  
  jsonResponse.response.points.forEach((point, index) => {
    html += `<div class="numbered-item">
      <span class="item-number">${index + 1}.</span> 
      <strong>${point.category}</strong>: ${point.description}
    </div>
    <ul class="insight-list">`;
    
    if (point.details && point.details.length > 0) {
      point.details.forEach(detail => {
        html += `<li>${detail}</li>`;
      });
    }
    
    html += '</ul>';
  });
  
  html += '</div>';
  return html;
}

// Extract first sentence for summary
function extractFirstSentence(html) {
  // Remove HTML tags to get plain text
  const plainText = html.replace(/<[^>]*>/g, '');
  // Extract the first sentence
  const match = plainText.match(/^([^.!?]+[.!?])/);
  return match ? match[0].trim() : plainText.substring(0, 100) + '...';
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Make sure you've set your OPENAI_API_KEY in the .env file`);
});