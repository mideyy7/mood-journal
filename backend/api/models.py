from django.db import models

# Create your models here.
class Mood(models.Model):
    MOOD_CHOICES = [
        ('happy', '😊 Happy'),
        ('sad', '😢 Sad'),
        ('excited', '🤩 Excited'),
        ('calm', '😌 Calm'),
        ('angry', '😖 Angry'),
    ]

    mood = models.CharField(max_length=20, choices=MOOD_CHOICES)
    note = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#3B82F6')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.mood} - {self.created_at.strftime('%Y-%m-%d')}"