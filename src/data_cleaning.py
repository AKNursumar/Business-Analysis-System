import numpy as np
import pandas as pd

def clean_dataset(df):
    # Remove duplicates
    df = df.drop_duplicates()

    # Separate numeric and non-numeric columns safely
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    categorical_cols = df.select_dtypes(exclude=[np.number]).columns

    # Handle missing values
    for col in numeric_cols:
        df[col] = df[col].fillna(df[col].median())

    for col in categorical_cols:
        df[col] = df[col].fillna(df[col].mode()[0])

    return df