import numpy as np

def numeric_summary(df):
    numeric_cols = df.select_dtypes(include=np.number)

    summary = {
        "mean": numeric_cols.mean(),
        "median": numeric_cols.median(),
        "min": numeric_cols.min(),
        "max": numeric_cols.max(),
        "sum": numeric_cols.sum()
    }

    return summary
