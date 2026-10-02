import sys, zipfile, xml.etree.ElementTree as ET, re
from pathlib import Path

NS_MAIN = {'a':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
NS_REL = {'r':'http://schemas.openxmlformats.org/package/2006/relationships'}
NS_OFFICE = {'r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}

def col_num(ref):
    m = re.match(r'([A-Z]+)', ref)
    n = 0
    for c in m.group(1):
        n = n*26 + ord(c)-64
    return n

def shared_strings(z):
    try:
        root = ET.fromstring(z.read('xl/sharedStrings.xml'))
    except KeyError:
        return []
    out=[]
    for si in root.findall('a:si', NS_MAIN):
        out.append(''.join(t.text or '' for t in si.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')))
    return out

def cell_value(c, shared):
    t=c.attrib.get('t')
    v=c.find('a:v', NS_MAIN)
    if v is None:
        inline=c.find('a:is', NS_MAIN)
        if inline is not None:
            return ''.join(tn.text or '' for tn in inline.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t'))
        return ''
    raw=v.text or ''
    if t=='s':
        try:return shared[int(raw)]
        except:return raw
    if t=='b': return 'TRUE' if raw=='1' else 'FALSE'
    return raw

def main(path):
    p=Path(path)
    with zipfile.ZipFile(p) as z:
        shared=shared_strings(z)
        wb=ET.fromstring(z.read('xl/workbook.xml'))
        rels=ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        relmap={r.attrib['Id']:r.attrib['Target'] for r in rels.findall('r:Relationship',NS_REL)}
        print('WORKBOOK', p.name)
        print('SHARED_STRINGS', len(shared))
        for s in wb.find('a:sheets',NS_MAIN):
            name=s.attrib['name']
            rid=s.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']
            target=relmap[rid]
            sheet_path='xl/'+target.lstrip('/') if not target.startswith('xl/') else target
            print('\n=== SHEET:', name, 'PATH:', sheet_path, '===')
            root=ET.fromstring(z.read(sheet_path))
            rows=root.findall('.//a:sheetData/a:row',NS_MAIN)
            printed=0
            for row in rows:
                vals=[]
                for c in row.findall('a:c',NS_MAIN):
                    val=cell_value(c,shared)
                    if str(val).strip(): vals.append(f"{c.attrib.get('r')}={val}")
                if vals:
                    print(' | '.join(vals[:30]))
                    printed += 1
                if printed>=40: break

if __name__=='__main__':
    main(sys.argv[1])
