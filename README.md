# Avata - AI-Powered Ad Optimization Platform

## What this application does

Avata is an AI-powered digital advertising platform that helps businesses create, review, and optimize their ad campaigns while reducing their carbon footprint. The platform offers:

- **Analytics Dashboard**: Track revenue, conversion rates, ROI, and environmental impact metrics
- **AI Agent Solutions**: Build, review, measure, and optimize ad content using AI assistants
- **Ad Review Tool**: Get AI-powered insights and recommendations on ad creatives
- **Carbon Footprint Tracking**: Monitor and reduce environmental impact of digital advertising

## Tech Stack & Frameworks

- **Frontend**: Next.js 14 (React), CSS Modules
- **Backend**: Node.js with Express
- **AI Integration**: OpenAI GPT-4o for ad analysis and content generation
- **Data Visualization**: Recharts for interactive analytics dashboards
- **Styling**: Custom CSS with responsive design principles
- **File Handling**: Multer for file uploads and management

## Navigating the Application

1. **Home Page (/)**: Analytics dashboard with key performance metrics and AI agent solutions overview
2. **GreenAds (/greenads)**: Track, analyze, and optimize your ads with real-time AI-powered insights.
   - All Your Ads in One Place: View and manage your uploaded creatives effortlessly.
   - Detailed Performance Metrics: See personalization scores, audience engagement, and effectiveness ratings for each ad.

3. **Build (/build)**: Create high-performing ads effortlessly with AI-driven insights and recommendations.
   - Seamless Uploads: Add any image, video, or document for instant analysis.
   - Smart Context Integration: Provide details about your audience and campaign goals for precise targeting.
   - Data-Driven Insights: Get personalization scores, audience alignment metrics, and strategic recommendations.
   - AI-Powered Optimization: Chat with the AI to refine your ad, explore alternatives, and maximize impact.

4. **Ad Review (/review)**: Upload ad creatives to get AI-powered analysis and recommendations
   - Upload any image, video, or document file
   - Add context about your target audience and campaign goals
   - Receive personalization scores, audience alignment metrics, and detailed insights
   - Chat with the AI for follow-up questions and additional recommendations

  
**UI Interface:**
<img width="1430" alt="image" src="https://github.com/user-attachments/assets/5e41a487-79ae-4aba-98b6-cf7e750b4b99" />


**Example of Ad generation:**
<img width="1493" alt="PNG image" src="https://github.com/user-attachments/assets/271a3817-c60f-4bda-9cef-ca6bbd49134a" />


## How to Run the Application

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn


### Manual Setup

```bash
# Clone the repository
git clone https://github.com/A-wakil/HTU_TECH_03132025.git
cd HTU_TECH_03132025

# Install dependencies for both frontend and backend
npm install

# Create .env file with your Replica API key
echo "REPLICATE_API_TOKEN=your_api_key_here" > .env

# Create .env file with your Replica API key
cd server
echo "OPENAI_API_KEY=your_api_key_here" > .env
cd ..

# Start the development servers
npm run dev

# Start the backend server
# In a different terminal window
cd server
node index.js
```

## Verifying Successful Startup

When the application starts successfully, you should see:

```
   ▲ Next.js 15.2.2
   - Local:        http://localhost:3000
   - Network:      http://172.25.32.252:3000
   - Environments: .env

 ✓ Starting...


Front-end available at: http://localhost:3000
Back-end API available at: http://localhost:5001

Server running on port 5001
```
