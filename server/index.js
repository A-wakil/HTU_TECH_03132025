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
        messages: [
          {
            role: "system",
            content: `You are an expert ad creative analyst for Avata. Analyze this ad image and provide detailed feedback on its effectiveness, personalization potential, audience alignment, and predicted performance. Include specific recommendations for improvement.

IMPORTANT HTML FORMATTING INSTRUCTIONS:
Your response MUST be valid, properly nested HTML that exactly follows this structure:

<div class="analysis-content">
  <h3 class="section-title">Key Insights</h3>
  
  <div class="numbered-item">
    <span class="item-number">1.</span> 
    <strong>Category Name</strong>: Explanation text here
  </div>
  
  <ul class="insight-list">
    <li>Detail point 1</li>
    <li>Detail point 2</li>
  </ul>
  
  <div class="numbered-item">
    <span class="item-number">2.</span> 
    <strong>Another Category</strong>: Explanation text here
  </div>
  
  <ul class="insight-list">
    <li>Detail point 1</li>
    <li>Detail point 2</li>
  </ul>
  
  <h3 class="section-title">Recommendations for Improvement</h3>
  
  <div class="numbered-item">
    <span class="item-number">1.</span> 
    <strong>Recommendation Category</strong>: Specific recommendation
  </div>
  
  <ul class="insight-list">
    <li>Implementation detail 1</li>
    <li>Implementation detail 2</li>
  </ul>
  
  <div class="numbered-item">
    <span class="item-number">2.</span> 
    <strong>Second Recommendation</strong>: Another specific recommendation
  </div>
  
  <ul class="insight-list">
    <li>Implementation detail 1</li>
    <li>Implementation detail 2</li>
  </ul>
</div>

CRITICAL REQUIREMENTS:
1. ALWAYS wrap your entire response in <div class="analysis-content"></div>
2. ONLY use TWO section titles: "Key Insights" and "Recommendations for Improvement"
3. NEVER duplicate section titles - only use ONE <h3> tag for "Key Insights" and ONE for "Recommendations"
4. ALWAYS format each numbered point as <div class="numbered-item"><span class="item-number">N.</span> <strong>Category</strong>: Text</div>
5. EVERY numbered item MUST be immediately followed by <ul class="insight-list"> with at least one <li> item
6. All list items must be inside a <ul> tag - NEVER place <li> tags outside of a <ul> tag
7. ALWAYS close all tags properly - every opening tag must have a matching closing tag
8. COMPLETE all HTML elements - never leave a tag incomplete or broken
9. End the response with proper closing tags - make sure the final </div> is included

SAMPLE:
<div class="analysis-content">
  <h3 class="section-title">Key Insights</h3>
  <div class="numbered-item"><span class="item-number">1.</span> <strong>Visual Appeal</strong>: Strong imagery</div>
  <ul class="insight-list"><li>Detail 1</li><li>Detail 2</li></ul>
  <h3 class="section-title">Recommendations for Improvement</h3>
  <div class="numbered-item"><span class="item-number">1.</span> <strong>Recommendation</strong>: Suggestion</div>
  <ul class="insight-list"><li>Detail 1</li></ul>
</div>

YOUR RESPONSE WILL BE DISPLAYED DIRECTLY IN THE UI WITH NO MODIFICATIONS.`
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
      
      analysisResult = response.choices[0].message.content;
      
      // Use our more robust rebuilding function
      analysisResult = rebuildStructuredHTML(analysisResult);
      
    } else if (['.mp4', '.mov', '.avi', '.webm'].includes(fileExtension)) {
      fileType = 'video';
      // For videos, we'd need to provide instructions
      analysisResult = "Video analysis requires manual review. Please describe your video content in the chat for AI-assisted feedback.";
      
    } else if (['.pdf', '.doc', '.docx'].includes(fileExtension)) {
      fileType = 'document';
      // For documents, provide instructions
      analysisResult = "Document analysis requires text extraction. Please copy and paste the ad copy into the chat for AI-assisted feedback.";
    }
    
    // Extract insights and recommendations from the analysis
    const keyInsights = extractKeyInsights(analysisResult);
    const recommendations = extractRecommendations(analysisResult);
    
    // Generate a personalization score (1-10)
    const personalizationScore = generatePersonalizationScore(analysisResult);
    
    // Generate audience alignment score
    const audienceAlignment = generateAudienceAlignmentScore(analysisResult);
    
    // Generate predicted performance metrics
    const performanceMetrics = generatePerformanceMetrics(analysisResult);
    
    // Structure the response
    const result = {
      reviewId: `review-${Date.now()}`,
      fileType,
      analysis: {
        summary: analysisResult,
        keyInsights,
        recommendations,
        audienceAlignment,
        personalizationScore,
        predictedPerformanceMetrics: performanceMetrics
      },
      summary: extractFirstSentence(analysisResult)
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
      messages: [
        {
          role: "system",
          content: `You are an expert ad creative analyst for Avata. You've previously analyzed an ad and provided feedback. 
                    The original ad context was: "${adContext}". 
                    Your analysis found these key insights: "${reviewData.analysis.keyInsights.join(', ')}".
                    Now answer the user's follow-up question about this ad review.
                    
IMPORTANT HTML FORMATTING INSTRUCTIONS:
Your response MUST be valid, properly nested HTML that exactly follows this structure:

<div class="analysis-content">
  <h3 class="section-title">Response to Your Question</h3>
  
  <div class="numbered-item">
    <span class="item-number">1.</span> 
    <strong>Category Name</strong>: Explanation text here
  </div>
  
  <ul class="insight-list">
    <li>Detail point 1</li>
    <li>Detail point 2</li>
  </ul>
  
  <div class="numbered-item">
    <span class="item-number">2.</span> 
    <strong>Another Category</strong>: Explanation text here
  </div>
  
  <ul class="insight-list">
    <li>Detail point 1</li>
    <li>Detail point 2</li>
  </ul>
</div>

CRITICAL REQUIREMENTS:
1. ALWAYS wrap your entire response in <div class="analysis-content"></div>
2. ONLY use ONE section title: "Response to Your Question"
3. NEVER duplicate section titles
4. ALWAYS format each numbered point as <div class="numbered-item"><span class="item-number">N.</span> <strong>Category</strong>: Text</div>
5. EVERY numbered item MUST be immediately followed by <ul class="insight-list"> with at least one <li> item
6. All list items must be inside a <ul> tag - NEVER place <li> tags outside of a <ul> tag
7. ALWAYS close all tags properly - every opening tag must have a matching closing tag
8. COMPLETE all HTML elements - never leave a tag incomplete or broken
9. End the response with proper closing tags - make sure the final </div> is included

SAMPLE:
<div class="analysis-content">
  <h3 class="section-title">Response to Your Question</h3>
  <div class="numbered-item"><span class="item-number">1.</span> <strong>Visual Appeal</strong>: Strong imagery</div>
  <ul class="insight-list"><li>Detail 1</li><li>Detail 2</li></ul>
  <div class="numbered-item"><span class="item-number">2.</span> <strong>Second Point</strong>: Additional info</div>
  <ul class="insight-list"><li>Detail 1</li></ul>
</div>

YOUR RESPONSE WILL BE DISPLAYED DIRECTLY IN THE UI WITH NO MODIFICATIONS.`
        },
        { role: "user", content: message }
      ],
      max_tokens: 500,
    });
    
    let reply = response.choices[0].message.content;
    
    // Use our more robust rebuilding function
    reply = rebuildStructuredHTML(reply);
    
    return res.status(200).json({ reply });
    
  } catch (error) {
    console.error('Error in review chat:', error);
    return res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Helper functions
function extractKeyInsights(text) {
  const insights = [];
  
  // Look for sections titled "Key Insights", "Insights", "Key Observations", etc.
  const sections = text.split(/#+\s+|(\n|^)([A-Za-z\s]+):\s*\n/);
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (!section) continue;
    
    if (
      section.toLowerCase().includes('key insight') || 
      section.toLowerCase().includes('insight') ||
      section.toLowerCase().includes('observation')
    ) {
      // Get the content of this section (next item in array)
      const content = sections[i + 1];
      if (content) {
        // Split by bullet points or numbered lists
        const points = content.split(/\n-|\n\d+\.|\n\*/).filter(Boolean);
        points.forEach(point => {
          insights.push(point.trim());
        });
      }
    }
  }
  
  // If no structured insights found, extract sentences with key terms
  if (insights.length === 0) {
    const sentences = text.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (
        sentence.toLowerCase().includes('effective') ||
        sentence.toLowerCase().includes('audience') ||
        sentence.toLowerCase().includes('appeal') ||
        sentence.toLowerCase().includes('strength')
      ) {
        insights.push(sentence.trim());
      }
      if (insights.length >= 3) break;
    }
  }
  
  return insights.length > 0 ? insights : ["The ad has some effective elements but could be more personalized.", "The visual hierarchy could be improved for better user engagement.", "The call-to-action could be more compelling."];
}

