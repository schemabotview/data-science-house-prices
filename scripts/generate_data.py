#!/usr/bin/env python3
"""Generate Millbrook's house sales: data/homes.csv, data/areas.csv, data/listings.csv.

The data is SYNTHETIC and OURS, so the course can publish it and replay it exactly. Standard library
only (random.Random is the same stream on every platform and version), seeded, so a re-run writes
byte-identical files:

  python3 scripts/generate_data.py            write data/ (then copy into the spine step that adds it)
  python3 scripts/generate_data.py --check    exit 1 if data/ differs from what the seed produces

THE PRICING RULE is below (`price_of`) and is the course's hidden truth: Course 9.4 shows a linear model
recovering the £ per sq ft planted here. Until then, no scene and no narration may quote it.

  price = 40,000 + 120 × sqft + AREA_PREMIUM[area] + 9,000 × garage spaces + 6,000 × (condition − 3)
          then × the market trend (+0.35% a month from Jan 2021) × noise (log-normal, σ 0.10)

`built` is NOT in the rule. It correlates with price only because newer homes cluster in the dearer
areas: that is Course 7.7's confounder, and the reason it must stay out of the rule.

THE FAULTS are planted, each a lesson (COURSE-PLAN.md, "The data"):

  price as text "£215,000"             one agent (Bloom) types prices with £ and commas       4.3
  sqft in m²                           Keyline's sales from April to June 2023                 4.4
  garage empty                         no garage: empty in the export, means 0                 4.2
  built empty                          genuinely unknown for a few old houses                  4.2
  duplicates                           six sales entered twice                                  4.5
  a 12-bedroom typo; a £10,000 transfer                                                         4.6
  dates in two formats                 Bloom writes 15/03/2024; the others 2024-03-15           3.6
  area "Old town", "Riverside "        a case slip and a trailing space                         3.5, 5.4
"""
import csv
import io
import math
import random
import sys
from datetime import date, timedelta
from pathlib import Path

SEED = 1460
DATA = Path(__file__).resolve().parent.parent / 'data'

AREAS = ['Riverside', 'Old Town', 'Hillcrest', 'Northgate', 'Eastfield']
AREA_PREMIUM = {'Riverside': 45_000, 'Old Town': 20_000, 'Hillcrest': 0, 'Northgate': 10_000, 'Eastfield': -15_000}
AREA_SHARE = [0.18, 0.22, 0.24, 0.20, 0.16]
# Newer homes cluster where it is dear: the confounder. (median year built per area)
AREA_BUILT = {'Riverside': 2004, 'Old Town': 1935, 'Hillcrest': 1972, 'Northgate': 1990, 'Eastfield': 1962}
AREA_FACTS = {  # school rating (1-10), km to the centre, flood zone
    'Riverside': (8, 1.2, 'yes'), 'Old Town': (7, 0.4, 'no'), 'Hillcrest': (6, 2.8, 'no'),
    'Northgate': (7, 3.5, 'no'), 'Eastfield': (4, 4.1, 'no'),
}
AGENTS = ['Hart', 'Keyline', 'Bloom']
START, END = date(2021, 1, 1), date(2026, 9, 30)
SALES = 1454  # + 6 duplicates = 1,460 rows
SQFT_PER_M2 = 10.764


def price_of(sqft: int, area: str, garage: int, condition: int, sold: date, rng: random.Random) -> int:
    months = (sold.year - START.year) * 12 + sold.month - START.month
    base = 40_000 + 120 * sqft + AREA_PREMIUM[area] + 9_000 * garage + 6_000 * (condition - 3)
    return round(base * 1.0035 ** months * math.exp(rng.gauss(0, 0.10)), -2)


def house(rng: random.Random) -> dict:
    area = rng.choices(AREAS, AREA_SHARE)[0]
    sqft = int(min(4200, max(520, rng.lognormvariate(math.log(1350), 0.32))))
    beds = min(6, max(1, round(sqft / 480 + rng.gauss(0, 0.6))))
    built = int(min(2025, max(1880, rng.gauss(AREA_BUILT[area], 18))))
    garage = rng.choices([0, 1, 2, 3], [0.30, 0.38, 0.27, 0.05])[0]
    condition = rng.choices([1, 2, 3, 4, 5], [0.04, 0.14, 0.46, 0.27, 0.09])[0]
    return {'area': area, 'sqft': sqft, 'beds': beds, 'built': built, 'garage': garage, 'condition': condition}


