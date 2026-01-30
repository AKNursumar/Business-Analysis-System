from src.data_loader import load_dataset, basic_inspection
from src.data_cleaning import clean_dataset
from src.analysis import numeric_summary
from src.outlier_handling import remove_outliers_iqr

# Load data
df = load_dataset("data/business.retailsales.csv")

# Inspect
basic_inspection(df)

# Clean
df = clean_dataset(df)

# Before outlier removal
print("\nStatistics BEFORE Outlier Removal")
stats_before = numeric_summary(df)
print(stats_before)

# Remove outliers
df = remove_outliers_iqr(df)

# After outlier removal
print("\nStatistics AFTER Outlier Removal")
stats_after = numeric_summary(df)
print(stats_after)

# Save cleaned dataset
df.to_csv("data/cleaned_dataset.csv", index=False)
