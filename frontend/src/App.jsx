import { useState, useEffect } from 'react';

// Replace with your Django URL
const API_URL = 'http://localhost:8000/api/moods/';

// Mood options with emojis and colors
const MOOD_OPTIONS = [
  { value: 'happy', emoji: '😊', label: 'Happy', color: '#FCD34D' },
  { value: 'sad', emoji: '😢', label: 'Sad', color: '#93C5FD' },
  { value: 'excited', emoji: '🤩', label: 'Excited', color: '#FB923C' },
  { value: 'calm', emoji: '😌', label: 'Calm', color: '#86EFAC' },
  { value: 'angry', emoji: '😠', label: 'Angry', color: '#FCA5A5' },
];

export default function MoodJournal() {
  // State: data storage in React
  const [moods, setMoods] = useState([]);
  const [formData, setFormData] = useState({
    mood: 'happy',
    note: '',
    color: '#FCD34D'
  });
  const [editingId, setEditingId] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelUsed, setModelUsed] = useState('');

  // Fetch moods when component loads
  useEffect(() => {
    fetchMoods();
  }, []);

  // READ: Get all moods from Django
  const fetchMoods = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setMoods(data);
    } catch (error) {
      console.error('Error fetching moods:', error);
    }
  };

  // CREATE or UPDATE: Save mood
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        // UPDATE existing mood
        await fetch(`${API_URL}${editingId}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // CREATE new mood
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      
      // Reset form and refresh list
      setFormData({ mood: 'happy', note: '', color: '#FCD34D' });
      setEditingId(null);
      fetchMoods();
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  // DELETE: Remove mood
  const handleDelete = async (id) => {
    if (!confirm('Delete this mood?')) return;
    
    try {
      await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
      fetchMoods();
    } catch (error) {
      console.error('Error deleting mood:', error);
    }
  };

  // Setup form for editing
  const handleEdit = (mood) => {
    setFormData({
      mood: mood.mood,
      note: mood.note,
      color: mood.color
    });
    setEditingId(mood.id);
  };

  // Update form when mood type changes
  const handleMoodChange = (value) => {
    const selected = MOOD_OPTIONS.find(m => m.value === value);
    setFormData({
      ...formData,
      mood: value,
      color: selected.color
    });
  };

  // NEW: Get AI Analysis
  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    
    try {
      const response = await fetch(`${API_URL}analyze/`);
      const data = await response.json();
      
      if (data.analysis) {
        setAiAnalysis(data.analysis);
        setModelUsed(data.model_used || 'gemini');
      } else {
        setAiAnalysis('Not enough data to analyze. Add more moods!');
      }
    } catch (error) {
      setAiAnalysis('Error connecting to AI. Check your API key.');
      console.error('AI analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            🌈 Mood Journal
          </h1>
          <p className="text-gray-600">Track your daily vibes</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {editingId ? '✏️ Edit Mood' : '✨ Add New Mood'}
          </h2>
          
          <div className="space-y-4">
            {/* Mood Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">
                How are you feeling?
              </label>
              <div className="grid grid-cols-5 gap-3">
                {MOOD_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleMoodChange(option.value)}
                    className={`p-4 rounded-xl transition-all ${
                      formData.mood === option.value
                        ? 'ring-4 ring-purple-500 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: option.color }}
                  >
                    <div className="text-4xl mb-1">{option.emoji}</div>
                    <div className="text-xs font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Note Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Add a note (optional)
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                placeholder="What's on your mind?"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                rows="3"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
              >
                {editingId ? 'Update' : 'Save'} Mood
              </button>
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ mood: 'happy', note: '', color: '#FCD34D' });
                  }}
                  className="px-6 bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mood List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">
              📅 Your Mood History
            </h2>
            
            {/* AI Analysis Button */}
            <button
              onClick={handleAIAnalysis}
              disabled={isAnalyzing || moods.length === 0}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                isAnalyzing || moods.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:scale-105'
              }`}
            >
              {isAnalyzing ? '🤔 Analyzing...' : '🤖 AI Insights'}
            </button>
          </div>

          {/* AI Analysis Display */}
          {aiAnalysis && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-purple-200">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-3xl">🤖</div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-1">
                    AI Analysis
                  </h3>
                  <p className="text-sm text-purple-600">
                    Based on your recent mood patterns • Powered by {modelUsed}
                  </p>
                </div>
              </div>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {aiAnalysis}
              </div>
            </div>
          )}
          
          {moods.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow">
              <div className="text-6xl mb-4">🎭</div>
              <p className="text-gray-500">No moods yet. Add your first one!</p>
            </div>
          ) : (
            moods.map(mood => {
              const moodOption = MOOD_OPTIONS.find(m => m.value === mood.mood);
              return (
                <div
                  key={mood.id}
                  className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Emoji Badge */}
                    <div
                      className="text-4xl p-3 rounded-xl"
                      style={{ backgroundColor: mood.color }}
                    >
                      {moodOption?.emoji}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold capitalize">
                          {mood.mood}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(mood.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {mood.note && (
                        <p className="text-gray-600">{mood.note}</p>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(mood)}
                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(mood.id)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}