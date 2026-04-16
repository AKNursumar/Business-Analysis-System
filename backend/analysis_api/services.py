import pandas as pd
import numpy as np
from io import StringIO, BytesIO
import base64
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for server environment
import matplotlib.pyplot as plt
import seaborn as sns


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

            # Store cleaned data for column chart generation
            cleaned_data = df.to_dict('records')

            return {
                "inspection": inspection,
                "cleaning_report": cleaning_report,
                "stats_before": stats_before,
                "stats_after": stats_after,
                "rows_before_outlier_removal": int(rows_before),
                "rows_after_outlier_removal": int(df.shape[0]),
                "outliers_removed": int(removed_rows),
                "cleaned_data": cleaned_data,  # Store for column chart generation
            }
        except Exception as e:
            raise ValueError(f"Error analyzing file: {str(e)}")

    @staticmethod
    def generate_stats_chart(stats):
        """Generate mean vs median bar chart"""
        try:
            print(f"[ChartGen] generate_stats_chart called with stats keys: {stats.keys()}")
            columns = list(stats.get('mean', {}).keys())
            if not columns:
                print("[ChartGen] No columns found for stats_chart")
                return None
            
            print(f"[ChartGen] Generating chart for {len(columns)} columns")
            means = [stats['mean'].get(col, 0) for col in columns]
            medians = [stats['median'].get(col, 0) for col in columns]
            
            fig, ax = plt.subplots(figsize=(12, 6))
            x = np.arange(len(columns))
            width = 0.35
            
            ax.bar(x - width/2, means, width, label='Mean', color='#667eea')
            ax.bar(x + width/2, medians, width, label='Median', color='#764ba2')
            
            ax.set_xlabel('Columns', fontsize=12)
            ax.set_ylabel('Values', fontsize=12)
            ax.set_title('Mean vs Median by Column', fontsize=14, fontweight='bold')
            ax.set_xticks(x)
            ax.set_xticklabels(columns, rotation=45, ha='right')
            ax.legend()
            fig.tight_layout()
            
            # Convert to base64
            buffer = BytesIO()
            fig.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            plt.close(fig)
            
            result = f"data:image/png;base64,{image_base64}"
            print(f"[ChartGen] Successfully generated stats_chart, size: {len(result)} bytes")
            return result
        except Exception as e:
            import traceback
            print(f"[ChartGen] Error generating stats chart: {str(e)}")
            print(traceback.format_exc())
            plt.close('all')
            return None

    @staticmethod
    def generate_minmax_chart(stats):
        """Generate min-max range line chart"""
        try:
            columns = list(stats.get('min', {}).keys())
            if not columns:
                return None
            
            mins = [stats['min'].get(col, 0) for col in columns]
            maxs = [stats['max'].get(col, 0) for col in columns]
            
            fig, ax = plt.subplots(figsize=(12, 6))
            
            ax.plot(columns, mins, marker='o', label='Min', color='#FF6B6B', linewidth=2)
            ax.plot(columns, maxs, marker='o', label='Max', color='#51CF66', linewidth=2)
            
            ax.set_xlabel('Columns', fontsize=12)
            ax.set_ylabel('Values', fontsize=12)
            ax.set_title('Min-Max Range by Column', fontsize=14, fontweight='bold')
            ax.tick_params(axis='x', rotation=45)
            ax.legend()
            ax.grid(True, alpha=0.3)
            fig.tight_layout()
            
            # Convert to base64
            buffer = BytesIO()
            fig.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            plt.close(fig)
            
            return f"data:image/png;base64,{image_base64}"
        except Exception as e:
            import traceback
            print(f"Error generating minmax chart: {str(e)}")
            print(traceback.format_exc())
            plt.close('all')
            return None

    @staticmethod
    def generate_cleaning_chart(cleaning_report, rows_before):
        """Generate cleaning summary pie chart"""
        try:
            duplicates = cleaning_report.get('duplicates_removed', 0)
            remaining = rows_before - duplicates
            
            fig, ax = plt.subplots(figsize=(8, 6))
            
            sizes = [duplicates, remaining]
            labels = ['Duplicates Removed', 'Remaining Data']
            colors = ['#FF6B6B', '#4ECDC4']
            
            ax.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
            ax.set_title('Data Cleaning Summary', fontsize=14, fontweight='bold')
            fig.tight_layout()
            
            # Convert to base64
            buffer = BytesIO()
            fig.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            plt.close(fig)
            
            return f"data:image/png;base64,{image_base64}"
        except Exception as e:
            import traceback
            print(f"Error generating cleaning chart: {str(e)}")
            print(traceback.format_exc())
            plt.close('all')
            return None

    @staticmethod
    def generate_outlier_comparison_chart(before, after):
        """Generate before/after outlier removal comparison"""
        try:
            fig, ax = plt.subplots(figsize=(8, 6))
            
            categories = ['Before', 'After']
            values = [before, after]
            colors = ['#667eea', '#51CF66']
            
            bars = ax.bar(categories, values, color=colors, width=0.6)
            
            # Add value labels on bars
            for bar in bars:
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height,
                        f'{int(height)}',
                        ha='center', va='bottom', fontsize=12, fontweight='bold')
            
            ax.set_ylabel('Number of Rows', fontsize=12)
            ax.set_title('Rows Before and After Outlier Removal', fontsize=14, fontweight='bold')
            fig.tight_layout()
            
            # Convert to base64
            buffer = BytesIO()
            fig.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            plt.close(fig)
            
            return f"data:image/png;base64,{image_base64}"
        except Exception as e:
            import traceback
            print(f"Error generating outlier comparison chart: {str(e)}")
            print(traceback.format_exc())
            plt.close('all')
            return None

    @staticmethod
    def generate_column_distribution_chart(df, column_name):
        """Generate distribution histogram for a specific column"""
        try:
            print(f"[ChartGen] Generating distribution chart for column: {column_name}")
            
            if column_name not in df.columns:
                print(f"[ChartGen] Column {column_name} not found")
                return None
            
            fig, ax = plt.subplots(figsize=(12, 6))
            
            # Get the data
            data = df[column_name].dropna()
            
            # Create histogram with KDE
            ax.hist(data, bins=30, color='#667eea', alpha=0.7, edgecolor='black', density=False)
            ax.set_xlabel(column_name, fontsize=12)
            ax.set_ylabel('Frequency', fontsize=12)
            ax.set_title(f'Distribution of {column_name}', fontsize=14, fontweight='bold')
            ax.grid(True, alpha=0.3, axis='y')
            
            fig.tight_layout()
            
            # Convert to base64
            buffer = BytesIO()
            fig.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            plt.close(fig)
            
            result = f"data:image/png;base64,{image_base64}"
            print(f"[ChartGen] Successfully generated distribution chart")
            return result
        except Exception as e:
            import traceback
            print(f"[ChartGen] Error generating distribution chart: {str(e)}")
            print(traceback.format_exc())
            plt.close('all')
            return None

    @staticmethod
    def generate_column_boxplot_chart(df, column_name):
        """Generate box plot for a specific column"""
        try:
            print(f"[ChartGen] Generating box plot for column: {column_name}")
            
            if column_name not in df.columns:
                print(f"[ChartGen] Column {column_name} not found")
                return None
            
            fig, ax = plt.subplots(figsize=(10, 6))
            
            # Get the data
            data = df[column_name].dropna()
            
            # Create box plot
            bp = ax.boxplot(data, vert=True, patch_artist=True, widths=0.5)
            
            # Customize colors
            for patch in bp['boxes']:
                patch.set_facecolor('#667eea')
                patch.set_alpha(0.7)
            
            for whisker in bp['whiskers']:
                whisker.set(color='#333', linewidth=1.5)
            
            for cap in bp['caps']:
                cap.set(color='#333', linewidth=1.5)
            
            ax.set_ylabel(column_name, fontsize=12)
            ax.set_title(f'Box Plot of {column_name}', fontsize=14, fontweight='bold')
            ax.grid(True, alpha=0.3, axis='y')
            
            fig.tight_layout()
            
            # Convert to base64
            buffer = BytesIO()
            fig.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            plt.close(fig)
            
            result = f"data:image/png;base64,{image_base64}"
            print(f"[ChartGen] Successfully generated box plot")
            return result
        except Exception as e:
            import traceback
            print(f"[ChartGen] Error generating box plot: {str(e)}")
            print(traceback.format_exc())
            plt.close('all')
            return None

    @staticmethod
    def generate_column_kde_chart(df, column_name):
        """Generate KDE (density) plot for a specific column"""
        try:
            print(f"[ChartGen] Generating KDE chart for column: {column_name}")
            
            if column_name not in df.columns:
                print(f"[ChartGen] Column {column_name} not found")
                return None
            
            fig, ax = plt.subplots(figsize=(12, 6))
            
            # Get the data
            data = df[column_name].dropna()
            
            # Create KDE plot with seaborn
            sns.kdeplot(data=data, ax=ax, color='#667eea', fill=True, alpha=0.6, linewidth=2)
            
            ax.set_xlabel(column_name, fontsize=12)
            ax.set_ylabel('Density', fontsize=12)
            ax.set_title(f'Density Plot of {column_name}', fontsize=14, fontweight='bold')
            ax.grid(True, alpha=0.3)
            
            fig.tight_layout()
            
            # Convert to base64
            buffer = BytesIO()
            fig.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            plt.close(fig)
            
            result = f"data:image/png;base64,{image_base64}"
            print(f"[ChartGen] Successfully generated KDE chart")
            return result
        except Exception as e:
            import traceback
            print(f"[ChartGen] Error generating KDE chart: {str(e)}")
            print(traceback.format_exc())
            plt.close('all')
            return None

    @staticmethod
    def generate_column_charts_from_data(cleaned_data, column_name):
        """
        Generate all column-specific charts from stored cleaned data
        
        Args:
            cleaned_data: List of dictionaries (from to_dict('records'))
            column_name: Name of the column to analyze
        
        Returns:
            Dictionary with distribution, boxplot, and kde charts
        """
        try:
            print(f"[ChartGen] Generating column charts from data for column: {column_name}")
            
            # Reconstruct dataframe from cleaned_data
            df = pd.DataFrame(cleaned_data)
            
            if column_name not in df.columns:
                print(f"[ChartGen] Column {column_name} not found in data")
                return {"error": f"Column {column_name} not found"}
            
            # Generate all three chart types
            charts = {
                'distribution': DataAnalysisService.generate_column_distribution_chart(df, column_name),
                'boxplot': DataAnalysisService.generate_column_boxplot_chart(df, column_name),
                'kde': DataAnalysisService.generate_column_kde_chart(df, column_name),
            }
            
            print(f"[ChartGen] Successfully generated all column charts for {column_name}")
            return charts
        except Exception as e:
            import traceback
            print(f"[ChartGen] Error generating column charts: {str(e)}")
            print(traceback.format_exc())
            return {"error": str(e)}