def generate() -> dict[str, str]:
    rng = random.Random(SEED)
    span = (END - START).days
    rows = []
    for i in range(SALES):
        h = house(rng)
        sold = START + timedelta(days=rng.randrange(span + 1))
        agent = rng.choices(AGENTS, [0.45, 0.30, 0.25])[0]
        rows.append({'id': 1001 + i, 'sold': sold, 'agent': agent, **h,
                     'price': price_of(h['sqft'], h['area'], h['garage'], h['condition'], sold, rng)})
    rows.sort(key=lambda r: (r['sold'], r['id']))
    for n, r in enumerate(rows):
        r['id'] = 1001 + n  # ids follow the sale order, as an agency's register would

    # --- the planted faults ---------------------------------------------------------------------
    out = []
    for r in rows:
        r = dict(r)
        raw = {k: str(v) for k, v in r.items()}
        raw['sold'] = r['sold'].isoformat()
        if r['agent'] == 'Bloom':
            raw['sold'] = r['sold'].strftime('%d/%m/%Y')
            if rng.random() < 0.12:
                raw['price'] = f'£{int(r["price"]):,}'
            else:
                raw['price'] = str(int(r['price']))
        else:
            raw['price'] = str(int(r['price']))
        if r['agent'] == 'Keyline' and date(2023, 4, 1) <= r['sold'] <= date(2023, 6, 30):
            raw['sqft'] = str(round(r['sqft'] / SQFT_PER_M2))
        if r['garage'] == 0:
            raw['garage'] = ''
        if r['built'] < 1915 and rng.random() < 0.35:
            raw['built'] = ''
        if r['area'] == 'Old Town' and r['agent'] == 'Keyline' and rng.random() < 0.3:
            raw['area'] = 'Old town'
        elif r['area'] == 'Riverside' and rng.random() < 0.05:
            raw['area'] = 'Riverside '
        out.append(raw)
    typo = next(r for r in out if r['beds'] == '2' and r['agent'] == 'Hart' and r['sold'] >= '2024')
    typo['beds'] = '12'
    transfer = next(r for r in out if r['agent'] == 'Hart' and r['sold'] >= '2025' and r['area'] == 'Eastfield')
    transfer['price'] = '10000'
    for r in rng.sample(out[50:-50], 6):
        out.insert(out.index(r) + 1, dict(r))
    cols = ['id', 'sold', 'agent', 'area', 'sqft', 'beds', 'built', 'garage', 'condition', 'price']
    homes = to_csv(cols, out)

    areas = to_csv(['area', 'school', 'km_to_centre', 'flood_zone'],
                   [dict(zip(['area', 'school', 'km_to_centre', 'flood_zone'], [a, *AREA_FACTS[a]])) for a in AREAS])

    lrng = random.Random(SEED + 1)
    listings = []
    for i in range(20):
        h = house(lrng)
        listings.append({'id': 3001 + i, **{k: ('' if k == 'garage' and v == 0 else v) for k, v in h.items()}})
    listings_csv = to_csv(['id', 'area', 'sqft', 'beds', 'built', 'garage', 'condition'], listings)
    return {'homes.csv': homes, 'areas.csv': areas, 'listings.csv': listings_csv}


def to_csv(cols: list[str], rows: list[dict]) -> str:
    buf = io.StringIO()
    w = csv.DictWriter(buf, cols, lineterminator='\n', extrasaction='ignore')
    w.writeheader()
    w.writerows(rows)
    return buf.getvalue()


def main() -> int:
    files = generate()
    if '--check' in sys.argv:
        bad = [n for n, text in files.items() if not (DATA / n).exists() or (DATA / n).read_text() != text]
        print(f"{'✗' if bad else '✓'} data/ {'differs from the seed: ' + ', '.join(bad) if bad else 'matches the seed'}")
        return 1 if bad else 0
    DATA.mkdir(exist_ok=True)
    for name, text in files.items():
        (DATA / name).write_text(text)
        print(f'wrote data/{name} ({text.count(chr(10)) - 1} rows)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
