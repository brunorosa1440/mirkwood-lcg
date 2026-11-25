import csv,json,re,sys
src=sys.argv[1]
rows=list(csv.DictReader(open(src+'/tsvs/cardDb.tsv'),delimiter='\t'))
db={}
for r in rows:
    db.setdefault(r['databaseId'],[]).append(r)
txt=open(src+'/jsons/preBuiltDecks.json').read()
def deck(key):
    m=re.search(r'"'+re.escape(key)+r'":\s*\{\s*"label":\s*"([^"]*)",\s*"cards":\s*(\[.*?\])\s*\}',txt,re.S)
    return m.group(1),json.loads(m.group(2))
out={}
for k in sys.argv[2:]:
    lab,cards=deck(k); out[k]={'label':lab,'cards':cards}
json.dump({'decks':out,'db':{i:db[i] for d in out.values() for c in d['cards'] for i in [c['databaseId']] if i in db}},open('/home/claude/work/extract.json','w'),ensure_ascii=False)
for k,d in out.items():
    print('==',k,d['label'])
    for c in d['cards']:
        for f in db.get(c['databaseId'],[{'name':'??'}])[:1]:
            print(c['quantity'],c['loadGroupId'],'|',f['name'],'|',f.get('type'),f.get('sphere'),'cost',f.get('cost'),'| W',f.get('willpower'),'A',f.get('attack'),'D',f.get('defense'),'HP',f.get('hitPoints'),'thr',f.get('threat'),'| ',f.get('keywords'),'|',f.get('text'),'|SH',f.get('shadow'))
