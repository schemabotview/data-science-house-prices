"""Value a house with the saved model, or refuse to."""
import json
from dataclasses import dataclass
from pathlib import Path

import joblib
import pandas as pd

from house_prices.features import FEATURES

MODELS = Path("models")


class OutsideData(ValueError):
    """The house is unlike every sale the model learned from."""


@dataclass(frozen=True)
class Valuation:
    price: int
    low: int
    high: int


def load(models: Path = MODELS):
    model = joblib.load(models / "model.joblib")
    meta = json.loads((models / "model.json").read_text())
    return model, meta


def value(house: dict, model, meta: dict) -> Valuation:
    if house["area"] not in meta["areas"]:
        areas = ", ".join(meta["areas"])
        raise OutsideData(f"no sales in {house['area']}; it knows {areas}")
    low, high = meta["sqft"]
    if not low <= house["sqft"] <= high:
        raise OutsideData(f"{house['sqft']} sq ft: it knows {low}–{high}")
    row = {"built": None, "garage": 0, "condition": 3, **house}
    X = pd.DataFrame([{**row, "months": meta["month"]}])[FEATURES]
    price = float(model.predict(X)[0])
    low_price, high_price = price + meta["below"], price + meta["above"]
    prices = (price, low_price, high_price)
    return Valuation(*(int(round(p, -3)) for p in prices))
