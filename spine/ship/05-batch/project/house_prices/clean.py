"""Millbrook's sales, cleaned: every rule from notebooks/clean.ipynb."""
import pandas as pd


def clean(raw: pd.DataFrame) -> pd.DataFrame:
    """Every fix from the cleaning notebook, in one chain."""
    iso = pd.to_datetime(raw["sold"], format="%Y-%m-%d", errors="coerce")
    uk = pd.to_datetime(raw["sold"], format="%d/%m/%Y", errors="coerce")
    sold = iso.fillna(uk)
    spring_2023 = sold.between("2023-04-01", "2023-06-30")
    in_m2 = (raw["agent"] == "Keyline") & spring_2023
    sqft = raw["sqft"].where(~in_m2, (raw["sqft"] * 10.764).round())
    price = raw["price"].astype(str).str.replace("[£,]", "", regex=True)
    return (
        raw.assign(
            sold=sold,
            area=raw["area"].str.strip().str.title(),
            garage=raw["garage"].fillna(0).astype(int),
            price=pd.to_numeric(price),
            sqft=sqft.astype(int),
            beds=raw["beds"].replace(12, 2),
        )
        .drop_duplicates()
        .query("price > 20_000")
    )


def load_sales(path: str) -> pd.DataFrame:
    """Read an agency export and clean it."""
    return clean(pd.read_csv(path))
