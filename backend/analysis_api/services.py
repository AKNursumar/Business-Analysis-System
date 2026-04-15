import pandas as pd
import numpy as np
from io import StringIO, BytesIO


class DataAnalysisService:
    """Service for analyzing and processing data"""

    @staticmethod
    def load_dataset(file_bytes):
        """Load CSV from bytes"""
        df = pd.read_csv(BytesIO(file_bytes))
        return df

    @staticmethod
    def basic_inspection(df):
        """Get basic inspection of dataframe"""
        return {
            "shape": list(df.shape),
            "columns": df.columns.tolist(),
            "data_types": df.dtypes.astype(str).to_dict(),
            "missing_values": df.isnull().sum().to_dict(),
            "sample_data": df.head(5).to_dict('records')
        }

    @staticmethod
    def clean_dataset(df):
        """Clean the dataset"""
        original_shape = df.shape
        
        # Remove duplicates
        df = df.drop_duplicates()
        duplicates_removed = original_shape[0] - df.shape[0]

        # Separate numeric and non-numeric columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        categorical_cols = df.select_dtypes(exclude=[np.number]).columns

        # Handle missing values
        numeric_missing = {}
        for col in numeric_cols:
            missing_count = df[col].isnull().sum()
            if missing_count > 0:
                numeric_missing[col] = int(missing_count)
                df[col] = df[col].fillna(df[col].median())

        categorical_missing = {}
        for col in categorical_cols:
            missing_count = df[col].isnull().sum()
            if missing_count > 0:
                categorical_missing[col] = int(missing_count)
                mode_value = df[col].mode()
                if len(mode_value) > 0:
                    df[col] = df[col].fillna(mode_value[0])

        return df, {
            "duplicates_removed": int(duplicates_removed),
            "numeric_columns_filled": numeric_missing,
            "categorical_columns_filled": categorical_missing,
        }

    @staticmethod
    def numeric_summary(df):
        """Get numeric summary statistics"""
        numeric_cols = df.select_dtypes(include=np.number)
        
        # Validate numeric columns exist
        if numeric_cols.empty:
            raise ValueError("No numeric columns found in dataset. Please upload a CSV with numeric data.")

        summary = {
            "mean": numeric_cols.mean().round(2).astype(float).to_dict(),
            "median": numeric_cols.median().round(2).astype(float).to_dict(),
            "min": numeric_cols.min().round(2).astype(float).to_dict(),
            "max": numeric_cols.max().round(2).astype(float).to_dict(),
            "sum": numeric_cols.sum().round(2).astype(float).to_dict()
        }

        return summary

    @staticmethod
    def remove_outliers_iqr(df):
        """Remove outliers using IQR method"""
        initial_rows = df.shape[0]
        numeric_cols = df.select_dtypes(include=np.number)

        for col in numeric_cols.columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1

            lower = Q1 - 1.5 * IQR
            upper = Q3 + 1.5 * IQR

            df = df[(df[col] >= lower) & (df[col] <= upper)]

        removed_rows = initial_rows - df.shape[0]
        return df, removed_rows

    @staticmethod
    def analyze_file(file_bytes):
        """Complete analysis pipeline"""
        try:
            # Load data
            df = DataAnalysisService.load_dataset(file_bytes)
            
            # Validate numeric columns exist early
            numeric_cols = df.select_dtypes(include=np.number)
            if numeric_cols.empty:
                raise ValueError("No numeric columns found. Please ensure your CSV contains numeric data.")

            # Inspect
            inspection = DataAnalysisService.basic_inspection(df)

            # Clean
            df, cleaning_report = DataAnalysisService.clean_dataset(df)

            # Before outlier removal
            rows_before = df.shape[0]
            stats_before = DataAnalysisService.numeric_summary(df)
            
            # Convert NaN to None for JSON serialization
            stats_before = {k: {col: (None if pd.isna(v) else float(v)) for col, v in vals.items()} for k, vals in stats_before.items()}

            # Remove outliers
            df, removed_rows = DataAnalysisService.remove_outliers_iqr(df)

            # After outlier removal
            stats_after = DataAnalysisService.numeric_summary(df)
            
            # Convert NaN to None for JSON serialization
            stats_after = {k: {col: (None if pd.isna(v) else float(v)) for col, v in vals.items()} for k, vals in stats_after.items()}

            return {
                "inspection": inspection,
                "cleaning_report": cleaning_report,
                "stats_before": stats_before,
                "stats_after": stats_after,
                "rows_before_outlier_removal": int(rows_before),
                "rows_after_outlier_removal": int(df.shape[0]),
                "outliers_removed": int(removed_rows),
            }
        except Exception as e:
            raise ValueError(f"Error analyzing file: {str(e)}")
