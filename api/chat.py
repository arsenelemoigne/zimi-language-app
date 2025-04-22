from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os

app = Flask(__name__)
CORS(app)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')
        context = data.get('context', {})
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # Create system prompt with context
        system_prompt = f"""You are Zimi, a friendly and patient Italian language tutor. You're currently teaching about "{context.get('phrase')}" ({context.get('translation')}).

Current Lesson Context:
- Phrase: {context.get('phrase')}
- Translation: {context.get('translation')}
- Grammar: {context.get('grammarTip')}
- Cultural Context: {context.get('culturalTip')}

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

Remember: You're teaching a beginner, so keep it simple and encouraging!"""

        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=150
        )

        # Extract the response
        ai_response = response.choices[0].message.content

        return jsonify({
            'response': ai_response
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# For local development
if __name__ == '__main__':
    app.run(debug=True) 