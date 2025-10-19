import google.generativeai as genai
from django.conf import settings
from datetime import datetime, timedelta

class MoodAnalyzer:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def analyze_moods(self, moods_queryset):
        mood_summary = self._prepare_mood_data(moods_queryset)
        
        # If no moods, return early message
        if not mood_summary:
            return {
                'success': False,
                'message': 'No moods to analyze yet. Start tracking your moods!'
            }
        
        # Create prompt for Gemini
        prompt = self._create_analysis_prompt(mood_summary)
        
        # Call Gemini API
        try:
            # Generate content using Gemini
            response = self.model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.7,  # Creativity level (0-2)
                    'max_output_tokens': 500,  # Limit response length
                    'top_p': 0.95,  # Nucleus sampling (controls randomness)
                }
            )
            
            # Extract AI response
            analysis = response.text
            
            return {
                'success': True,
                'analysis': analysis,
                'moods_analyzed': len(mood_summary),
                'model_used': 'gemini-1.5-flash'
            }
            
        except Exception as e:
            # Handle specific Gemini errors
            error_message = str(e)
            
            if 'API_KEY_INVALID' in error_message:
                error_message = 'Invalid Gemini API key. Check your .env file.'
            elif 'RATE_LIMIT_EXCEEDED' in error_message:
                error_message = 'Too many requests. Wait a minute and try again.'
            elif 'SAFETY' in error_message:
                error_message = 'Content blocked by safety filters. Try different mood notes.'
            
            return {
                'success': False,
                'message': f'AI analysis failed: {error_message}'
            }
    
    def _prepare_mood_data(self, moods_queryset):
        # Get last 14 days of moods
        two_weeks_ago = datetime.now() - timedelta(days=14)
        recent_moods = moods_queryset.filter(created_at__gte=two_weeks_ago)
        # Format each mood as a simple entry
        mood_list = []
        for mood in recent_moods:
            date_str = mood.created_at.strftime('%Y-%m-%d')
            note_text = f" - {mood.note}" if mood.note else ""
            mood_list.append(f"{date_str}: {mood.mood}{note_text}")
        return mood_list
    
    def _create_analysis_prompt(self, mood_summary):
        mood_entries = "\n".join(mood_summary)
        prompt = f"""You are a supportive emotional wellness assistant. Analyze these mood journal entries from the past 2 weeks:
{mood_entries}

Please provide a brief, warm analysis with:

1. **Patterns**: What emotional patterns do you notice?
2. **Insights**: Any trends or observations about their emotional state?
3. **Suggestions**: 2-3 gentle, actionable suggestions to improve their wellbeing

Keep your response warm, supportive, and under 300 words. Use emojis sparingly for a friendly touch. Focus on being helpful and encouraging."""
        
        return prompt
