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
            
            # Generate visualizations with error handling
            print("Generating charts...")
            charts = {}
            
            print("  - Generating stats_before chart...")
            charts['stats_before'] = DataAnalysisService.generate_stats_chart(result['stats_before'])
            print(f"    stats_before: {'Success' if charts['stats_before'] else 'Failed/None'}")
            
            print("  - Generating stats_after chart...")
            charts['stats_after'] = DataAnalysisService.generate_stats_chart(result['stats_after'])
            print(f"    stats_after: {'Success' if charts['stats_after'] else 'Failed/None'}")
            
            print("  - Generating minmax_before chart...")
            charts['minmax_before'] = DataAnalysisService.generate_minmax_chart(result['stats_before'])
            print(f"    minmax_before: {'Success' if charts['minmax_before'] else 'Failed/None'}")
            
            print("  - Generating minmax_after chart...")
            charts['minmax_after'] = DataAnalysisService.generate_minmax_chart(result['stats_after'])
            print(f"    minmax_after: {'Success' if charts['minmax_after'] else 'Failed/None'}")
            
            print("  - Generating cleaning chart...")
            charts['cleaning'] = DataAnalysisService.generate_cleaning_chart(result['cleaning_report'], result['rows_before_outlier_removal'])
            print(f"    cleaning: {'Success' if charts['cleaning'] else 'Failed/None'}")
            
            print("  - Generating outlier_comparison chart...")
            charts['outlier_comparison'] = DataAnalysisService.generate_outlier_comparison_chart(
                result['rows_before_outlier_removal'],
                result['rows_after_outlier_removal']
            )
            print(f"    outlier_comparison: {'Success' if charts['outlier_comparison'] else 'Failed/None'}")
            
            result['charts'] = charts
            print("All charts generated successfully!")
            print(f"Charts in result: {'charts' in result}")
            print(f"Charts content keys: {result['charts'].keys() if isinstance(result.get('charts'), dict) else 'Not a dict'}")
            print(f"Sample chart data (first 50 chars): {str(result['charts'].get('stats_before', 'N/A'))[:50]}")
            
            # Create a version without charts for database storage (charts are too large)
            db_result = result.copy()
            db_result['charts'] = {}  # Empty charts in DB to save space
            
            # Save to database
            analysis_job = AnalysisJob.objects.create(
                user=request.user,
                filename=filename,
                status='completed',
                result_json=db_result
            )
            
            # Return result with job ID and full charts in response
            response_data = result.copy()
            response_data['job_id'] = analysis_job.id
            
            print(f"Response includes charts: {'charts' in response_data}")
            print(f"Response data keys: {response_data.keys()}")
            
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_column_charts(request, job_id, column_name):
    """
    API endpoint to generate charts for a specific column
    GET /api/analyses/{job_id}/column/{column_name}/charts/
    """
    try:
        # Get the analysis job
        analysis = AnalysisJob.objects.get(id=job_id, user=request.user)
        
        if analysis.status != 'completed':
            return Response(
                {"error": "Analysis not completed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Extract cleaned data from result
        cleaned_data = analysis.result_json.get('cleaned_data', [])
        if not cleaned_data:
            return Response(
                {"error": "Cleaned data not available. Please re-upload the file."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        print(f"Generating column charts for job {job_id}, column {column_name}")
        
        # Generate the charts
        charts = DataAnalysisService.generate_column_charts_from_data(cleaned_data, column_name)
        
        if 'error' in charts:
            return Response(charts, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(charts, status=status.HTTP_200_OK)
        
    except AnalysisJob.DoesNotExist:
        return Response(
            {"error": "Analysis not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        import traceback
        print(f"Error generating column charts: {str(e)}")
        print(traceback.format_exc())
        return Response(
            {"error": f"Error generating charts: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
