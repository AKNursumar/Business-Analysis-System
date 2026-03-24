"""
URL configuration for Business Analysis System.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/', include('analysis_api.urls')),
]