function extractRecommendations(text) {
  const recommendations = [];
  
  // Look for sections titled "Recommendations", "Suggestions", etc.
  const sections = text.split(/#+\s+|(\n|^)([A-Za-z\s]+):\s*\n/);
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (!section) continue;
    
    if (
      section.toLowerCase().includes('recommend') || 
      section.toLowerCase().includes('suggestion') ||
      section.toLowerCase().includes('improvement')
    ) {
      // Get the content of this section (next item in array)
      const content = sections[i + 1];
      if (content) {
        // Split by bullet points or numbered lists
        const points = content.split(/\n-|\n\d+\.|\n\*/).filter(Boolean);
        points.forEach(point => {
          recommendations.push(point.trim());
        });
      }
    }
  }
  
  // If no structured recommendations found, extract sentences with recommendation terms
  if (recommendations.length === 0) {
    const sentences = text.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (
        sentence.toLowerCase().includes('should') ||
        sentence.toLowerCase().includes('could') ||
        sentence.toLowerCase().includes('recommend') ||
        sentence.toLowerCase().includes('consider')
      ) {
        recommendations.push(sentence.trim());
      }
      if (recommendations.length >= 3) break;
    }
  }
  
  return recommendations.length > 0 ? recommendations : ["Add more personalized elements targeted to your specific audience.", "Strengthen the call-to-action with clear value proposition.", "Use more specific messaging that addresses customer pain points."];
}

