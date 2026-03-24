from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import FileUploadSerializer
from .services import DataAnalysisService


@api_view(['POST'])
def analyze_file(request):
    """
    API endpoint to upload and analyze a CSV file
    """
    serializer = FileUploadSerializer(data=request.data)
    
    if serializer.is_valid():
        file = serializer.validated_data['file']
        
        try:
            # Read file bytes
            file_bytes = file.read()
            
            # Analyze
            result = DataAnalysisService.analyze_file(file_bytes)
            
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint
    """
    return Response({"status": "API is running"}, status=status.HTTP_200_OK)
