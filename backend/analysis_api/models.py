from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class AnalysisJob(models.Model):
    """Model to store analysis job results with user association"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analyses')
    filename = models.CharField(max_length=255)
    upload_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='completed'
    )
    
    # Store the complete analysis result as JSON
    result_json = models.JSONField(
        default=dict,
        blank=True,
        help_text="Complete analysis results including inspection, cleaning, and statistics"
    )
    
    # Error message if analysis failed
    error_message = models.TextField(
        blank=True,
        null=True,
        help_text="Error message if analysis failed"
    )
    
    class Meta:
        ordering = ['-upload_date']
        indexes = [
            models.Index(fields=['user', '-upload_date']),
        ]
    
    def __str__(self):
        return f"{self.filename} - {self.user.username} ({self.upload_date})"
