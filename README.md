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
2. **Ad Review (/review)**: Upload ad creatives to get AI-powered analysis and recommendations
   - Upload any image, video, or document file
   - Add context about your target audience and campaign goals
   - Receive personalization scores, audience alignment metrics, and detailed insights
   - Chat with the AI for follow-up questions and additional recommendations

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