import pandas as pd
import os


# ------------------------------------------------
# FILE PATHS
# ------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

INPUT_FILE = os.path.join(
    BASE_DIR,
    "data",
    "projects.csv"
)

OUTPUT_FILE = os.path.join(
    BASE_DIR,
    "ml-engine",
    "data",
    "processed_projects.csv"
)


# ------------------------------------------------
# LOAD CSV
# ------------------------------------------------

print("Loading project dataset...")

df = pd.read_csv(INPUT_FILE)

print(f"Total projects found: {len(df)}")


# ------------------------------------------------
# CLEAN COLUMN NAMES
# ------------------------------------------------

df.columns = df.columns.str.strip()


# ------------------------------------------------
# CONVERT NUMERIC COLUMNS
# ------------------------------------------------

numeric_columns = [
    "Original Cost",
    "Revised Cost",
    "Cumulative Expenditure",
    "Physical Progress"
]

for column in numeric_columns:
    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )


# ------------------------------------------------
# COST ESCALATION
# ------------------------------------------------

df["cost_escalation"] = (
    (df["Revised Cost"] - df["Original Cost"])
    / df["Original Cost"]
) * 100

df["cost_escalation"] = (
    df["cost_escalation"]
    .replace([float("inf"), -float("inf")], 0)
    .fillna(0)
)


# ------------------------------------------------
# EXPENDITURE PERCENTAGE
# ------------------------------------------------

df["expenditure"] = (
    df["Cumulative Expenditure"]
    / df["Revised Cost"]
) * 100

df["expenditure"] = (
    df["expenditure"]
    .replace([float("inf"), -float("inf")], 0)
    .fillna(0)
)


# ------------------------------------------------
# DATE CONVERSION
# ------------------------------------------------

def convert_date(value):
    """
    Converts MM/YYYY into a datetime.
    Returns NaT for missing/invalid values.
    """

    if pd.isna(value):
        return pd.NaT

    value = str(value).strip()

    if value in ["-", "", "nan", "NaN"]:
        return pd.NaT

    try:
        return pd.to_datetime(
            value,
            format="%m/%Y"
        )
    except:
        return pd.NaT


df["Target_Date"] = df["Target DoC"].apply(convert_date)
df["Revised_Date"] = df["Revised DoC"].apply(convert_date)


# ------------------------------------------------
# SCHEDULE DELAY
# ------------------------------------------------

df["schedule_delay"] = (
    (df["Revised_Date"] - df["Target_Date"])
    .dt.days
    / 30.44
)

df["schedule_delay"] = (
    df["schedule_delay"]
    .fillna(0)
    .clip(lower=0)
)


# ------------------------------------------------
# PHYSICAL PROGRESS
# ------------------------------------------------

df["physical_progress"] = (
    df["Physical Progress"]
    .fillna(0)
)


# ------------------------------------------------
# ROUND VALUES
# ------------------------------------------------

df["cost_escalation"] = df["cost_escalation"].round(2)
df["expenditure"] = df["expenditure"].round(2)
df["schedule_delay"] = df["schedule_delay"].round(2)
df["physical_progress"] = df["physical_progress"].round(2)


# ------------------------------------------------
# SELECT ML DATA
# ------------------------------------------------

ml_columns = [
    "Sl. No",
    "Project Name",
    "Agency",
    "Project Code",
    "State",
    "Original Cost",
    "Revised Cost",
    "Cumulative Expenditure",
    "Physical Progress",
    "Target DoC",
    "Revised DoC",
    "cost_escalation",
    "schedule_delay",
    "expenditure",
    "physical_progress"
]

processed_df = df[ml_columns]


# ------------------------------------------------
# CREATE OUTPUT DIRECTORY
# ------------------------------------------------

os.makedirs(
    os.path.dirname(OUTPUT_FILE),
    exist_ok=True
)


# ------------------------------------------------
# SAVE PROCESSED DATA
# ------------------------------------------------

processed_df.to_csv(
    OUTPUT_FILE,
    index=False
)


# ------------------------------------------------
# DISPLAY RESULTS
# ------------------------------------------------

print("\n======================================")
print("   PROJECT DATA PREPROCESSING DONE")
print("======================================")

print(f"Projects processed : {len(processed_df)}")
print(f"Output file        : {OUTPUT_FILE}")

print("\nML Features:")

print("1. cost_escalation")
print("2. schedule_delay")
print("3. expenditure")
print("4. physical_progress")

print("\nFirst 5 processed projects:")

print(
    processed_df[
        [
            "Project Name",
            "cost_escalation",
            "schedule_delay",
            "expenditure",
            "physical_progress"
        ]
    ].head().to_string(index=False)
)

print("\n======================================")