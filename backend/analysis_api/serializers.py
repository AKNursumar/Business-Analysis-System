from rest_framework import serializers


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
