export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, lesson } = req.body;

        // Prepare the conversation context
        const systemPrompt = `You are Zimi, a friendly and patient Italian language tutor. You're currently teaching about "${lesson.phrase}" (${lesson.translation}).

        Current Lesson Context:
        - Phrase: ${lesson.phrase}
        - Translation: ${lesson.translation}
        - Grammar: ${lesson.grammarTip}
        - Cultural Context: ${lesson.culturalTip}
        
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
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                temperature: 0.7,
                max_tokens: 150
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'OpenAI API request failed');
        }

        return res.status(200).json({ response: data.choices[0].message.content });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 