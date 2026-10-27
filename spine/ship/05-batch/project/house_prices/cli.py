"""The house-prices command: value one house, or a file of them."""
import argparse

import pandas as pd

from house_prices.value import OutsideData, load, value


def value_file(path: str, out: str, model, meta) -> None:
    houses = pd.read_csv(path)
    rows = []
    for house in houses.to_dict("records"):
        house["built"] = None if pd.isna(house["built"]) else house["built"]
        garage = house["garage"]
        house["garage"] = 0 if pd.isna(garage) else int(garage)
        try:
            v = value(house, model, meta)
            rows.append({"price": v.price, "low": v.low, "high": v.high})
        except OutsideData as refused:
            rows.append({"note": str(refused)})
    houses.join(pd.DataFrame(rows)).to_csv(out, index=False)
    print(f"valued {len(houses)} houses → {out}")


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(prog="house-prices")
    commands = parser.add_subparsers(dest="command", required=True)
    one = commands.add_parser("value", help="value one house")
    one.add_argument("--area", required=True)
    one.add_argument("--sqft", type=int, required=True)
    one.add_argument("--beds", type=int, required=True)
    one.add_argument("--built", type=float)
    one.add_argument("--garage", type=int, default=0)
    one.add_argument("--condition", type=int, default=3)
    many = commands.add_parser("batch", help="value every house in a CSV")
    many.add_argument("csv")
    many.add_argument("--out", required=True)
    args = parser.parse_args(argv)
    model, meta = load()
    if args.command == "batch":
        return value_file(args.csv, args.out, model, meta)
    house = {k: v for k, v in vars(args).items() if k != "command"}
    try:
        v = value(house, model, meta)
    except OutsideData as refused:
        parser.exit(1, f"house-prices: no valuation: {refused}\n")
    print(f"£{v.price:,} (likely £{v.low // 1000}k–£{v.high // 1000}k)")
