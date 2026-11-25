// ===== Interface =====
{
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SPH={Leadership:'#8d4cb4',Tactics:'#b8392f',Spirit:'#3a90cc',Lore:'#3f9450',Neutral:'#8c8778',Baggins:'#c9a227',Fellowship:'#c9a227'};
const icon=t=>String(t||'').replace(/\[(\w+)\]/g,(m,k)=>({willpower:'WP',attack:'ATK',defense:'DEF',threat:'Threat',tactics:'Tactics',spirit:'Spirit',leadership:'Leadership',lore:'Lore'}[k]||k));
// small original icons
const I={
  threat:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2l2.2 6.3L18 4.5l-.6 7L22 9.6 18.7 19H5.3L2 9.6l4.6 1.9-.6-7 3.8 3.8z"/><rect x="5" y="20.2" width="14" height="2" rx="1" fill="currentColor"/></svg>',
  will:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1.8v3M12 19.2v3M1.8 12h3M19.2 12h3M4.8 4.8l2.1 2.1M17.1 17.1l2.1 2.1M4.8 19.2l2.1-2.1M17.1 6.9l2.1-2.1"/></g></svg>',
  atk:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><g stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 4l11 11M20 4L9 15M13 17l4 4M11 17l-4 4M15.5 13.5l3 3M8.5 13.5l-3 3"/></g></svg>',
  def:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z"/></svg>'};
const GLYPH={Tactics:'<path d="M12 3v13M8 12.5h8M12 16v5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/>',
  Spirit:'<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/></g>',
  Leadership:'<path d="M7 3v18M7 4h11l-3 4 3 4H7" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" fill="none"/>',
  Lore:'<path d="M5 19C5 10 11 5 19 5c0 8-6 14-14 14zM5 19l8-8" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
  Neutral:'<circle cx="12" cy="12" r="5" fill="currentColor"/>'};
const coin=sp=>`<span class="coin" style="--sc:${SPH[sp]||'#8c8778'}"><svg viewBox="0 0 24 24" aria-hidden="true">${GLYPH[sp]||GLYPH.Neutral}</svg></span>`;
const ED={
  'Revised Core Set':['Passage Through Mirkwood','Journey Along the Anduin','Escape from Dol Guldur','The Oath','The Caves of Nibin-Dûm'],
  'Core Set':['Passage Through Mirkwood','Journey Along the Anduin','Escape from Dol Guldur'],
  'Two-Player Limited Edition Starter':['The Oath','The Caves of Nibin-Dûm'],
  'Shadows of Mirkwood':['The Hunt for Gollum','Conflict at the Carrock','A Journey to Rhosgobel','The Hills of Emyn Muil','The Dead Marshes','Return to Mirkwood'],
  'Dwarrowdelf':['The Redhorn Gate','Road to Rivendell','The Watcher in the Water','The Long Dark','Foundations of Stone','Shadow and Flame'],
  'Against the Shadow':["The Steward's Fear",'The Drúadan Forest','Encounter at Amon Dîn','Assault on Osgiliath','The Blood of Gondor','The Morgul Vale'],
  'The Ring-maker':['The Dunland Trap','The Three Trials','Trouble in Tharbad','The Nîn-in-Eilph',"Celebrimbor's Secret",'The Antlered Crown'],
  'Angmar Awakened':['The Wastes of Eriador','Escape from Mount Gram','Across the Ettenmoors','The Treachery of Rhudaur','The Battle of Carn Dûm','The Dread Realm'],
  'Dream-chaser':['Voyage Across Belegaer','The Fate of Númenor','Raid on the Grey Havens','Flight of the Stormcaller','The Thing in the Depths','Temple of the Deceived','The Drowned Ruins','A Storm on Cobas Haven','The City of Corsairs'],
  'Haradrim':['The Mûmakil','Race Across Harad','Beneath the Sands','The Black Serpent','The Dungeons of Cirith Gurat','The Crossings of Poros'],
  'Ered Mithrin':['The Wilds of Rhovanion','The Withered Heath','Roam Across Rhovanion','Fire in the Night','The Ghost of Framsburg','Mount Gundabad','The Fate of Wilderland'],
  'Vengeance of Mordor':['A Shadow in the East','Wrath and Ruin','The City of Ulfast','Challenge of the Wainriders','Under the Ash Mountains','The Land of Sorrow','The Fortress of Nurn']};
const EDCOL={'Shadows of Mirkwood':'#1f4a2a','Dwarrowdelf':'#4a3220','The Ring-maker':'#3b2559','Dream-chaser':'#173a5c','Haradrim':'#5a1c1c','Ered Mithrin':'#4b4a2a','Vengeance of Mordor':'#4a1f12'};
const AUTO_SCEN='Passage Through Mirkwood',AUTO_DECK='starterRohan';
const ui={open:{'Revised Core Set':true},q:'',hand:false,log:false,min:false,sel:new Set(),zoom:null,deckView:null,setup:null,build:null,alloc:{},pile:null};
let pending=null;
const onBoard=c=>G&&(isChar(c)||G.staging.includes(c)||G.engaged.includes(c)||G.active===c);
const desk=()=>matchMedia('(min-width:1000px) and (min-height:640px)').matches;
H.ask=cfg=>new Promise(res=>{
  pending={...cfg,res};ui.sel=new Set();ui.min=false;
  if(cfg.kind==='pick'){pending.inline=cfg.cands.every(onBoard);if(pending.inline&&cfg.cands.some(c=>G.allies.includes(c)))ui.hand=false}
  if(cfg.kind==='pay')ui.alloc=Object.fromEntries(defaultAlloc(cfg.card,cfg.cost));
  if(cfg.kind==='window'||cfg.kind==='pay'||pending.inline)ui.zoom=null;
  H.render()});
H.openHand=()=>{ui.hand=true};
H.onEnd=()=>{pending=null;try{localStorage.removeItem('mk.save')}catch(e){}};
const resolve=v=>{const p=pending;pending=null;ui.zoom=null;p.res(v)};

// ---------- cards ----------
const TYPE_LABEL=d=>d.type==='Quest'?`Quest · stage ${d.cost}${d.side||''}`:d.type;
function face(d){
  const col=SPH[d.sphere]||(d.type==='Enemy'?'#6d2a22':d.type==='Location'?'#4d5a3a':d.type==='Treachery'?'#4b3a5c':'#5b5145');
  const st=[];
  if(d.type==='Hero')st.push(['Threat',d.cost]);else if(d.cost!=null&&d.type!=='Quest')st.push(['Cost',d.cost]);
  if(d.eng!=null)st.push(['Engage',d.eng]);if(d.thr!=null&&d.type!=='Hero')st.push(['Threat',d.thr]);
  for(const[k,l]of[['w','WP'],['a','ATK'],['d','DEF'],['hp','HP'],['qp','QP']])if(d[k]!=null)st.push([l,d[k]]);
  return `<div class="face" style="--sc:${col}"><b class="nm">${d.unique?'◆ ':''}${esc(d.name)}</b><i class="ty">${esc(TYPE_LABEL(d))}${d.sphere?' · '+esc(d.sphere):''}</i>
  <div class="st">${st.map(([l,v])=>`<span><small>${l}</small>${v}</span>`).join('')}</div>
  ${d.traits?.length?`<i class="tr">${esc(d.traits.join('. '))}.</i>`:''}<p class="tx">${esc(icon([d.kw,d.text].filter(Boolean).join(' ')))}</p>${d.shadow?`<p class="tx sh">${esc(icon(d.shadow))}</p>`:''}</div>`}
const imgTag=d=>`<img src="${IMGBASE+d.img}" alt="" loading="lazy" onerror="this.remove()">`;
const backTag=k=>`<div class="back ${k}"><span>${k==='encounter'?'Encounter':'Player'}</span><img src="${BACKS[k]}" alt="" onerror="this.remove()"></div>`;
function cardEl(c,o={}){
  const d=c.d,P=pending,inl=P&&P.kind==='pick'&&P.inline;
  const cand=inl&&P.cands.includes(c),sel=(o.sel||cand&&ui.sel.has(c.uid)),focus=P&&P.card===c&&inl;
  const cls=['card',d.type==='Quest'?'wide':'',c.exh?'exh':'',c.committed?'com':'',o.hl?'hl':'',sel?'sel':'',cand&&!sel?'cand':'',focus?'focus':''].join(' ');
  const b=[];
  const ch=G&&isChar(c);
  if(ch)b.push(`<em class="bd wp" title="Willpower">${I.will}${stat(c,'w')}</em>`);
  if(G&&isHero(c))b.push(`<em class="bd res" title="Resources">${coin(d.sphere)}${c.res}</em>`);
  else if(c.res)b.push(`<em class="bd res" title="Resources">${coin('Neutral')}${c.res}</em>`);
  if(c.dmg)b.push(`<em class="bd dmg" title="Damage">${c.dmg}</em>`);if(c.prog)b.push(`<em class="bd prg" title="Progress">${c.prog}</em>`);
  if(c.committed)b.push('<em class="bd com">Quest</em>');
  if(o.thr&&G)b.push(`<em class="bd thr" title="Threat">${I.threat}${stat(c,'thr')}</em>`);
  if(o.atk&&G)b.push(`<em class="bd atk" title="Attack">${I.atk}${stat(c,'a')}</em>`);
  if(o.note)b.push(`<em class="bd note">${esc(o.note)}</em>`);
  const att=(c.att||[]).map((a,i)=>`<div class="att" data-uid="${a.uid}" style="--i:${i}">${a.exh?'<i class="ax">exhausted</i>':''}<b>${esc(N(a))}</b>${imgTag(a.d)}</div>`).join('');
  const sh=(c.shadow||[]).map(s=>`<div class="shd" data-uid="${s.uid}">${s.up?`<b>${esc(N(s))}</b>${imgTag(s.d)}`:backTag('encounter')}</div>`).join('');
  return `<div class="slot ${c.exh?'exh':''} ${d.type==='Quest'?'wide':''} ${G&&isHero(c)?'hero':''}" style="--n:${(c.att||[]).length}">${att}<div class="${cls}" data-uid="${c.uid}">${face(d)}${imgTag(d)}${b.join('')}</div>${sh}</div>`}
function pile(list,k,label){return `<div class="pile" data-pile="${label}">${list.length?(k==='up'?cardEl(list[list.length-1]):backTag(k)):'<div class="empty"></div>'}<em class="bd cnt">${list.length}</em></div>`}
function allInst(){if(!G)return[];const z=[...G.heroes,...G.allies,...G.hand,...G.staging,...G.engaged,...G.discard,...G.ediscard,...G.victory,G.active,G.quest].filter(Boolean);
  for(const c of[...z])z.push(...(c.att||[]),...(c.shadow||[]));if(pending?.cands)z.push(...pending.cands);if(pending?.card)z.push(pending.card);if(pending?.cards)z.push(...pending.cards);return z}
const find=uid=>allInst().find(c=>c.uid===+uid)||(G&&[...G.deck,...G.edeck].find(c=>c.uid===+uid));

// ---------- pages ----------
function route(){const h=location.hash.slice(1);return['play','decks','builder','table'].includes(h)?h:'play'}
function nav(){const r=route();return `<header class="top"><b class="brand">Mirkwood<span>LCG</span></b><nav>${[['play','Play'],['decks','Decks'],['builder','Deck builder']].map(([h,l])=>`<a href="#${h}" class="${r===h?'on':''}">${l}</a>`).join('')}${G&&!G.over?`<a href="#table" class="${r==='table'?'on':''} live">Table</a>`:''}</nav></header>`}
function pagePlay(){
  const q=ui.q.toLowerCase();
  const groups=Object.entries(ED).map(([ed,list])=>{const l=list.filter(s=>!q||s.toLowerCase().includes(q)||ed.toLowerCase().includes(q));if(!l.length)return'';
    const open=ui.open[ed]||q,auto=l.some(s=>s===AUTO_SCEN);
    return `<section class="ed ${open?'open':''}" style="--ec:${EDCOL[ed]||'#2a2724'}"><button class="edh" data-ed="${esc(ed)}"><i class="dot ${auto?'on':''}"></i>${esc(ed)}<span class="chev">${open?'▲':'▼'}</span></button>
      ${open?`<div class="scen">${l.map(s=>s===AUTO_SCEN?`<button class="sc" data-scen="${esc(s)}">${esc(s)}<small>Automated</small></button>`:`<div class="sc off">${esc(s)}<small>Locked</small></div>`).join('')}</div>`:''}</section>`}).join('');
  return `<main class="page"><h1>Play</h1><p class="lede">Pick a scenario and play it against its encounter deck. The encounter side runs itself; you decide who quests, who defends and who attacks. Scenarios and decks that are not automated yet are greyed out.</p>
  <input class="search" id="q" placeholder="Search scenarios…" value="${esc(ui.q)}">${groups}
  <details class="how"><summary>How to play</summary><ul><li>Tap a card to see it large. If it can be played, choose which heroes pay and press Play.</li><li>In each action window, play cards from your hand, then press Continue.</li><li>Quest: tap the characters to commit on the table, then Confirm in the bottom bar. The encounter card is revealed and the quest resolves on its own.</li><li>Combat: for each enemy, tap a defender (or choose None); then pick your attacks.</li><li>Responses such as A Test of Will, Wait no Longer and Oath of Eorl are offered at the right moment.</li></ul></details></main>`}
function deckList(){let c=[];try{c=JSON.parse(localStorage.getItem('mk.decks')||'[]')}catch(e){}return c}
function saveDecks(l){try{localStorage.setItem('mk.decks',JSON.stringify(l))}catch(e){}}
const deckSize=d=>d.cards.reduce((t,[,q])=>t+q,0);
const PLURAL={Ally:'Allies',Attachment:'Attachments',Event:'Events',Hero:'Heroes'};
function heroStrip(ids){return `<div class="hstrip">${ids.map(id=>{const d=def(id);return `<div class="hmini" style="--sc:${SPH[d.sphere]}"><b>${esc(d.name)}</b>${imgTag(d)}</div>`}).join('')}</div>`}
function pageDecks(){
  if(ui.deckView){const d=ui.deckView,groups={};for(const[id,q]of d.cards){const x=def(id);(groups[x.type]=groups[x.type]||[]).push([x,q,id])}
    return `<main class="page"><button class="ghost" id="back">← Decks</button><h1>${esc(d.name)}</h1><p class="lede">${deckSize(d)} cards · starting threat ${d.heroes.reduce((t,id)=>t+def(id).cost,0)}</p>${heroStrip(d.heroes)}
    ${['Ally','Attachment','Event'].filter(t=>groups[t]).map(t=>`<h2>${PLURAL[t]} <small>${groups[t].reduce((a,[,q])=>a+q,0)}</small></h2><div class="grid">${groups[t].map(([x,q,id])=>`<div class="tile ${IMPLEMENTED.has(x.name)?'':'locked'}" data-def="${id}"><div class="card">${face(x)}${imgTag(x)}</div><em class="bd cnt">×${q}</em></div>`).join('')}</div>`).join('')}</main>`}
  const st=Object.entries(STARTERS).map(([k,d])=>{const ok=k===AUTO_DECK;return `<div class="deck ${ok?'':'off'}" data-deck="${k}">${heroStrip(d.heroes)}<b>${esc(d.name.replace('Core Set — ','Core Set: '))}</b><small>${deckSize(d)} cards · ${ok?'Automated':'Locked'}</small></div>`}).join('');
  const my=deckList().map((d,i)=>`<div class="deck" data-my="${i}">${heroStrip(d.heroes)}<b>${esc(d.name)}</b><small>${deckSize(d)} cards · Custom</small></div>`).join('');
  return `<main class="page"><h1>Decks</h1><p class="lede">Official starter decks. For now only Riders of Rohan has every card automated; the others stay locked until their cards have rules.</p><div class="decks">${st}</div>
  <h2>Your decks</h2>${my?`<div class="decks">${my}</div>`:'<p class="muted">No decks yet. Build one in the Deck builder.</p>'}</main>`}
function pool(){const ids=new Set();for(const d of Object.values(STARTERS))for(const id of[...d.heroes,...d.cards.map(x=>x[0])])ids.add(id);return[...ids].map(id=>[id,def(id)])}
function pageBuilder(){
  const b=ui.build||(ui.build={name:'New deck',heroes:[],cards:{}});
  const P=pool(),on=P.filter(([,d])=>IMPLEMENTED.has(d.name)),off=P.filter(([,d])=>!IMPLEMENTED.has(d.name));
  const n=Object.values(b.cards).reduce((a,v)=>a+v,0),thr=b.heroes.reduce((t,id)=>t+def(id).cost,0);
  const tile=([id,d])=>{const q=d.type==='Hero'?(b.heroes.includes(id)?1:0):(b.cards[id]||0);
    return `<div class="tile ${q?'pick':''}" data-def="${id}"><div class="card">${face(d)}${imgTag(d)}</div><div class="qty"><button data-dec="${id}" aria-label="Fewer">−</button><b>${q}</b><button data-inc="${id}" aria-label="More">+</button></div></div>`};
  const by=t=>on.filter(([,d])=>d.type===t);
  return `<main class="page"><h1>Deck builder</h1><p class="lede">Build a deck from automated cards only: up to 3 heroes and up to 3 copies of each card (1 for The Red Arrow).</p>
  <div class="bbar"><input id="bname" value="${esc(b.name)}" aria-label="Deck name"><span>${b.heroes.length}/3 heroes · ${n} cards · threat ${thr}${n&&n<50?' · standard decks have 50+':''}</span><button class="gold" id="bsave" ${b.heroes.length&&n>=20?'':'disabled'}>Save</button><button class="ghost" id="bclear">Clear</button></div>
  ${['Hero','Ally','Attachment','Event'].map(t=>`<h2>${PLURAL[t]}</h2><div class="grid">${by(t).map(tile).join('')}</div>`).join('')}
  <details class="how"><summary>${off.length} cards still locked (not automated)</summary><div class="grid">${off.map(([id,d])=>`<div class="tile locked" data-def="${id}"><div class="card">${face(d)}${imgTag(d)}</div></div>`).join('')}</div></details></main>`}

// ---------- table ----------
function board(){
  if(!G)return `<main class="page"><p class="muted">No game in progress. <a href="#play">Pick a scenario.</a></p></main>`;
  const P=pending;
  const hl=c=>G.window&&(G.hand.includes(c)?canPlay(c):canUse(c));
  const zone=(cls,label,inner,extra='')=>`<section class="zone ${cls}"><label>${label}</label><div class="row">${inner}</div>${extra}</section>`;
  const handZone=cls=>zone(cls,`Hand · ${G.hand.length}`,G.hand.map(c=>cardEl(c,{hl:hl(c)})).join('')||'<p class="muted">Your hand is empty.</p>');
  const playZone=()=>zone('z-play grow','Play area',G.allies.map(c=>cardEl(c,{hl:hl(c)})).join(''));
  const piles=zone('z-pile','Deck',pile(G.deck,'player','deck'))+zone('z-pile','Discard',pile(G.discard,'up','discard'))+(G.victory.length?zone('z-pile','Victory',pile(G.victory,'up','victory')):'');
  const inl=P&&P.kind==='pick'&&P.inline;
  // bottom-bar quest value: what is committed (or being selected), otherwise what the ready characters could commit
  let wp,wpT;
  if(inl&&P.stat==='w'){wp=[...ui.sel].reduce((t,u)=>t+stat(find(u),'w'),0);wpT='Willpower selected'}
  else if(chars().some(c=>c.committed)){wp=questWill();wpT='Willpower committed to the quest'}
  else{wp=chars().filter(c=>!c.exh).reduce((t,c)=>t+stat(c,'w'),0);wpT='Willpower of your ready characters'}
  let prompt='';
  if(inl){const n=ui.sel.size,ok=n>=P.min&&n<=P.max;
    const tgt=P.card&&enemiesInPlay().includes(P.card)?P.card:null;
    const sum=P.stat==='w'?`<span class="vs">${I.will}${wp} <small>vs</small> ${I.threat}${stagingThreat()}</span>`:P.stat==='a'&&tgt?`<span class="vs">${I.atk}${[...ui.sel].reduce((t,u)=>t+stat(find(u),'a'),0)} <small>vs</small> ${I.def}${stat(tgt,'d')}</span>`:'';
    prompt=`<span class="wt pickt">${esc(P.title)}</span>${sum}${P.min===0?`<button class="ghost" id="none">${P.max>1?'None':'Skip'}</button>`:''}<button class="gold" id="ok" ${ok?'':'disabled'}>Confirm</button>`}
  else if(P&&P.kind==='window')prompt=`<span class="wt">${esc(P.title)}</span><button class="gold" id="pass">Continue</button>`;
  else if(P&&ui.min)prompt=`<span class="wt"></span><button class="gold" id="unmin">Back to the choice</button>`;
  return `<div class="board">
   <div class="brow r1">
     ${zone('z-quest','Quest',cardEl(G.quest)+`<em class="bd prgq" title="Quest progress">${G.qprog}/${G.quest.d.qp??'–'}</em>`)}
     ${zone('z-pile','Encounter',pile(G.edeck,'encounter','edeck'))}
     ${zone('z-pile','Discard',pile(G.ediscard,'up','ediscard'))}
     ${zone('z-staging grow','Staging',G.staging.map(c=>cardEl(c,{thr:1})).join(''),`<em class="bd thrT" title="Total threat in the staging area">${I.threat}${stagingThreat()}</em>`)}
   </div>
   <div class="brow r2">
     ${zone('z-heroes grow','Heroes',G.heroes.map(c=>cardEl(c,{hl:hl(c)})).join(''))}
     ${zone('z-loc','Location',G.active?cardEl(G.active):'')}
     ${zone('z-eng grow','Engaged',G.engaged.map(c=>cardEl(c,{atk:1,note:c.feint?'Feint':''})).join(''))}
   </div>
   ${desk()?`<div class="brow r3">${playZone()}</div><div class="brow r4">${handZone('z-hand grow')}${piles}</div>`
     :`<div class="brow r3">${ui.hand&&!inl?handZone('z-play z-hand grow'):playZone()}${piles}</div>`}
  </div>
  ${ui.log?`<aside class="log">${G.log.slice(-80).reverse().map(l=>`<p class="${l.cls}">${esc(l.m)}</p>`).join('')}</aside>`:''}
  <footer class="bar ${inl?'picking':''}">
    <a class="ib btn ghost" href="#play">Menu</a>
    <button class="ib" id="tlog" aria-label="Game log">${ui.log?'✕':'☰'}</button>
    <span class="chip thrc" title="Your threat">${I.threat}${G.threat}</span>
    <span class="chip wpc" title="${wpT}">${I.will}${wp}</span>
    <span class="ph">${G.round?'R'+G.round+' · ':''}${esc(G.phase)}${G.over?' · over':''}</span>
    ${prompt}
    ${desk()||inl?'':`<button class="ib hb" id="thand">${ui.hand?'▼':'▲'} Hand ${G.hand.length}</button>`}
  </footer>
  ${G.error?`<div class="modal"><div class="box"><h3>Engine error</h3><pre>${esc(G.error)}</pre><a class="gold btn" href="#play">Back</a></div></div>`:''}
  ${G.over?`<div class="modal"><div class="box end ${G.over.win?'win':'lose'}"><h3>${G.over.win?'Victory':'Defeat'}</h3><p>${esc(G.over.msg)}</p><p class="muted">Round ${G.round} · threat ${G.threat} · ${G.victory.reduce((t,c)=>t+(c.d.vp||0),0)} victory points</p><div class="btns"><button class="gold" id="again">Play again</button><a class="ghost btn" href="#play">Menu</a></div></div></div>`:''}
  ${P&&P.kind!=='window'&&!inl&&!ui.min?promptBox(P):''}`}
function payPanel(c,cost){
  const ps=payers(c),sum=Object.values(ui.alloc).reduce((a,b)=>a+b,0);
  if(cost<=0)return `<div class="pay"><div class="payh"><b>No cost</b></div></div>`;
  const sp=N(c)==='The Muster of Rohan'?'Spirit (Rohan heroes count as Spirit)':c.d.sphere==='Neutral'?'resources from any heroes':c.d.sphere;
  return `<div class="pay"><div class="payh"><b>Pay ${cost} ${esc(sp)}${c.d.sphere==='Neutral'?'':cost===1?' resource':' resources'}</b><span class="${sum===cost?'okc':''}">${sum} of ${cost}</span></div>
   ${ps.map(h=>{const n=ui.alloc[h.uid]||0;return `<div class="prow">${coin(h.d.sphere)}<b>${esc(N(h))}</b><small>has ${h.res}</small><button data-pdec="${h.uid}" ${n?'':'disabled'} aria-label="Less from ${esc(N(h))}">−</button><b class="pn">${n}</b><button data-pinc="${h.uid}" ${n<h.res&&sum<cost?'':'disabled'} aria-label="More from ${esc(N(h))}">+</button></div>`}).join('')||'<p class="muted">No hero can pay for this card.</p>'}</div>`}
const allocArr=()=>Object.entries(ui.alloc).map(([u,n])=>[+u,n]).filter(x=>x[1]>0);
const allocSum=()=>Object.values(ui.alloc).reduce((a,b)=>a+b,0);
function promptBox(P){
  const head=`<div class="ph2"><h3>${esc(P.title)}</h3><button class="ib" id="min" aria-label="See the table">–</button></div>`;
  if(P.kind==='pay')return `<div class="modal"><div class="box">${head}<div class="pbody"><div class="big">${cardEl(P.card)}</div><div class="ztext">${P.text?`<p>${esc(icon(P.text))}</p>`:''}${payPanel(P.card,P.cost)}</div></div>
    <div class="btns"><button class="ghost" id="payno">Don't play</button><button class="gold" id="payok" ${allocSum()===P.cost?'':'disabled'}>Play</button></div></div></div>`;
  if(P.kind==='buttons')return `<div class="modal"><div class="box">${head}${P.text?`<p>${esc(icon(P.text))}</p>`:''}
    <div class="pbody">${P.card?`<div class="big">${cardEl(P.card)}</div>`:''}${P.card&&!P.cards?`<div class="ztext">${zText(P.card)}</div>`:''}${P.cards?`<div class="row wrap">${P.cards.map(c=>cardEl(c)).join('')}</div>`:''}</div>
    <div class="btns">${P.options.map((o,i)=>`<button class="${o.primary?'gold':'ghost'}" data-opt="${i}">${esc(o.label)}</button>`).join('')}</div></div></div>`;
  const ok=ui.sel.size>=P.min&&ui.sel.size<=P.max;
  const lab=c=>P.stat==='hpleft'?`${stat(c,'hp')-c.dmg} HP left`:P.stat==='qp'?`${c.d.qp} QP · ${stat(c,'thr')} threat`:P.stat==='eng'?`engagement ${c.d.eng}`:P.stat?`${{w:'WP',a:'ATK',d:'DEF'}[P.stat]} ${stat(c,P.stat)}${isChar(c)?` · ${stat(c,'hp')-c.dmg} HP`:''}`:'';
  return `<div class="modal"><div class="box">${head}${P.text?`<p>${esc(P.text)}</p>`:''}
    <div class="pbody">${P.card?`<div class="big sm">${cardEl(P.card)}</div>`:''}<div class="row wrap picks">${P.cands.map(c=>`<div class="pk">${cardEl(c,{sel:ui.sel.has(c.uid)})}<small>${esc(lab(c))}</small></div>`).join('')}</div></div>
    <div class="btns"><span class="muted">${P.max>1?`${ui.sel.size} selected`:''}</span>${P.min===0?`<button class="ghost" id="none">${P.max>1?'None':'Skip'}</button>`:''}<button class="gold" id="ok" ${ok?'':'disabled'}>Confirm</button></div></div></div>`}
function zText(c){const d=c.d;return `<b class="zn">${esc(d.name)}</b><i>${esc(TYPE_LABEL(d))}${d.sphere?' · '+esc(d.sphere):''}${d.traits?.length?' · '+esc(d.traits.join('. ')):''}</i>
  ${d.kw?`<p><b>${esc(d.kw)}</b></p>`:''}${d.text?`<p>${esc(icon(d.text))}</p>`:''}${d.shadow?`<p class="sh">${esc(icon(d.shadow))}</p>`:''}
  ${G&&isChar(c)?`<p class="cur">Now: WP ${stat(c,'w')} · ATK ${stat(c,'a')} · DEF ${stat(c,'d')} · HP ${stat(c,'hp')-c.dmg}/${stat(c,'hp')}${isHero(c)?` · ${c.res} resources`:''}</p>`:''}
  ${G&&(isEnemy(c)&&enemiesInPlay().includes(c))?`<p class="cur">Now: ATK ${stat(c,'a')} · DEF ${stat(c,'d')} · HP ${stat(c,'hp')-c.dmg}/${stat(c,'hp')} · threat ${stat(c,'thr')}</p>`:''}
  ${!IMPLEMENTED.has(d.name)&&d.back==='player'?'<p class="muted">This card is not automated yet.</p>':''}`}
function zoomBox(){
  const z=ui.zoom;if(!z)return'';const c=z.c||{d:z.d,att:[]};
  const btn=[];let extra='';
  if(z.c&&G&&pending?.kind==='window'){
    if(G.hand.includes(z.c)){
      if(canPlay(z.c)){const cost=costOf(z.c);extra=payPanel(z.c,cost);
        btn.push(`<button class="ghost" id="zclose2">Cancel</button><button class="gold" id="zplay" ${allocSum()===cost?'':'disabled'}>Play</button>`)}
      else btn.push(`<span class="muted">${RESP[N(z.c)]||'This card cannot be played right now.'}</span>`)}
    if(canUse(z.c))btn.push(`<button class="gold" id="zabil">${esc(ABIL[N(z.c)].label)}</button>`)}
  return `<div class="modal" id="zbg"><div class="box zoom"><div class="ph2"><h3>${extra?'Play '+esc(c.d.name)+'?':esc(c.d.name)}</h3><button class="ib" id="zclose" aria-label="Close">✕</button></div>
   <div class="pbody"><div class="big">${z.c?cardEl(z.c):`<div class="slot"><div class="card">${face(c.d)}${imgTag(c.d)}</div></div>`}</div><div class="ztext">${extra||zText(c)}${!extra&&z.c&&z.c.att?.length?`<p>Attachments: ${z.c.att.map(a=>esc(N(a))).join(', ')}</p>`:''}</div></div>
   <div class="btns">${btn.join('')}</div></div></div>`}
function pileBox(){const p=ui.pile;if(!p||!G)return'';const l={discard:G.discard,ediscard:G.ediscard,victory:G.victory}[p.k];
  return `<div class="modal"><div class="box"><div class="ph2"><h3>${esc(p.title)} · ${l.length}</h3><button class="ib" id="pclose" aria-label="Close">✕</button></div><div class="row wrap picks">${[...l].reverse().map(c=>cardEl(c)).join('')}</div></div></div>`}
const PILES={discard:'Your discard pile',ediscard:'Encounter discard pile',victory:'Victory display'};
const rotateBox=()=>`<div class="rotate"><svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="currentColor" stroke-width="3"><rect x="20" y="8" width="24" height="44" rx="5"/><path d="M50 40a20 20 0 0 1-14 16M40 52l-4 4 4 4"/></svg><b>Turn your phone sideways to play</b><p>${ui.setup?'Choose the game options in landscape.':'The table needs a landscape screen. Your game is kept as it is.'}</p><button class="ghost" id="rotback">← Scenarios</button></div>`;
function savedGame(){if(G&&!G.over&&!G.error)return{round:G.round,deck:G.deckName,live:true};try{const s=JSON.parse(localStorage.getItem('mk.save')||'null');if(s)return{round:s.round,deck:s.deck.name,save:s}}catch(e){}return null}
function setupBox(){
  const s=ui.setup;if(!s)return'';
  const seg=(label,opts,val)=>`<div class="fld"><label>${label}</label><div class="seg">${opts.map(([v,t,ok])=>`<button class="${v===val?'on':''}" ${ok?'':'disabled'}>${t}</button>`).join('')}</div></div>`;
  if(s.step===0){const g=savedGame();return `<div class="modal"><div class="box sm"><div class="ph2"><h3>${esc(s.scen)}</h3><button class="ib" id="scx" aria-label="Close">✕</button></div>
    <p>A game is in progress: round ${Math.max(1,g.round)}, 1 player, ${esc(g.deck)}.</p>
    <div class="btns"><button class="link" id="scx2">← Scenarios</button><button class="ghost" id="snew">New game</button><button class="gold" id="scont">Continue</button></div></div></div>`}
  if(s.step===1)return `<div class="modal"><div class="box"><div class="ph2"><h3>${esc(s.scen)}</h3><button class="ib" id="scx" aria-label="Close">✕</button></div>
    <div class="fields">${seg('Mode',[['pve','PvE',1],['enc','Encounter',0]],'pve')}${seg('Players',[[1,'1',1],[2,'2',0],[3,'3',0],[4,'4',0]],1)}${seg('Difficulty',[['e','Easy',0],['n','Normal',1],['x','Nightmare',0]],'n')}${seg('Campaign mode',[['y','Yes',0],['ex','Expert',0],['no','No',1]],'no')}</div>
    <p class="muted">Only the automated options are available.</p><div class="btns"><button class="ghost" id="scx2">Cancel</button><button class="gold" id="sc1">Next</button></div></div></div>`;
  const my=deckList();
  return `<div class="modal"><div class="box"><div class="ph2"><h3>Choose your deck</h3><button class="ib" id="scx" aria-label="Close">✕</button></div>
   <div class="dpick">${Object.entries(STARTERS).map(([k,d])=>`<button class="dp ${s.deck==='s:'+k?'on':''}" data-dp="s:${k}" ${k===AUTO_DECK?'':'disabled'}>${esc(d.name.replace('Core Set — ','Core Set: '))}<small>${k===AUTO_DECK?'Starter deck':'Locked'}</small></button>`).join('')}
   ${my.map((d,i)=>`<button class="dp ${s.deck==='m:'+i?'on':''}" data-dp="m:${i}">${esc(d.name)}<small>Custom · ${deckSize(d)} cards</small></button>`).join('')}</div>
   <div class="btns"><button class="ghost" id="scx2">Cancel</button><button class="gold" id="sc2" ${s.deck?'':'disabled'}>Start</button></div></div></div>`}

H.render=function(){
  const r=route(),app=$('#app');
  const body=r==='table'?board():r==='decks'?pageDecks():r==='builder'?pageBuilder():pagePlay();
  const y=window.scrollY;
  app.className=(r==='table'?'is-board ':'')+(r==='table'&&desk()?'desk ':'')+(r==='table'||ui.setup?'need-land':'');
  app.innerHTML=(r==='table'?'':nav())+body+pileBox()+zoomBox()+setupBox()+rotateBox();
  if(r!=='table')window.scrollTo(0,y);
  const q=$('#q');if(q&&ui.focusQ){q.focus();q.setSelectionRange(q.value.length,q.value.length)}
};
let lastDeck=null;
H.save=()=>{try{localStorage.setItem('mk.save',JSON.stringify({scen:AUTO_SCEN,deck:lastDeck,round:G.round,state:saveState()}))}catch(e){}};
const clearSave=()=>{try{localStorage.removeItem('mk.save')}catch(e){}};
function startWith(deck){clearSave();lastDeck=deck;ui.setup=null;ui.hand=false;ui.log=false;newGame(deck);location.hash='table';H.render();runGame()}
function openZoom(c){ui.zoom={c};if(G&&G.hand.includes(c)&&pending?.kind==='window'&&canPlay(c))ui.alloc=Object.fromEntries(defaultAlloc(c,costOf(c)));H.render()}
function bump(uid,d,cost,c){const h=payers(c).find(x=>x.uid===+uid);if(!h)return;const n=(ui.alloc[uid]||0)+d;if(n<0||n>h.res||allocSum()+d>cost)return;ui.alloc[uid]=n}

document.addEventListener('input',e=>{if(e.target.id==='q'){ui.q=e.target.value;ui.focusQ=true;H.render();ui.focusQ=false}if(e.target.id==='bname')ui.build.name=e.target.value});
document.addEventListener('click',e=>{
  const t=e.target.closest('button,[data-uid],[data-def],[data-deck],[data-my],.pile,#zbg');if(!t)return;
  const id=t.id,P=pending;
  if(t.dataset.ed){ui.open[t.dataset.ed]=!ui.open[t.dataset.ed];return H.render()}
  if(t.dataset.scen){ui.setup={step:savedGame()?0:1,scen:t.dataset.scen,deck:'s:'+AUTO_DECK};return H.render()}
  if(id==='rotback'){ui.setup=null;location.hash='play';return H.render()}
  if(id==='snew'){ui.setup.step=1;return H.render()}
  if(id==='scont'){const g=savedGame();ui.setup=null;
    if(g&&g.live){location.hash='table';return H.render()}
    if(g&&g.save){lastDeck=g.save.deck;try{loadState(g.save.state)}catch(err){clearSave();ui.setup={step:1,scen:AUTO_SCEN,deck:'s:'+AUTO_DECK};return H.render()}
      pending=null;ui.hand=false;ui.log=false;location.hash='table';H.render();runGame(true)}
    return}
  if(id==='scx'||id==='scx2'){ui.setup=null;return H.render()}
  if(id==='sc1'){ui.setup.step=2;return H.render()}
  if(t.dataset.dp){ui.setup.deck=t.dataset.dp;return H.render()}
  if(id==='sc2'){const[k,v]=ui.setup.deck.split(':');const d=k==='s'?{name:STARTERS[v].name,heroes:STARTERS[v].heroes,cards:STARTERS[v].cards}:deckList()[+v];return startWith(d)}
  if(t.dataset.deck){ui.deckView=STARTERS[t.dataset.deck];window.scrollTo(0,0);return H.render()}
  if(t.dataset.my){ui.deckView=deckList()[+t.dataset.my];window.scrollTo(0,0);return H.render()}
  if(id==='back'){ui.deckView=null;return H.render()}
  if(t.dataset.inc||t.dataset.dec){const did=t.dataset.inc||t.dataset.dec,d=def(did),b=ui.build,inc=!!t.dataset.inc;
    if(d.type==='Hero'){if(inc&&!b.heroes.includes(did)&&b.heroes.length<3)b.heroes.push(did);if(!inc)b.heroes=b.heroes.filter(x=>x!==did)}
    else{const lim=d.name==='The Red Arrow'?1:3;b.cards[did]=Math.max(0,Math.min(lim,(b.cards[did]||0)+(inc?1:-1)));if(!b.cards[did])delete b.cards[did]}
    return H.render()}
  if(id==='bsave'){const b=ui.build,l=deckList();l.push({name:b.name||'Deck',heroes:b.heroes,cards:Object.entries(b.cards)});saveDecks(l);ui.build=null;location.hash='decks';ui.deckView=null;return H.render()}
  if(id==='bclear'){ui.build=null;return H.render()}
  if(t.dataset.pinc||t.dataset.pdec){const c=P&&P.kind==='pay'?P.card:ui.zoom&&ui.zoom.c,cost=P&&P.kind==='pay'?P.cost:costOf(c);
    bump(t.dataset.pinc||t.dataset.pdec,t.dataset.pinc?1:-1,cost,c);return H.render()}
  if(t.dataset.def&&!e.target.closest('.qty')){ui.zoom={d:def(t.dataset.def)};return H.render()}
  if(id==='zclose'||id==='zclose2'||(id==='zbg'&&e.target===t)){ui.zoom=null;return H.render()}
  if(id==='zplay'){const c=ui.zoom.c;return resolve({type:'play',c,alloc:allocArr()})}
  if(id==='zabil'){const c=ui.zoom.c;return resolve({type:'abil',c})}
  if(id==='payok'&&P)return resolve(allocArr());
  if(id==='payno'&&P)return resolve(null);
  if(id==='pass')return resolve('pass');
  if(id==='tlog'){ui.log=!ui.log;return H.render()}
  if(id==='thand'){ui.hand=!ui.hand;return H.render()}
  if(id==='min'){ui.min=true;return H.render()}
  if(id==='unmin'){ui.min=false;return H.render()}
  if(id==='again')return startWith(lastDeck);
  if(id==='pclose'){ui.pile=null;return H.render()}
  if(t.dataset.opt!=null&&P)return resolve(P.options[+t.dataset.opt].value);
  if(id==='none'&&P)return resolve([]);
  if(id==='ok'&&P)return resolve(P.cands.filter(c=>ui.sel.has(c.uid)));
  if(t.dataset.uid){const c=find(t.dataset.uid);if(!c)return;
    if(t.closest('.pile')&&!t.closest('.modal')){const k=t.closest('.pile').dataset.pile;if(PILES[k]){ui.pile={k,title:PILES[k]};return H.render()}}
    if(P&&P.kind==='pick'&&(P.inline||!ui.min)&&P.cands.includes(c)&&(P.inline?!t.closest('.modal'):!!t.closest('.modal'))){
      if(ui.sel.has(c.uid))ui.sel.delete(c.uid);else{if(P.max===1)ui.sel.clear();if(ui.sel.size<P.max)ui.sel.add(c.uid)}return H.render()}
    if(t.closest('.zoom'))return;
    return openZoom(c)}
  if(t.classList.contains('pile')&&G){const k=t.dataset.pile,l={discard:G.discard,ediscard:G.ediscard,victory:G.victory}[k];if(l&&l.length){ui.pile={k,title:PILES[k]};return H.render()}}
});
// hover preview (only on screens with a mouse)
const hov=document.createElement('div');hov.id='hov';document.body.appendChild(hov);
const fine=matchMedia('(hover:hover) and (pointer:fine)');
const hideHov=()=>{hov.className=''};
document.addEventListener('mouseover',e=>{
  if(!fine.matches)return;
  const t=e.target.closest('[data-uid],[data-def]');if(!t)return hideHov();
  const c=t.dataset.uid?find(t.dataset.uid):{d:def(t.dataset.def)};
  if(!c||!c.d||(t.classList.contains('shd')&&!c.up))return hideHov();
  const r=t.getBoundingClientRect(),left=r.left+r.width/2>innerWidth*.55;
  hov.innerHTML=`<div class="card ${c.d.type==='Quest'?'wide':''}">${face(c.d)}${imgTag(c.d)}</div>`;
  hov.className='on '+(left?'l':'r')+(c.d.type==='Quest'?' w':'')});
document.addEventListener('mousedown',hideHov);
document.addEventListener('mouseleave',hideHov);
let rz;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>route()==='table'&&H.render(),120)});
window.addEventListener('hashchange',()=>{if(location.hash!=='#decks')ui.deckView=null;ui.zoom=null;H.render()});
H.render();
}