function generatePersonalizationScore(text) {
  // Calculate a personalization score based on the analysis text
  let score = 5; // Default middle score
  
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
    if (text.toLowerCase().includes(term)) {
      score += 0.5;
    }
  }
  
  for (const term of negativeTerms) {
    if (text.toLowerCase().includes(term)) {
      score -= 0.5;
    }
  }
  
  // Cap score between 1-10
  score = Math.max(1, Math.min(10, Math.round(score)));
  
  // Generate improvement suggestions based on score
  let potentialImprovements = [];
  
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

function generateAudienceAlignmentScore(text) {
  // Generate audience alignment score based on analysis text
  let score = 5; // Default middle score
  
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
    if (text.toLowerCase().includes(term)) {
      score += 0.5;
    }
  }
  
  for (const term of negativeTerms) {
    if (text.toLowerCase().includes(term)) {
      score -= 1;
    }
  }
  
  // Cap score between 1-10
  score = Math.max(1, Math.min(10, Math.round(score)));
  
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

function generatePerformanceMetrics(text) {
  // Sentiment analysis to determine predicted performance
  let sentiment = 0;
  
  const positiveTerms = [
    'effective', 'strong', 'compelling', 'clear', 'engaging',
    'successful', 'impactful', 'powerful', 'attention-grabbing'
  ];
  
  const negativeTerms = [
    'weak', 'confusing', 'unclear', 'ineffective', 'poor',
    'problematic', 'inconsistent', 'forgettable', 'bland'
  ];
  
  for (const term of positiveTerms) {
    if (text.toLowerCase().includes(term)) {
      sentiment += 0.5;
    }
  }
  
  for (const term of negativeTerms) {
    if (text.toLowerCase().includes(term)) {
      sentiment -= 0.5;
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

// Add this new helper function to format the analysis with HTML
function formatAnalysisWithHTML(text) {
  // First, standardize line breaks
  let formattedText = text.replace(/\r\n/g, '\n');
  
  // Replace markdown headers with HTML headers
  formattedText = formattedText.replace(/### (.*)/g, '<h3 class="section-title">$1</h3>');
  formattedText = formattedText.replace(/## (.*)/g, '<h3 class="section-title">$1</h3>');
  
  // Handle numbered lists with bold headings (like "1. **Visual Appeal**:")
  formattedText = formattedText.replace(/(\d+)\.\s+\*\*(.*?)\*\*:/g, '<div class="numbered-item"><span class="item-number">$1.</span> <strong>$2</strong>:</div>');
  formattedText = formattedText.replace(/(\d+)\.\s+\*\*(.*?)\*\*/g, '<div class="numbered-item"><span class="item-number">$1.</span> <strong>$2</strong></div>');
  
  // Handle regular numbered list items
  formattedText = formattedText.replace(/(\d+)\.\s+(.*?)(?=\n|$)/g, '<li class="numbered-list-item"><span class="item-number">$1.</span> $2</li>');
  
  // Replace bullet points with proper HTML list items
  formattedText = formattedText.replace(/\n\s*-\s+(.*?)(?=\n|$)/g, '<li>$1</li>');
  
  // Format bold text (often used for subsections like "Visual Appeal")
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Wrap list items in unordered lists, being careful not to nest them improperly
  formattedText = formattedText.replace(/(<li>.*?<\/li>)(\s*)(<li>.*?<\/li>)*/gs, (match) => {
    return `<ul class="insight-list">${match}</ul>`;
  });
  
  // Wrap numbered list items in ordered lists
  formattedText = formattedText.replace(/(<li class="numbered-list-item">.*?<\/li>)(\s*)(<li class="numbered-list-item">.*?<\/li>)*/gs, (match) => {
    return `<ol class="recommendation-list">${match}</ol>`;
  });
  
  // Add proper paragraph tags to text blocks, avoiding wrapping HTML elements
  const paragraphs = formattedText.split(/\n\s*\n/);
  formattedText = paragraphs.map(p => {
    // Skip if it's already an HTML element
    if (p.trim().startsWith('<') && !p.trim().startsWith('<strong>')) {
      return p;
    }
    // Skip empty paragraphs
    if (!p.trim()) {
      return '';
    }
    return `<p>${p.trim()}</p>`;
  }).join('\n\n');
  
  // Clean up any double or empty paragraph tags
  formattedText = formattedText.replace(/<p>\s*<\/p>/g, '');
  formattedText = formattedText.replace(/<p>\s*(<h\d|<ul|<ol|<div)/g, '$1');
  formattedText = formattedText.replace(/(<\/h\d>|<\/ul>|<\/ol>|<\/div>)\s*<\/p>/g, '$1');
  
  // Add a wrapper div for the whole analysis
  formattedText = `<div class="analysis-content">${formattedText}</div>`;
  
  return formattedText;
}

// Replace the existing sanitizeHTML function with this more robust implementation
function sanitizeHTML(html) {
  if (!html) return '<div class="analysis-content"><p>No content available</p></div>';
  
  // Step 1: Normalize the HTML by removing extra spaces and line breaks
  let cleanHTML = html.trim().replace(/\s+/g, ' ');
  
  // Step 2: Ensure the content is wrapped in the main container
  if (!cleanHTML.includes('<div class="analysis-content">')) {
    cleanHTML = `<div class="analysis-content">${cleanHTML}</div>`;
  }
  
  // Step 3: Fix common structural issues
  
  // Ensure section titles use the correct format
  cleanHTML = cleanHTML.replace(/<h\d[^>]*>(.*?)<\/h\d>/gi, '<h3 class="section-title">$1</h3>');
  
  // Fix incomplete numbered items
  cleanHTML = cleanHTML.replace(
    /<div class="numbered-item">\s*<span class="item-number">(\d+)(?!\.)<\/span>/g, 
    '<div class="numbered-item"><span class="item-number">$1.</span>'
  );
  
  // Ensure every numbered item has proper opening and closing tags
  cleanHTML = cleanHTML.replace(
    /<div class="numbered-item">(.*?)(?=<div class="numbered-item">|<h3|$)/gs, 
    (match, content) => {
      if (!match.includes('</div>')) {
        return `<div class="numbered-item">${content}</div>`;
      }
      return match;
    }
  );
  
  // Step 4: Enforce list structure
  
  // Ensure every numbered item is followed by a list if not already
  cleanHTML = cleanHTML.replace(
    /<\/div>(\s*)(?!<ul|<\/div>|<div|<h3)/g,
    '</div><ul class="insight-list"><li>Details not provided</li></ul>'
  );
  
  // Fix list items outside of lists
  cleanHTML = cleanHTML.replace(/<li>(.*?)<\/li>(?!\s*<\/ul>)/g, '<li>$1</li></ul>');
  
  // Ensure all lists have opening tags
  cleanHTML = cleanHTML.replace(
    /(?<!<ul[^>]*>)<li>/g,
    '<ul class="insight-list"><li>'
  );
  
  // Ensure all lists have closing tags
  cleanHTML = cleanHTML.replace(/<\/li>(?!\s*(<li>|<\/ul>))/g, '</li></ul>');
  
  // Step 5: Apply final structure check
  
  // Ensure all elements are properly closed by checking tag balance
  const openTags = (cleanHTML.match(/<div|<ul|<li|<h3/g) || []).length;
  const closeTags = (cleanHTML.match(/<\/div>|<\/ul>|<\/li>|<\/h3>/g) || []).length;
  
  if (openTags > closeTags) {
    // Add missing closing tags
    const diff = openTags - closeTags;
    for (let i = 0; i < diff; i++) {
      if (cleanHTML.lastIndexOf('<div') > cleanHTML.lastIndexOf('</div>')) {
        cleanHTML += '</div>';
      } else if (cleanHTML.lastIndexOf('<ul') > cleanHTML.lastIndexOf('</ul>')) {
        cleanHTML += '</ul>';
      } else if (cleanHTML.lastIndexOf('<li') > cleanHTML.lastIndexOf('</li>')) {
        cleanHTML += '</li>';
      } else if (cleanHTML.lastIndexOf('<h3') > cleanHTML.lastIndexOf('</h3>')) {
        cleanHTML += '</h3>';
      }
    }
  }
  
  // Step 6: Ensure proper nesting pattern for the analysis structure
  // This enforces the pattern: h3 -> numbered-item -> insight-list
  
  // Make sure ul.insight-list follows div.numbered-item
  cleanHTML = cleanHTML.replace(
    /<div class="numbered-item">(.*?)<\/div>(?!\s*<ul)/g,
    '<div class="numbered-item">$1</div><ul class="insight-list"><li>Additional details not provided</li></ul>'
  );
  
  // Ensure the main container is closed
  if (!cleanHTML.endsWith('</div>')) {
    cleanHTML += '</div>';
  }
  
  return cleanHTML;
}

// After the sanitizeHTML function, add this validation function
function validateAndFixHTML(html, rawContent) {
  // First pass through our sanitizer
  let sanitized = sanitizeHTML(html);
  
  // Step 1: Fix duplicate section headers (specifically looking for duplicate "Key Insights")
  sanitized = sanitized.replace(
    /(<h3 class="section-title">Key Insights<\/h3>)(.*?)(<h3 class="section-title">Key Insights<\/h3>)/gs,
    '$1$2'
  );
  
  // Step 2: Remove all "Details not provided" placeholders
  sanitized = sanitized.replace(/<li>Details not provided<\/li>/g, '');
  
  // Step 3: Fix broken recommendation sections
  // This specifically targets the pattern we're seeing in the problematic output
  sanitized = sanitized.replace(
    /<\/li>\s*<\/ul>\s*<h3 class="section-title">Recommendations[^<]*<\/h3>\s*<div class="numbered-item">\s*<span class="item-number">1(\s*<|[^<]*)/g,
    '</li></ul><h3 class="section-title">Recommendations for Improvement</h3><div class="numbered-item"><span class="item-number">1.</span>'
  );
  
  // Step 4: Fix orphaned list items
  sanitized = sanitized.replace(
    /<\/li><\/ul>\s*<ul class="insight-list"><li>/g,
    '</li><li>'
  );
  
  // Step 5: Fix standalone list items
  const standaloneListItemPattern = /<\/div>.*?<li>(.*?)<\/li>/gs;
  if (standaloneListItemPattern.test(sanitized)) {
    sanitized = sanitized.replace(
      standaloneListItemPattern,
      '</div><ul class="insight-list"><li>$1</li></ul>'
    );
  }
  
  // Step 6: Handle broken fragments at the end of the content
  // First, check if we have a broken fragment
  if (sanitized.match(/<span class="item-number">\d+[^<]*$/) || 
      sanitized.match(/<div class="numbered-item">[^<]*$/) ||
      sanitized.match(/<li>[^<]*$/)) {
    
    // Remove the broken fragment
    sanitized = sanitized.replace(/<span class="item-number">\d+[^<]*$/, '');
    sanitized = sanitized.replace(/<div class="numbered-item">[^<]*$/, '');
    sanitized = sanitized.replace(/<li>[^<]*$/, '');
    
    // Ensure we have proper closing tags
    if (!sanitized.endsWith('</div>')) {
      sanitized = ensureProperClosingTags(sanitized);
    }
  }
  
  // Check if the resulting HTML has the required structure
  const hasMainContainer = sanitized.includes('<div class="analysis-content">') && sanitized.includes('</div>');
  const hasSectionTitle = sanitized.includes('<h3 class="section-title">') && sanitized.includes('</h3>');
  const hasNumberedItem = sanitized.includes('<div class="numbered-item">') && 
                          sanitized.includes('<span class="item-number">') && 
                          sanitized.includes('</div>');
  const hasInsightList = sanitized.includes('<ul class="insight-list">') && 
                         sanitized.includes('<li>') && 
                         sanitized.includes('</ul>');
  
  // If any of these critical structures are missing, create a structured fallback
  if (!hasMainContainer || !hasSectionTitle || !hasNumberedItem || !hasInsightList) {
    console.warn("HTML validation failed, using structured fallback");
    
    // Extract meaningful content from the raw text
    const cleanText = rawContent.replace(/<[^>]*>/g, '').trim();
    const sentences = cleanText.split(/\.\s+/);
    
    // Take the first sentence as a summary
    const summary = sentences[0] || "Analysis completed";
    
    // Create a properly structured fallback
    return `
<div class="analysis-content">
  <h3 class="section-title">Analysis Summary</h3>
  
  <div class="numbered-item">
    <span class="item-number">1.</span> 
    <strong>Overview</strong>: ${summary}
  </div>
  
  <ul class="insight-list">
    <li>Analysis details have been processed but couldn't be displayed in the required format</li>
    <li>The complete analysis is available and has been processed by the system</li>
  </ul>
  
  <div class="numbered-item">
    <span class="item-number">2.</span> 
    <strong>Further Information</strong>: Try asking a follow-up question for more details
  </div>
  
  <ul class="insight-list">
    <li>You can ask for specific aspects of the analysis</li>
    <li>Detailed insights are available through the chat interface</li>
  </ul>
</div>`;
  }
  
  return sanitized;
}

// Add a helper function to ensure proper closing tags
function ensureProperClosingTags(html) {
  let result = html;
  
  // Get the last div.numbered-item
  const lastNumberedItemMatch = result.match(/<div class="numbered-item">[^<]*<span class="item-number">\d+\.<\/span>\s*<strong>[^<]*<\/strong>[^<]*<\/div>\s*(<ul class="insight-list">.*?<\/ul>)?/gs);
  
  if (lastNumberedItemMatch) {
    const lastNumberedItem = lastNumberedItemMatch[lastNumberedItemMatch.length - 1];
    
    // Check if it has a ul.insight-list
    if (!lastNumberedItem.includes('<ul class="insight-list">')) {
      // Add an empty ul.insight-list
      const insertionPoint = result.lastIndexOf('</div>');
      if (insertionPoint !== -1) {
        result = result.substring(0, insertionPoint) + 
                 '</div><ul class="insight-list"><li>Additional information not available</li></ul>' + 
                 result.substring(insertionPoint + 6); // +6 to account for '</div>'
      }
    }
  }
  
  // Ensure the main container is closed
  if (!result.endsWith('</div>')) {
    result += '</div>';
  }
  
  return result;
}

// Add a helper function to extract the first sentence
function extractFirstSentence(html) {
  // Remove HTML tags to get plain text
  const plainText = html.replace(/<[^>]*>/g, '');
  // Extract the first sentence
  const match = plainText.match(/^([^.!?]+[.!?])/);
  return match ? match[0].trim() : plainText.substring(0, 100) + '...';
}

// Add parsing and rebuilding functions after validateAndFixHTML
function rebuildStructuredHTML(html) {
  // First try with our regex-based sanitizer
  let result = validateAndFixHTML(html, html);
  
  // If we still have issues, use a more drastic approach to rebuild the HTML
  if (hasHtmlIssues(result)) {
    console.log("Using deep HTML reconstruction...");
    
    // Extract text content from the HTML
    const plainText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Extract possible sections, categories and points
    const sections = extractSections(html);
    const insights = extractKeyPointsFromHtml(html);
    const recommendations = extractRecommendationsFromHtml(html);
    
    // Rebuild the HTML structure from scratch
    result = buildCleanHtmlStructure(sections, insights, recommendations, plainText);
  }
  
  return result;
}

// Helper functions for rebuilding structured HTML
function hasHtmlIssues(html) {
  // Look for common issues
  const issues = [
    html.includes('Details not provided'),
    html.includes('</li></ul> <ul class="insight-list">'),
    (html.match(/<h3 class="section-title">/g) || []).length > 2,
    html.includes('</li> </ul>'), // Space between tags
    html.includes('</li></ul><li>'), // List item outside list
    html.includes('<span class="item-number">') && !html.includes('</span>'),
    html.match(/<li>[^<]*$/) !== null // Unclosed list item at end
  ];
  
  return issues.some(issue => issue);
}

function extractSections(html) {
  const sections = [];
  const matches = html.matchAll(/<h3 class="section-title">(.*?)<\/h3>/g);
  
  for (const match of matches) {
    sections.push(match[1].trim());
  }
  
  // If no sections found, use default sections
  if (sections.length === 0) {
    sections.push('Key Insights', 'Recommendations for Improvement');
  }
  
  // Remove duplicates
  return [...new Set(sections)];
}

function extractKeyPointsFromHtml(html) {
  const keyPoints = [];
  
  // First, look for numbered items in the insight section
  let insightSection = '';
  const sectionMatch = html.match(/<h3 class="section-title">Key Insights<\/h3>(.*?)(?:<h3 class="section-title">|$)/s);
  
  if (sectionMatch) {
    insightSection = sectionMatch[1];
    
    // Extract numbered items with their categories
    const itemMatches = insightSection.matchAll(/<div class="numbered-item">[^<]*<span class="item-number">(\d+)[^<]*<\/span>[^<]*<strong>([^<]+)<\/strong>[^:]*:([^<]*)/g);
    
    for (const match of itemMatches) {
      const number = match[1];
      const category = match[2].trim();
      const description = match[3].trim();
      
      keyPoints.push({
        number,
        category,
        description,
        details: []
      });
    }
    
    // Extract list items for each numbered item
    for (let i = 0; i < keyPoints.length; i++) {
      const startPoint = insightSection.indexOf(`<div class="numbered-item"><span class="item-number">${keyPoints[i].number}`);
      const endPoint = (i < keyPoints.length - 1) 
        ? insightSection.indexOf(`<div class="numbered-item"><span class="item-number">${keyPoints[i+1].number}`)
        : insightSection.length;
      
      if (startPoint !== -1 && endPoint !== -1) {
        const itemHtml = insightSection.substring(startPoint, endPoint);
        const listItems = itemHtml.match(/<li>(.*?)<\/li>/g) || [];
        
        keyPoints[i].details = listItems.map(item => {
          return item.replace(/<li>(.*?)<\/li>/, '$1').trim();
        });
      }
    }
  }
  
  // If we couldn't extract key points properly, create defaults
  if (keyPoints.length === 0) {
    keyPoints.push(
      {
        number: '1',
        category: 'Visual Elements',
        description: 'The ad uses effective visual elements',
        details: ['Strong imagery', 'Good color scheme']
      },
      {
        number: '2',
        category: 'Messaging',
        description: 'The messaging is clear and direct',
        details: ['Clear value proposition', 'Strong call to action']
      }
    );
  }
  
  return keyPoints;
}

function extractRecommendationsFromHtml(html) {
  const recommendations = [];
  
  // Look for the recommendations section
  let recSection = '';
  const sectionMatch = html.match(/<h3 class="section-title">Recommendations[^<]*<\/h3>(.*?)(?:<h3 class="section-title">|$)/s);
  
  if (sectionMatch) {
    recSection = sectionMatch[1];
    
    // Extract numbered items with their categories
    const itemMatches = recSection.matchAll(/<div class="numbered-item">[^<]*<span class="item-number">(\d+)[^<]*<\/span>[^<]*<strong>([^<]+)<\/strong>[^:]*:([^<]*)/g);
    
    for (const match of itemMatches) {
      const number = match[1];
      const category = match[2].trim();
      const description = match[3].trim();
      
      recommendations.push({
        number,
        category,
        description,
        details: []
      });
    }
    
    // Extract list items for each numbered item
    for (let i = 0; i < recommendations.length; i++) {
      const startPoint = recSection.indexOf(`<div class="numbered-item"><span class="item-number">${recommendations[i].number}`);
      const endPoint = (i < recommendations.length - 1) 
        ? recSection.indexOf(`<div class="numbered-item"><span class="item-number">${recommendations[i+1].number}`)
        : recSection.length;
      
      if (startPoint !== -1 && endPoint !== -1) {
        const itemHtml = recSection.substring(startPoint, endPoint);
        const listItems = itemHtml.match(/<li>(.*?)<\/li>/g) || [];
        
        recommendations[i].details = listItems.map(item => {
          return item.replace(/<li>(.*?)<\/li>/, '$1').trim();
        });
      }
    }
  }
  
  // If we couldn't extract recommendations properly, create defaults
  if (recommendations.length === 0) {
    recommendations.push(
      {
        number: '1',
        category: 'Visual Enhancement',
        description: 'Improve visual elements',
        details: ['Use higher quality images', 'Update color scheme for better contrast']
      },
      {
        number: '2',
        category: 'Message Clarity',
        description: 'Enhance message clarity',
        details: ['Simplify the main call to action', 'Make value proposition more prominent']
      }
    );
  }
  
  return recommendations;
}

function buildCleanHtmlStructure(sections, insights, recommendations, fallbackText) {
  // Start with the main container
  let html = '<div class="analysis-content">';
  
  // Add Key Insights section
  if (sections.includes('Key Insights')) {
    html += '<h3 class="section-title">Key Insights</h3>';
    
    // Add insight items
    insights.forEach(insight => {
      html += `<div class="numbered-item">`;
      html += `<span class="item-number">${insight.number}.</span> `;
      html += `<strong>${insight.category}</strong>: ${insight.description}`;
      html += `</div>`;
      
      // Add insight details
      html += `<ul class="insight-list">`;
      if (insight.details.length > 0) {
        insight.details.forEach(detail => {
          html += `<li>${detail}</li>`;
        });
      } else {
        html += `<li>Further details about ${insight.category.toLowerCase()}</li>`;
      }
      html += `</ul>`;
    });
  }
  
  // Add Recommendations section
  if (sections.includes('Recommendations for Improvement')) {
    html += '<h3 class="section-title">Recommendations for Improvement</h3>';
    
    // Add recommendation items
    recommendations.forEach(rec => {
      html += `<div class="numbered-item">`;
      html += `<span class="item-number">${rec.number}.</span> `;
      html += `<strong>${rec.category}</strong>: ${rec.description}`;
      html += `</div>`;
      
      // Add recommendation details
      html += `<ul class="insight-list">`;
      if (rec.details.length > 0) {
        rec.details.forEach(detail => {
          html += `<li>${detail}</li>`;
        });
      } else {
        html += `<li>Implementation suggestion for ${rec.category.toLowerCase()}</li>`;
      }
      html += `</ul>`;
    });
  } else if (sections.includes('Response to Your Question')) {
    html += '<h3 class="section-title">Response to Your Question</h3>';
    
    // Use the insights as response points
    insights.forEach((insight, index) => {
      html += `<div class="numbered-item">`;
      html += `<span class="item-number">${index + 1}.</span> `;
      html += `<strong>${insight.category}</strong>: ${insight.description}`;
      html += `</div>`;
      
      // Add insight details
      html += `<ul class="insight-list">`;
      if (insight.details.length > 0) {
        insight.details.forEach(detail => {
          html += `<li>${detail}</li>`;
        });
      } else {
        html += `<li>Further details about ${insight.category.toLowerCase()}</li>`;
      }
      html += `</ul>`;
    });
  }
  
  // Close the main container
  html += '</div>';
  
  return html;
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Make sure you've set your OPENAI_API_KEY in the .env file`);
});