from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MoodViewSet

router = DefaultRouter()
router.register(r'moods', MoodViewSet)

urlpatterns = [
    path('', include(router.urls))
]