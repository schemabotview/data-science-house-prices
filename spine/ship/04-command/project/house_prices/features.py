"""What the model sees: the features, and how they are prepared."""
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder

NUMERIC = ["sqft", "beds", "built", "garage", "condition", "months"]
FEATURES = [*NUMERIC, "area"]


def months_since_2021(sold: pd.Series) -> pd.Series:
    """0 for a sale in January 2021, 1 for February, ..."""
    return (sold.dt.year - 2021) * 12 + sold.dt.month - 1


def features(sales: pd.DataFrame) -> pd.DataFrame:
    """The model's inputs, X, from cleaned sales."""
    return sales.assign(months=months_since_2021(sales["sold"]))[FEATURES]


def prepare() -> ColumnTransformer:
    """Fill missing numbers with the median; area as 0/1 columns."""
    return ColumnTransformer([
        ("numbers", SimpleImputer(strategy="median"), NUMERIC),
        ("area", OneHotEncoder(drop=["Eastfield"]), ["area"]),
    ])
