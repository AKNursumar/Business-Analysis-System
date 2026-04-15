from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    analyze_file,
    health_check,
    UserRegistrationView,
    analysis_history,
    analysis_detail
)

urlpatterns = [
    # Health check
    path('health/', health_check, name='health_check'),
    
    # Authentication endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', UserRegistrationView.as_view(), name='register'),
    
    # Analysis endpoints
    path('analyze/', analyze_file, name='analyze_file'),
    path('analyses/', analysis_history, name='analysis_history'),
    path('analyses/<int:job_id>/', analysis_detail, name='analysis_detail'),
]
