"""Train, measure and save the model: python -m house_prices.train"""
import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import KFold, cross_val_predict, train_test_split
from sklearn.pipeline import make_pipeline

from house_prices.clean import load_sales
from house_prices.features import features, prepare

MODELS = Path("models")
SEED = 1460


def main() -> None:
    sales = load_sales("data/homes.csv")
    X, y = features(sales), sales["price"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=SEED
    )
    model = make_pipeline(prepare(), LinearRegression()).fit(X_train, y_train)
    folds = KFold(5, shuffle=True, random_state=SEED)
    unseen = y_train - cross_val_predict(model, X_train, y_train, cv=folds)
    below, above = np.quantile(unseen, [0.1, 0.9])
    meta = {
        "test_mae": round(mean_absolute_error(y_test, model.predict(X_test))),
        "below": round(below, -2), "above": round(above, -2),
        "areas": sorted(X_train["area"].unique()),
        "sqft": [int(X_train["sqft"].min()), int(X_train["sqft"].max())],
        "month": int(X["months"].max()),
    }
    MODELS.mkdir(exist_ok=True)
    joblib.dump(model, MODELS / "model.joblib")
    (MODELS / "model.json").write_text(json.dumps(meta, indent=1) + "\n")
    print(f"trained on {len(X_train)} sales, tested on {len(X_test)}")
    print(f"test MAE £{meta['test_mae']:,}")
    print(f"interval {meta['below']:+,.0f} / {meta['above']:+,.0f} pounds")


if __name__ == "__main__":
    main()
