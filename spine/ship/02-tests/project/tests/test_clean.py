"""One test per planted fault: clean() must keep fixing each of them."""
import pandas as pd
import pytest

from house_prices.clean import clean

SALE = {
    "id": 1, "sold": "2024-03-15", "agent": "Hart", "area": "Riverside",
    "sqft": 1500, "beds": 3, "built": 1990.0, "garage": 1.0,
    "condition": 3, "price": "250000",
}


def raw(**changes) -> pd.DataFrame:
    return pd.DataFrame([{**SALE, **changes}])


def test_price_with_pound_sign_and_commas():
    assert clean(raw(price="£215,000"))["price"].iloc[0] == 215_000


def test_day_first_dates():
    sold = clean(raw(sold="08/01/2021"))["sold"].iloc[0]
    assert sold == pd.Timestamp("2021-01-08")


def test_square_metre_batch():
    out = clean(raw(agent="Keyline", sold="2023-05-02", sqft=100))
    assert out["sqft"].iloc[0] == 1076


def test_empty_garage_means_none():
    assert clean(raw(garage=None))["garage"].iloc[0] == 0


def test_duplicate_sales_dropped():
    assert len(clean(pd.concat([raw(), raw()]))) == 1


def test_transfer_dropped():
    assert clean(raw(price="10000")).empty


@pytest.mark.parametrize("spelling", ["Riverside ", "riverside", "RIVERSIDE"])
def test_area_spellings(spelling):
    assert clean(raw(area=spelling))["area"].iloc[0] == "Riverside"
