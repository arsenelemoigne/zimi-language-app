// This file handles API key access
function getOpenAIKey() {
    // For local testing with placeholder
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return localStorage.getItem('openai_api_key_admin') || '';
    }
    
    // For production use with environment variable
    // This will be an empty string until you set up Vercel environment variables
    return window.OPENAI_API_KEY || '';
}
