"""The house-prices command: value one house."""
import argparse

from house_prices.value import OutsideData, load, value


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
    args = parser.parse_args(argv)
    model, meta = load()
    house = {k: v for k, v in vars(args).items() if k != "command"}
    try:
        v = value(house, model, meta)
    except OutsideData as refused:
        parser.exit(1, f"house-prices: no valuation: {refused}\n")
    print(f"£{v.price:,} (likely £{v.low // 1000}k–£{v.high // 1000}k)")
