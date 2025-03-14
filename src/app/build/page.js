"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brush, Loader2, Sparkles, ExternalLink, Check, ArrowRightCircle } from "lucide-react";
import Image from "next/image";

export default function BuildPage() {
  const [adType, setAdType] = useState("");
  const [demographic, setDemographic] = useState("");
  const [theme, setTheme] = useState("");
  const [platforms, setPlatforms] = useState("");
  const [customText, setCustomText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [enhancedPrompts, setEnhancedPrompts] = useState(null);
  const [error, setError] = useState(null);
  const [testResponse, setTestResponse] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deployStatus, setDeployStatus] = useState({});

  // Function to create a basic prompt that will be sent to the LLM for enhancement
  const createBasePrompt = () => {
    const demographicInfo = demographic === "multiple" ? "multiple demographics" : demographic;
    return `Ad Type: ${adType}
Target Demographic: ${demographicInfo}
Theme: ${theme}
Platform: ${platforms}
Custom Details: ${customText || "None provided"}`;
  };

  // Function to enhance the prompt using an LLM
  const enhancePromptWithLLM = async (basePrompt) => {
    setIsEnhancing(true);
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          basePrompt,
          adType,
          demographic,
          theme,
          platforms,
          customText 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to enhance prompt");
      }

      const data = await response.json();
      return data.enhancedPrompts;
    } catch (err) {
      console.error("Error enhancing prompt:", err);
      throw err;
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!adType || !demographic || !theme || !platforms) {
      setError("Please fill out all required fields");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGeneratedImages([]);
    setEnhancedPrompts(null);
    setDeployStatus({});

    try {
      // Step 1: Create a base prompt from user inputs
      const basePrompt = createBasePrompt();
      
      // Step 2: Enhance the prompt using an LLM and divide into 4 demographics
      const enhancedPrompts = await enhancePromptWithLLM(basePrompt);
      setEnhancedPrompts(enhancedPrompts);
      
      // Step 3: Generate images in parallel for all 4 demographics
      const imagePromises = enhancedPrompts.map(async (promptData) => {
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: promptData.prompt }),
        });

        const responseData = await response.json();
        
        if (!response.ok) {
          const errorMessage = responseData.error || response.statusText || "Unknown error";
          console.error(`API error for ${promptData.demographic}:`, errorMessage);
          throw new Error(`Failed to generate image: ${errorMessage}`);
        }

        return {
          demographic: promptData.demographic,
          description: promptData.description,
          prompt: promptData.prompt,
          imageUrl: responseData.imageUrl,
          id: `ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
      });
      
      // Wait for all image generation promises to resolve
      const results = await Promise.all(imagePromises);
      setGeneratedImages(results);
    } catch (err) {
      console.error("Error generating images:", err);
      setError(err.message || "Failed to generate images. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResponse(null);
    
    try {
      const response = await fetch("/api/generate-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      const data = await response.json();
      console.log("Test response:", data);
      setTestResponse(data);
    } catch (err) {
      console.error("Test failed:", err);
      setTestResponse({ error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleDeploy = (id) => {
    // Simulating a deployment process
    setDeployStatus(prev => ({
      ...prev,
      [id]: "deploying"
    }));

    // Simulate deployment completion after 2 seconds
    setTimeout(() => {
      setDeployStatus(prev => ({
        ...prev,
        [id]: "deployed"
      }));
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Ad Builder</h1>
        <p className="text-muted-foreground">
          Generate tailored ad creatives for multiple audience segments
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Brush className="h-5 w-5 text-primary" />
                Build Your Ad
              </CardTitle>
              <CardDescription>
                Customize settings to target specific audiences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ad Type</label>
                <Select value={adType} onValueChange={setAdType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ad type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="brand">Brand Awareness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Demographic</label>
                <Select value={demographic} onValueChange={setDemographic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target demographic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="young-adults">Young Adults (18-30)</SelectItem>
                    <SelectItem value="middle-aged">Middle Aged (30-50)</SelectItem>
                    <SelectItem value="seniors">Seniors (50+)</SelectItem>
                    <SelectItem value="multiple">Generate for All Demographics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Theme</label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="vibrant">Vibrant</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="eco-friendly">Eco-Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Platforms</label>
                <Select value={platforms} onValueChange={setPlatforms}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="print">Print</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Details (Optional)</label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Add specific details, product features, or messaging you want to include..."
                  className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              {error && (
                <div className="text-sm font-medium text-destructive mt-2 p-2 bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || isEnhancing}
                className="w-full inline-flex h-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg ring-offset-background transition-all duration-200 hover:shadow-xl hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-blue-700/20"
              >
                {isEnhancing ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-pulse text-blue-200" />
                    Enhancing Prompts...
                  </>
                ) : isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-200" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 text-blue-200" />
                    Generate Ad Creatives
                  </>
                )}
              </button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Ad Creatives</h2>
          
          {isEnhancing || isGenerating ? (
            <div className="flex h-64 flex-col items-center justify-center space-y-4 border rounded-lg bg-card p-8">
              {isEnhancing ? (
                <>
                  <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                  <div className="text-center">
                    <p className="font-medium">Enhancing your prompts with AI</p>
                    <p className="text-sm text-muted-foreground">Analyzing input and creating tailored prompts for each demographic...</p>
                  </div>
                </>
              ) : (
                <>
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <div className="text-center">
                    <p className="font-medium">Generating your ad creatives</p>
                    <p className="text-sm text-muted-foreground">Creating professional advertisements for your selected audiences...</p>
                  </div>
                </>
              )}
            </div>
          ) : generatedImages.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {generatedImages.map((item) => (
                <Card key={item.id} className="overflow-hidden transition-all hover:shadow-md">
                  <div 
                    className="relative aspect-video w-full overflow-hidden cursor-pointer"
                    onClick={() => handleImageClick(item)}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={`Ad for ${item.demographic}`}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                      <span className="text-white font-medium">Click to enlarge</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold capitalize">
                        {item.demographic}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {platforms}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      {item.description}
                    </p>
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleDeploy(item.id)}
                        disabled={deployStatus[item.id] === "deployed"}
                        className={`flex-1 inline-flex h-9 items-center justify-center rounded-md px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                          deployStatus[item.id] === "deployed" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        {deployStatus[item.id] === "deploying" ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Deploying...
                          </>
                        ) : deployStatus[item.id] === "deployed" ? (
                          <>
                            <Check className="mr-1 h-3 w-3" />
                            Deployed
                          </>
                        ) : (
                          <>
                            <ArrowRightCircle className="mr-1 h-3 w-3" />
                            Deploy Ad
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleImageClick(item)}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center text-center border rounded-lg bg-card p-8">
              <Brush className="mb-4 h-12 w-12 opacity-20" />
              <h3 className="text-lg font-medium mb-2">No ads generated yet</h3>
              <p className="text-muted-foreground max-w-md">
                Fill out the form and click "Generate Ad Creatives" to create professional advertisements tailored to your target audiences
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for viewing enlarged images */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" 
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="relative max-w-5xl w-full h-auto bg-white dark:bg-gray-900 rounded-lg shadow-xl" 
            onClick={e => e.stopPropagation()}
          >
            {/* Close button positioned outside the modal */}
            <button 
              className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-black dark:text-white shadow-xl hover:bg-gray-100 dark:hover:bg-gray-700 z-50 border-2 border-gray-200 dark:border-gray-700"
              onClick={handleCloseModal}
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            {/* Header with title and close button */}
            <div className="flex items-center justify-between border-b p-5 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-2xl font-bold" id="modal-title">Ad Preview</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
              >
                Close
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Left side - Image */}
              <div className="md:order-1">
                <div className="relative aspect-video w-full rounded-md overflow-hidden border-2 shadow-md">
                  <Image
                    src={selectedImage.imageUrl}
                    alt={`Ad for ${selectedImage.demographic}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
                  <button
                    onClick={handleCloseModal}
                    className="order-2 sm:order-1 w-full sm:w-auto px-6 py-3 rounded-md border-2 border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleDeploy(selectedImage.id);
                      handleCloseModal();
                    }}
                    disabled={deployStatus[selectedImage.id] === "deployed"}
                    className={`order-1 sm:order-2 w-full sm:w-auto px-6 py-3 rounded-md text-sm font-medium flex items-center justify-center ${
                      deployStatus[selectedImage.id] === "deployed" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {deployStatus[selectedImage.id] === "deployed" ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Already Deployed
                      </>
                    ) : (
                      <>
                        <ArrowRightCircle className="mr-2 h-4 w-4" />
                        Deploy This Ad
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Right side - Text content */}
              <div className="md:order-2 flex flex-col">
                <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg shadow-sm mb-4">
                  <div className="mb-2 flex items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mr-2">Target Audience</span>
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{platforms}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{selectedImage.demographic}</h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    {selectedImage.description}
                  </p>
                </div>
                
                <div className="mt-4 space-y-3 flex-grow">
                  <h4 className="text-base font-bold flex items-center">
                    <Sparkles className="h-4 w-4 text-primary mr-2" />
                    Prompt Details
                  </h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border text-sm leading-relaxed text-gray-700 dark:text-gray-300 overflow-auto max-h-60 shadow-sm">
                    <p className="whitespace-pre-wrap">{selectedImage.prompt}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 