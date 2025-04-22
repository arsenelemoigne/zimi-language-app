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

        const response = await fetch(window.ENV.OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.ENV.OPENAI_API_KEY}`
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
        console.error('Chat Error:', error);
        typingIndicator.remove();
        addMessage('I apologize, but I encountered an error. Please try again.', 'bot');
    }
}

// Check if user is logged in
function checkAuth() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail && window.location.pathname.includes('main.html')) {
        window.location.href = 'index.html';
    } else if (userEmail && window.location.pathname.includes('index.html')) {
        window.location.href = 'main.html';
    }
}

// User Management
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

function saveUser(userData) {
    const users = getUsers();
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
}

function findUser(email) {
    const users = getUsers();
    return users.find(user => user.email === email);
}

// Password Validation
function validatePassword(password) {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    
    return {
        length: minLength,
        upper: hasUpper,
        number: hasNumber,
        special: hasSpecial,
        isValid: minLength && hasUpper && hasNumber && hasSpecial
    };
}

// Handle signup form submission
function handleSignup(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(elem => elem.textContent = '');
    
    // Validate full name
    if (fullName.length < 2) {
        document.getElementById('nameError').textContent = 'Please enter your full name';
        return false;
    }
    
    // Check if email already exists
    if (findUser(email)) {
        document.getElementById('emailError').textContent = 'This email is already registered';
        return false;
    }
    
    // Validate password
    if (!validatePassword(password).isValid) {
        document.getElementById('passwordError').textContent = 'Password does not meet requirements';
        return false;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
        return false;
    }
    
    // Save user data
    const userData = {
        fullName,
        email,
        password,
        dateJoined: new Date().toISOString()
    };
    
    saveUser(userData);
    
    // Store current user email for session
    localStorage.setItem('userEmail', email);
    
    // Redirect to main page
    window.location.href = 'main.html';
    return false;
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(elem => elem.textContent = '');
    
    // Find user
    const user = findUser(email);
    
    if (!user || user.password !== password) {
        document.getElementById('emailError').textContent = 'Invalid email or password';
        return false;
    }
    
    // Store current user email for session
    localStorage.setItem('userEmail', email);
    window.location.href = 'main.html';
    return false;
}

// Handle logout
function logout() {
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
} 