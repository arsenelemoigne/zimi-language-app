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

// Update password requirement visual indicators
function updatePasswordChecks(password) {
    const checks = validatePassword(password);
    
    document.getElementById('lengthCheck').classList.toggle('valid', checks.length);
    document.getElementById('upperCheck').classList.toggle('valid', checks.upper);
    document.getElementById('numberCheck').classList.toggle('valid', checks.number);
    document.getElementById('specialCheck').classList.toggle('valid', checks.special);
    
    return checks.isValid;
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
    const passwordChecks = validatePassword(password);
    if (!passwordChecks.isValid) {
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
        password, // In a real app, this should be hashed
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
    
    // Find user
    const user = findUser(email);
    
    if (!user || user.password !== password) {
        // In a real app, don't specify which is incorrect for security
        alert('Invalid email or password');
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

// Toggle signup form (in a real app, you would show a proper signup form)
function toggleSignup() {
    alert('In a real app, this would show a signup form!');
}

// Chat functionality
let isChatOpen = false;
let chatHistory = [];

function toggleChat() {
    const chatInterface = document.getElementById('chatInterface');
    if (chatInterface) {
        isChatOpen = !isChatOpen;
        chatInterface.classList.toggle('hidden');
        if (isChatOpen) {
            const currentLesson = lessons[currentLessonIndex];
            const welcomeMessage = `Hi! I'm Zimi, your language learning assistant. We're learning about "${currentLesson.phrase}" (${currentLesson.translation}). Would you like to practice using this phrase?`;
            addMessage(welcomeMessage, 'bot');
        }
    }
}

function addMessage(text, sender) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = text;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

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

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                lesson: currentLesson
            })
        });

        if (!response.ok) {
            throw new Error('Chat service temporarily unavailable');
        }

        const data = await response.json();
        const botResponse = data.response;

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
        addMessage("I apologize, but I'm having trouble connecting right now. Please try again in a moment.", 'bot');
    }
}

// Lesson Data
const lessons = [
    {
        id: 1,
        phrase: "Dove vai?",
        translation: "Where are you going?",
        grammarTip: "\"Dove vai?\" uses the verb 'andare' (to go) in its second person singular form 'vai'.",
        culturalTip: "In Italy, it's common to greet friends with this question as a way of showing interest in their day."
    },
    {
        id: 2,
        phrase: "Come stai?",
        translation: "How are you?",
        grammarTip: "\"Come stai?\" uses the verb 'stare' (to be/to stay) in its second person singular form 'stai'.",
        culturalTip: "Italians often use this greeting multiple times a day, even with people they've already seen."
    },
    {
        id: 3,
        phrase: "Grazie mille!",
        translation: "Thank you very much!",
        grammarTip: "\"Mille\" literally means 'thousand', making this phrase literally mean 'a thousand thanks'.",
        culturalTip: "Italians are very expressive with their gratitude, and this is one of the most common ways to show appreciation."
    },
    {
        id: 4,
        phrase: "Un caffè, per favore.",
        translation: "A coffee, please.",
        grammarTip: "In Italian, 'un' is the masculine indefinite article (a/an) used before 'caffè'. 'Per favore' is more formal than 'prego' for saying please.",
        culturalTip: "In Italy, 'un caffè' typically means an espresso. If you want an American-style coffee, you should ask for 'un caffè americano'."
    }
];

// Lesson Management
let currentLessonIndex = 0;

function getUserProgress() {
    const email = localStorage.getItem('userEmail');
    const progress = localStorage.getItem(`progress_${email}`);
    return progress ? JSON.parse(progress) : {
        completedLessons: [],
        currentLesson: 0
    };
}

function saveUserProgress(progress) {
    const email = localStorage.getItem('userEmail');
    localStorage.setItem(`progress_${email}`, JSON.stringify(progress));
    updateProgressDisplay();
}

function updateProgressDisplay() {
    const progress = getUserProgress();
    const completedCount = progress.completedLessons.length;
    document.getElementById('userProgress').textContent = `Progress: ${completedCount}/4`;
}

function loadLesson(index) {
    const lesson = lessons[index];
    document.getElementById('lessonNumber').textContent = lesson.id;
    document.getElementById('lessonPhrase').textContent = lesson.phrase;
    document.getElementById('lessonTranslation').textContent = lesson.translation;
    document.getElementById('grammarTip').textContent = lesson.grammarTip;
    document.getElementById('culturalTip').textContent = lesson.culturalTip;
    
    // Update navigation buttons
    document.getElementById('prevButton').disabled = index === 0;
    document.getElementById('nextButton').disabled = index === lessons.length - 1;
    
    // Update lesson status
    const progress = getUserProgress();
    const statusBadge = document.getElementById('lessonStatus');
    const completeButton = document.getElementById('completeButton');
    
    if (progress.completedLessons.includes(lesson.id)) {
        statusBadge.textContent = 'Completed';
        statusBadge.className = 'status-badge completed';
        completeButton.disabled = true;
    } else {
        statusBadge.textContent = 'In Progress';
        statusBadge.className = 'status-badge in-progress';
        completeButton.disabled = false;
    }
}

function previousLesson() {
    if (currentLessonIndex > 0) {
        currentLessonIndex--;
        loadLesson(currentLessonIndex);
    }
}

function nextLesson() {
    if (currentLessonIndex < lessons.length - 1) {
        currentLessonIndex++;
        loadLesson(currentLessonIndex);
    }
}

function markLessonComplete() {
    const progress = getUserProgress();
    const currentLesson = lessons[currentLessonIndex];
    
    if (!progress.completedLessons.includes(currentLesson.id)) {
        progress.completedLessons.push(currentLesson.id);
        saveUserProgress(progress);
        loadLesson(currentLessonIndex);
    }
}

// Initialize lesson on page load
document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            updatePasswordChecks(e.target.value);
        });
    }
    
    // Check authentication status
    checkAuth();
    
    // Initialize lesson if on main page
    if (window.location.pathname.includes('main.html')) {
        const progress = getUserProgress();
        currentLessonIndex = progress.currentLesson;
        loadLesson(currentLessonIndex);
        updateProgressDisplay();
    }
}); 