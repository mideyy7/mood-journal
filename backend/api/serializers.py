from rest_framework import serializers
from .models import Mood

class MoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mood
        fields = ['id', 'mood', 'note', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']


