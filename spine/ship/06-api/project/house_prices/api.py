"""A web service: POST /value with a house, get a valuation back."""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from house_prices.value import OutsideData, load, value

app = FastAPI(title="house-prices")
model, meta = load()


class House(BaseModel):
    area: str
    sqft: int = Field(gt=0)
    beds: int = Field(ge=1)
    built: float | None = None
    garage: int = Field(0, ge=0)
    condition: int = Field(3, ge=1, le=5)


@app.post("/value")
def post_value(house: House) -> dict:
    try:
        v = value(house.model_dump(), model, meta)
    except OutsideData as refused:
        raise HTTPException(422, f"no valuation: {refused}")
    return {"price": v.price, "low": v.low, "high": v.high}
