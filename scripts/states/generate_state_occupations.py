import json, re, unicodedata, urllib.parse, urllib.request
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[2]
CATALOG = json.loads((ROOT / 'src/data/estados.json').read_text(encoding='utf-8'))['estados']
OUT = ROOT / 'src/data/stateOccupations.json'

PARAMS = {
    'Population Classification': '1',
    'Quarter': '20261',
    'cube': 'inegi_enoe',
    'drilldowns': 'State,Occupation',
    'measures': 'Workforce,Monthly Wage,Number of Records',
    'parents': 'true',
    'sparse': 'false',
    'locale': 'es',
}
BASE_URL = 'https://www.economia.gob.mx/datamexico/api/data'
SOURCE_URL = BASE_URL + '?' + urllib.parse.urlencode(PARAMS)

ALIASES = {
    'mexico': 'estado-de-mexico',
    'estado-de-mexico': 'estado-de-mexico',
    'coahuila-de-zaragoza': 'coahuila',
    'coahuila': 'coahuila',
    'michoacan-de-ocampo': 'michoacan',
    'michoacan': 'michoacan',
    'veracruz-de-ignacio-de-la-llave': 'veracruz',
    'veracruz': 'veracruz',
    'ciudad-de-mexico': 'ciudad-de-mexico',
}

def slugify(value):
    value = unicodedata.normalize('NFKD', str(value)).encode('ascii', 'ignore').decode('ascii').lower()
    value = re.sub(r'[^a-z0-9]+', '-', value).strip('-')
    return ALIASES.get(value, value)

req = urllib.request.Request(SOURCE_URL, headers={'User-Agent': 'MiLana-state-occupations/1.0'})
with urllib.request.urlopen(req, timeout=120) as response:
    payload = json.loads(response.read())

rows = payload.get('data', [])
if not rows:
    raise SystemExit('Data México devolvió 0 filas')

by_state = defaultdict(list)
seen_names = {}
for row in rows:
    state_name = row.get('State')
    state_id = row.get('State ID')
    if not state_name or state_id is None:
        continue
    slug = slugify(state_name)
    by_state[slug].append(row)
    seen_names[slug] = {'state': state_name, 'stateId': state_id}

catalog_slugs = {item['slug'] for item in CATALOG}
api_slugs = set(by_state)
missing = sorted(catalog_slugs - api_slugs)
extra = sorted(api_slugs - catalog_slugs)
if missing or extra:
    raise SystemExit(f'Desajuste entidades. Faltan={missing}; extra={extra}; API={seen_names}')

states = []
for item in CATALOG:
    slug = item['slug']
    state_rows = sorted(by_state[slug], key=lambda r: float(r.get('Workforce') or 0), reverse=True)
    top = []
    used_ids = set()
    for row in state_rows:
        occ_id = int(row.get('Occupation ID'))
        if occ_id in used_ids:
            continue
        workforce = int(round(float(row.get('Workforce') or 0)))
        records = int(round(float(row.get('Number of Records') or 0)))
        wage = float(row.get('Monthly Wage') or 0)
        if workforce <= 0 or records <= 0:
            continue
        top.append({
            'occupationId': occ_id,
            'occupation': row.get('Occupation'),
            'categoryId': int(row.get('Category ID')),
            'category': row.get('Category'),
            'groupId': int(row.get('Group ID')),
            'group': row.get('Group'),
            'workforce': workforce,
            'monthlyWage': round(wage, 2),
            'records': records,
        })
        used_ids.add(occ_id)
        if len(top) == 8:
            break
    if len(top) != 8:
        raise SystemExit(f'{item["estado"]}: solo {len(top)} ocupaciones válidas')
    meta = seen_names[slug]
    states.append({
        'slug': slug,
        'state': item['estado'],
        'dataMexicoState': meta['state'],
        'stateId': int(meta['stateId']),
        'occupations': top,
    })

result = {
    'period': '2026-T1',
    'quarter': '20261',
    'checkedAt': datetime.now(ZoneInfo('America/Monterrey')).date().isoformat(),
    'source': {
        'name': 'Data México — Secretaría de Economía',
        'dataset': 'ENOE / inegi_enoe',
        'url': SOURCE_URL,
        'note': 'Población ocupada, salario mensual estimado y número de registros por ocupación. Ocupación no equivale a carrera estudiada, vacante abierta ni salario garantizado.',
    },
    'selection': {
        'criterion': 'Mayor población ocupada observada dentro de cada entidad',
        'limitPerState': 8,
        'rankingIsRecommendation': False,
    },
    'states': states,
}

OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Generado {OUT}: {len(states)} estados, {sum(len(s["occupations"]) for s in states)} ocupaciones')
for state in states:
    top = state['occupations'][0]
    print(f'{state["state"]}: {top["occupation"]} — {top["workforce"]} ocupados — {top["records"]} registros')
