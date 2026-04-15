from rest_framework import serializers
from django.contrib.auth.models import User
from .models import AnalysisJob


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()


class StatisticsSerializer(serializers.Serializer):
    mean = serializers.DictField(child=serializers.FloatField())
    median = serializers.DictField(child=serializers.FloatField())
    min = serializers.DictField(child=serializers.FloatField())
    max = serializers.DictField(child=serializers.FloatField())
    sum = serializers.DictField(child=serializers.FloatField())


class AnalysisResultSerializer(serializers.Serializer):
    inspection = serializers.DictField()
    cleaning_report = serializers.DictField()
    stats_before = StatisticsSerializer()
    stats_after = StatisticsSerializer()
    rows_before_outlier_removal = serializers.IntegerField()
    rows_after_outlier_removal = serializers.IntegerField()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': True}
        }
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({
                'password2': 'Passwords do not match'
            })
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class AnalysisJobSerializer(serializers.ModelSerializer):
    """Serializer for analysis job results"""
    class Meta:
        model = AnalysisJob
        fields = ('id', 'filename', 'upload_date', 'status', 'result_json', 'error_message')
        read_only_fields = ('id', 'upload_date', 'status')


class AnalysisHistorySerializer(serializers.ModelSerializer):
    """Serializer for analysis history list (minimal fields)"""
    rows_before = serializers.SerializerMethodField()
    rows_after = serializers.SerializerMethodField()
    
    class Meta:
        model = AnalysisJob
        fields = ('id', 'filename', 'upload_date', 'status', 'rows_before', 'rows_after')
    
    def get_rows_before(self, obj):
        """Extract rows_before_outlier_removal from result_json"""
        return obj.result_json.get('rows_before_outlier_removal', None)
    
    def get_rows_after(self, obj):
        """Extract rows_after_outlier_removal from result_json"""
        return obj.result_json.get('rows_after_outlier_removal', None)
