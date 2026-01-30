import pandas as pd

def load_dataset(file_path):
    df = pd.read_csv(file_path)
    return df

def basic_inspection(df):
    print("\nShape:", df.shape)
    print("\nColumns:", df.columns.tolist())
    print("\nData Types:\n", df.dtypes)
    print("\nMissing Values:\n", df.isnull().sum())
    print("\nSample Data:\n", df.head())
