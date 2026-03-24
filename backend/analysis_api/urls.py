from django.urls import path
from .views import analyze_file, health_check

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('analyze/', analyze_file, name='analyze_file'),
]
