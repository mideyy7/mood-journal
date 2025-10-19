from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Mood
from .serializers import MoodSerializer
from .ai_service import MoodAnalyzer

class MoodViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on moods.
    Now includes AI analysis feature!
    """
    queryset = Mood.objects.all()
    serializer_class = MoodSerializer
    
    @action(detail=False, methods=['get'])
    def analyze(self, request):
        """
        New endpoint: GET /api/moods/analyze/
        
        Uses AI to analyze all moods and return insights.
        The @action decorator creates a custom route.
        detail=False means it's not for a specific mood (no ID needed)
        """
        
        # Get all moods (you could filter by user later)
        moods = self.get_queryset()
        
        # Initialize AI analyzer
        analyzer = MoodAnalyzer()
        
        # Get AI analysis
        result = analyzer.analyze_moods(moods)
        
        # Return response
        if result['success']:
            return Response({
                'analysis': result['analysis'],
                'moods_analyzed': result['moods_analyzed'],
                'model_used': result.get('model_used', 'unknown')  # Track which model
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': result['message']
            }, status=status.HTTP_400_BAD_REQUEST)