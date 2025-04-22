async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const userMessage = userInput.value.trim();
    
    if (!userMessage) return;
    
    // Add user message to chat
    addMessage(userMessage, 'user');
    userInput.value = '';

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.textContent = 'Zimi is typing...';
    document.getElementById('chatMessages').appendChild(typingIndicator);

    try {
        const currentLesson = lessons[currentLessonIndex];
        // Get API key using our new function
        const apiKey = getOpenAIKey();
        
        if (!apiKey) {
            throw new Error('API key not configured');
        }

        // Prepare the conversation context
        const conversationHistory = chatHistory.slice(-4); // Keep last 4 messages for context
        const systemPrompt = `You are Zimi, a friendly and patient Italian language tutor. You're currently teaching about "${currentLesson.phrase}" (${currentLesson.translation}).

        Current Lesson Context:
        - Phrase: ${currentLesson.phrase}
        - Translation: ${currentLesson.translation}
        - Grammar: ${currentLesson.grammarTip}
        - Cultural Context: ${currentLesson.culturalTip}
        
        Your teaching approach:
        1. Always respond in both Italian and English
        2. Create realistic scenarios to practice the current phrase
        3. Gently correct any mistakes in Italian usage
        4. Provide positive reinforcement
        5. Keep responses concise (2-3 sentences max)
        6. If the user seems confused, explain in simpler terms
        7. Occasionally ask questions to check understanding
        8. Share mini cultural tips related to the conversation

        Teaching Goals:
        - Help users practice the current phrase in context
        - Build confidence in using Italian
        - Make learning fun and engaging
        
        Remember: You're teaching a beginner, so keep it simple and encouraging!`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...conversationHistory,
                    { role: "user", content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 150
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('API Error:', data);
            throw new Error(data.error?.message || 'API request failed');
        }

        const botResponse = data.choices[0].message.content;

        // Remove typing indicator
        typingIndicator.remove();

        // Add bot response to chat
        addMessage(botResponse, 'bot');

        // Update chat history
        chatHistory.push(
            { role: "user", content: userMessage },
            { role: "assistant", content: botResponse }
        );

    } catch (error) {
        console.error('Chat error:', error);
        typingIndicator.remove();
        
        if (error.message === 'API key not configured') {
            addMessage("Sorry, there's a technical issue with the chatbot. Please try again later or contact support.", 'bot');
        } else {
            addMessage(`Error: ${error.message}. Please try again later.`, 'bot');
        }
    }
}
