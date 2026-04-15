from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import (
    FileUploadSerializer,
    UserRegistrationSerializer,
    AnalysisJobSerializer,
    AnalysisHistorySerializer
)
from .services import DataAnalysisService
from .models import AnalysisJob


class UserRegistrationView(APIView):
    """
    API endpoint for user registration
    POST /api/register/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_file(request):
    """
    API endpoint to upload and analyze a CSV file.
    Requires authentication. Results are saved to database.
    """
    serializer = FileUploadSerializer(data=request.data)
    
    if serializer.is_valid():
        file = serializer.validated_data['file']
        filename = file.name
        
        try:
            # Read file bytes
            file_bytes = file.read()
            
            # Analyze
            result = DataAnalysisService.analyze_file(file_bytes)
            
            # Save to database
            analysis_job = AnalysisJob.objects.create(
                user=request.user,
                filename=filename,
                status='completed',
                result_json=result
            )
            
            # Return result with job ID
            response_data = result.copy()
            response_data['job_id'] = analysis_job.id
            
            return Response(response_data, status=status.HTTP_200_OK)
        except ValueError as e:
            # Save failed analysis to database
            analysis_job = AnalysisJob.objects.create(
                user=request.user,
                filename=filename,
                status='failed',
                error_message=str(e)
            )
            return Response(
                {"error": str(e), "job_id": analysis_job.id},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            # Save failed analysis to database
            analysis_job = AnalysisJob.objects.create(
                user=request.user,
                filename=filename,
                status='failed',
                error_message=f"An error occurred: {str(e)}"
            )
            return Response(
                {"error": f"An error occurred: {str(e)}", "job_id": analysis_job.id},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analysis_history(request):
    """
    API endpoint to get user's analysis history
    GET /api/analyses/
    """
    analyses = AnalysisJob.objects.filter(user=request.user)
    serializer = AnalysisHistorySerializer(analyses, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analysis_detail(request, job_id):
    """
    API endpoint to get specific analysis result
    GET /api/analyses/{job_id}/
    """
    try:
        analysis = AnalysisJob.objects.get(id=job_id, user=request.user)
        serializer = AnalysisJobSerializer(analysis)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except AnalysisJob.DoesNotExist:
        return Response(
            {"error": "Analysis not found"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint (no authentication required)
    """
    return Response({"status": "API is running"}, status=status.HTTP_200_OK)
