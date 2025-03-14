"use client"

import React, { useState, useRef } from 'react';
import axios from 'axios';
import styles from './page.module.css';

// Loading Screen Component
const LoadingScreen = () => (
  <div className={styles['loading-overlay']}>
    <div className={styles['loading-content']}>
      <div className={styles['loading-spinner']}></div>
      <h2 className={styles['loading-title']}>Avata is reviewing your ad</h2>
      <p className={styles['loading-message']}>
        Our AI is analyzing your creative for effectiveness, audience alignment, and personalization opportunities.
      </p>
      <div className={styles['loading-progress']}>
        <div className={styles['loading-progress-bar']}></div>
      </div>
    </div>
  </div>
);

function App() {
  const [adFile, setAdFile] = useState(null);
  const [adContext, setAdContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Handle file upload via input
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAdFile(e.target.files[0]);
      setError(null);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAdFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  // Handle browse button click
  const onBrowseClick = () => {
    fileInputRef.current.click();
  };

  // Handle context input change
  const handleContextChange = (e) => {
    setAdContext(e.target.value);
  };

  // Handle chat message change
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  // Submit ad for review
  const submitForReview = async () => {
    if (!adFile) {
      setError('Please upload an ad file to review');
      return;
    }
  
    // Set analyzing state to show loading screen
    setIsAnalyzing(true);
    setError(null);
    
    // Record start time for minimum loading duration
    const startTime = Date.now();
    const minimumLoadingTime = 1800; // 1.8 seconds minimum loading time
    
    // Create form data for API submission
    const formData = new FormData();
    formData.append('adFile', adFile);
    formData.append('adContext', adContext);
    
    try {
      // Send to backend API
      const response = await axios.post('http://localhost:5001/api/review-ad', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Calculate remaining time to meet minimum loading duration
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
      
      // If API call was fast, wait the remaining time
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      // Update state with review data
      setReviewData(response.data);
      
      // Add initial system message to chat
      setChatHistory([
        { 
          role: 'assistant', 
          content: 'Your ad has been analyzed. ' + (response.data.summary || 'I can provide detailed insights and recommendations.') + ' Would you like specific suggestions for improvement?'
        }
      ]);
      
    } catch (err) {
      console.error('Error submitting ad for review:', err);
      setError('Error analyzing your ad: ' + (err.response?.data?.error || err.message || 'Please try again'));
    } finally {
      // Ensure loading screen is hidden even if there's an error
      setIsAnalyzing(false);
    }
  };

  // Send chat message
  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message to chat immediately
    const updatedChatHistory = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(updatedChatHistory);
    
    // Clear input
    setMessage('');
    
    try {
      // Send to backend API with context of the original review
      const response = await axios.post('http://localhost:5001/api/review-chat', {
        message,
        reviewData,
        adContext,
      });
      
      // Add assistant response to chat
      setChatHistory([
        ...updatedChatHistory,
        { role: 'assistant', content: response.data.reply }
      ]);
      
    } catch (err) {
      setError('Error sending message. Please try again.');
      console.error('Error in review chat:', err);
    }
  };

  // Helper function to safely render HTML content
  const renderHTML = (html) => {
    return { __html: html };
  };

  return (
    <div className={styles['app-container']}>
      <header className={styles['app-header']}>
        <h1>Avata <span className={styles.highlight}>Ad Review</span></h1>
      </header>
      
      <main className={styles['main-content']}>
        {/* Display loading screen when analyzing */}
        {isAnalyzing && <LoadingScreen />}
        
        {!reviewData ? (
          // Upload interface
          <div className={styles['upload-container']}>
            <h2>Upload your ad for AI review</h2>
            
            <div 
              className={`${styles['upload-box']} ${dragActive ? styles['drag-active'] : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className={styles['file-input']}
                onChange={handleFileChange}
                accept="image/*,video/*,application/pdf"
              />
              
              {adFile ? (
                <div className={styles['file-preview']}>
                  <span className={styles['file-name']}>{adFile.name}</span>
                  <button className={styles['change-file-btn']} onClick={onBrowseClick}>Change file</button>
                </div>
              ) : (
                <div className={styles['upload-content']}>
                  <div className={styles['upload-icon']}>+</div>
                  <p>Drag & drop your ad file here</p>
                  <p className={styles['or-divider']}>or</p>
                  <button className={styles['browse-button']} onClick={onBrowseClick}>
                    Browse files
                  </button>
                </div>
              )}
            </div>
            
            <div className={styles['context-container']}>
              <h3>Add context</h3>
              <textarea
                value={adContext}
                onChange={handleContextChange}
                placeholder="Tell us about your target audience, campaign goals, and any specific aspects you'd like feedback on..."
                rows={4}
                className={styles['context-textarea']}
              />
              
              {error && <div className={styles['error-message']}>{error}</div>}
              
              <button 
                onClick={submitForReview}
                disabled={isAnalyzing || !adFile}
                className={styles['review-button']}
              >
                {isAnalyzing ? 'Analyzing...' : 'Review My Ad'}
              </button>
            </div>
          </div>
        ) : (
          // Review results and chat
          <div className={styles['review-container']}>
            <div className={styles['results-grid']}>
              {/* Ad Preview */}
              <div className={styles['ad-preview']}>
                <h3>Ad Preview</h3>
                {adFile && (
                  adFile.type.startsWith('image/') ? (
                    <img 
                      src={URL.createObjectURL(adFile)} 
                      alt="Ad preview" 
                      className={styles['preview-image']}
                    />
                  ) : adFile.type.startsWith('video/') ? (
                    <video 
                      src={URL.createObjectURL(adFile)} 
                      controls
                      className={styles['preview-video']}
                    />
                  ) : (
                    <div className={styles['file-preview-box']}>
                      <p>{adFile.name}</p>
                    </div>
                  )
                )}
              </div>
              
              {/* Analysis Results */}
              <div className={styles['analysis-results']}>
                <h3>Ad Analysis</h3>
                
                <div className={`${styles['score-card']} ${styles['personalization-score']}`}>
                  <h4>Personalization Score</h4>
                  <div className={styles.score}>{reviewData.analysis.personalizationScore.score}/10</div>
                </div>
                
                <div className={`${styles['score-card']} ${styles['audience-score']}`}>
                  <h4>Audience Alignment</h4>
                  <div className={styles.score}>{reviewData.analysis.audienceAlignment.category}</div>
                </div>
                
                <div className={`${styles['score-card']} ${styles['performance-score']}`}>
                  <h4>Predicted Performance</h4>
                  <div className={styles.metrics}>
                    <div>Click Rate: {reviewData.analysis.predictedPerformanceMetrics.predictedClickRate}</div>
                    <div>Conversion: {reviewData.analysis.predictedPerformanceMetrics.predictedConversionRate}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Key Insights */}
            <div className={styles['insights-section']}>
              {reviewData.analysis.summary ? (
                <div dangerouslySetInnerHTML={renderHTML(reviewData.analysis.summary)} />
              ) : (
                <>
                  <h3>Key Insights</h3>
                  <ul>
                    {reviewData.analysis.keyInsights.map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            
            {/* Recommendations */}
            <div className={styles['recommendations-section']}>
              <h3>Recommendations</h3>
              <ul>
                {reviewData.analysis.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
            
            {/* Chat Interface */}
            <div className={styles['chat-section']}>
              <h3>Chat with Avata AI</h3>
              
              <div className={styles['chat-messages']} ref={chatContainerRef}>
                {chatHistory.map((chat, index) => (
                  <div 
                    key={index} 
                    className={`${styles['chat-bubble']} ${styles[chat.role]}`}
                  >
                    {chat.role === 'assistant' ? (
                      <div dangerouslySetInnerHTML={renderHTML(chat.content)} />
                    ) : (
                      chat.content
                    )}
                  </div>
                ))}
              </div>
              
              <form className={styles['chat-input-form']} onSubmit={sendChatMessage}>
                <input
                  type="text"
                  value={message}
                  onChange={handleMessageChange}
                  placeholder="Ask a question about your ad review..."
                  className={styles['chat-input']}
                />
                <button type="submit" className={styles['send-button']}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;