// ===== Interface =====
{
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SPH={Leadership:'#8d4cb4',Tactics:'#b8392f',Spirit:'#3a90cc',Lore:'#3f9450',Neutral:'#8c8778',Baggins:'#c9a227',Fellowship:'#c9a227'};
const TP={Hero:'Herói',Ally:'Aliado',Attachment:'Anexo',Event:'Evento',Enemy:'Inimigo',Location:'Localização',Treachery:'Traição',Quest:'Missão'};
const icon=t=>String(t||'').replace(/\[(\w+)\]/g,(m,k)=>({willpower:'FV',attack:'ATQ',defense:'DEF',threat:'AME',tactics:'Tactics',spirit:'Spirit',leadership:'Leadership',lore:'Lore'}[k]||k));
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
const ui={open:{'Revised Core Set':true},q:'',hand:false,log:false,min:false,sel:new Set(),zoom:null,deckView:null,setup:null,build:null};
let pending=null;
H.ask=cfg=>new Promise(res=>{pending={...cfg,res};ui.sel=new Set();ui.min=false;if(cfg.kind==='window')ui.zoom=null;H.render()});
H.openHand=()=>{ui.hand=true};
H.onEnd=()=>{pending=null;try{localStorage.removeItem('mk.save')}catch(e){}};
const resolve=v=>{const p=pending;pending=null;ui.zoom=null;p.res(v)};

// ---------- cartas ----------
function face(d,big){
  const col=SPH[d.sphere]||(d.type==='Enemy'?'#6d2a22':d.type==='Location'?'#4d5a3a':d.type==='Treachery'?'#4b3a5c':'#5b5145');
  const st=[];
  if(d.type==='Hero')st.push(['AME',d.cost]);else if(d.cost!=null&&d.type!=='Quest')st.push(['Custo',d.cost]);
  if(d.eng!=null)st.push(['Enf',d.eng]);if(d.thr!=null&&d.type!=='Hero')st.push(['AME',d.thr]);
  for(const[k,l]of[['w','FV'],['a','ATQ'],['d','DEF'],['hp','PV'],['qp','PM']])if(d[k]!=null)st.push([l,d[k]]);
  return `<div class="face" style="--sc:${col}"><b class="nm">${d.unique?'◆ ':''}${esc(d.name)}</b><i class="ty">${esc(TP[d.type]||d.type)}${d.sphere?' · '+esc(d.sphere):''}${d.type==='Quest'?' · etapa '+d.cost+(d.side||''):''}</i>
  <div class="st">${st.map(([l,v])=>`<span><small>${l}</small>${v}</span>`).join('')}</div>
  ${d.traits?.length?`<i class="tr">${esc(d.traits.join('. '))}.</i>`:''}${big||1?`<p class="tx">${esc(icon([d.kw,d.text].filter(Boolean).join(' ')))}</p>`:''}${big&&d.shadow?`<p class="tx sh">${esc(icon(d.shadow))}</p>`:''}</div>`}
const imgTag=(d,cls='')=>`<img class="${cls}" src="${IMGBASE+d.img}" alt="" loading="lazy" onerror="this.remove()">`;
const backTag=k=>`<div class="back ${k}"><span>${k==='encounter'?'Encontro':'Jogador'}</span><img src="${BACKS[k]}" alt="" onerror="this.remove()"></div>`;
function cardEl(c,o={}){
  const d=c.d,cls=['card',d.type==='Quest'?'wide':'',c.exh?'exh':'',c.committed?'com':'',o.hl?'hl':'',o.sel?'sel':''].join(' ');
  const b=[];
  if(c.res)b.push(`<em class="bd res">${c.res}</em>`);if(c.dmg)b.push(`<em class="bd dmg">${c.dmg}</em>`);if(c.prog)b.push(`<em class="bd prg">${c.prog}</em>`);
  if(c.committed)b.push('<em class="bd com">missão</em>');
  if(o.thr&&G)b.push(`<em class="bd thr">${stat(c,'thr')}</em>`);
  if(o.stats&&G&&isChar(c))b.push(`<em class="bd sts">${stat(c,'w')}·${stat(c,'a')}·${stat(c,'d')}</em>`);
  if(o.atk&&G)b.push(`<em class="bd atk">${stat(c,'a')} atq</em>`);
  if(o.note)b.push(`<em class="bd note">${esc(o.note)}</em>`);
  const att=(c.att||[]).map((a,i)=>`<div class="att" data-uid="${a.uid}" style="--i:${i}">${a.exh?'<i class="ax">esgotado</i>':''}<b>${esc(N(a))}</b>${imgTag(a.d)}</div>`).join('');
  const sh=(c.shadow||[]).map(s=>`<div class="shd" data-uid="${s.uid}">${s.up?`<b>${esc(N(s))}</b>${imgTag(s.d)}`:backTag('encounter')}</div>`).join('');
  return `<div class="slot ${c.exh?'exh':''} ${d.type==='Quest'?'wide':''}" style="--n:${(c.att||[]).length}">${att}<div class="${cls}" data-uid="${c.uid}">${face(d)}${imgTag(d)}${b.join('')}</div>${sh}</div>`}
function pile(list,k,label){return `<div class="pile" data-pile="${label}">${list.length?(k==='up'?cardEl(list[list.length-1]):backTag(k)):'<div class="empty"></div>'}<em class="bd cnt">${list.length}</em></div>`}
function allInst(){if(!G)return[];const z=[...G.heroes,...G.allies,...G.hand,...G.staging,...G.engaged,...G.discard,...G.ediscard,...G.victory,G.active,G.quest].filter(Boolean);
  for(const c of[...z])z.push(...(c.att||[]),...(c.shadow||[]));if(pending?.cands)z.push(...pending.cands);if(pending?.card)z.push(pending.card);if(pending?.cards)z.push(...pending.cards);return z}
const find=uid=>allInst().find(c=>c.uid===+uid)||(G&&[...G.deck,...G.edeck].find(c=>c.uid===+uid));

// ---------- páginas ----------
function nav(){const r=route();return `<header class="top"><b class="brand">Mirkwood<span>LCG</span></b><nav>${[['jogar','Jogar'],['baralhos','Baralhos'],['construtor','Construtor']].map(([h,l])=>`<a href="#${h}" class="${r===h?'on':''}">${l}</a>`).join('')}${G&&!G.over?`<a href="#mesa" class="${r==='mesa'?'on':''} live">Mesa</a>`:''}</nav></header>`}
function route(){const h=location.hash.slice(1);return['jogar','baralhos','construtor','mesa'].includes(h)?h:'jogar'}
function pagePlay(){
  const q=ui.q.toLowerCase();
  const groups=Object.entries(ED).map(([ed,list])=>{const l=list.filter(s=>!q||s.toLowerCase().includes(q)||ed.toLowerCase().includes(q));if(!l.length)return'';
    const open=ui.open[ed]||q,auto=l.some(s=>s===AUTO_SCEN);
    return `<section class="ed ${open?'open':''}" style="--ec:${EDCOL[ed]||'#2a2724'}"><button class="edh" data-ed="${esc(ed)}"><i class="dot ${auto?'on':''}"></i>${esc(ed)}<span class="chev">${open?'▲':'▼'}</span></button>
      ${open?`<div class="scen">${l.map(s=>s===AUTO_SCEN?`<button class="sc" data-scen="${esc(s)}">${esc(s)}<small>Automatizado</small></button>`:`<div class="sc off">${esc(s)}<small>Bloqueado</small></div>`).join('')}</div>`:''}</section>`}).join('');
  return `<main class="page"><h1>Jogar</h1><p class="lede">Escolhe um cenário e joga contra o baralho de encontro. O lado do encontro é totalmente automático; tu decides o que comprometer, quem defende e quem ataca. Os cenários e baralhos ainda sem automação aparecem a cinzento.</p>
  <input class="search" id="q" placeholder="Procurar cenários…" value="${esc(ui.q)}">${groups}
  <details class="how"><summary>Como jogar</summary><ul><li>Toca numa carta para a ver em grande; se puder ser jogada, aparece o botão Jogar.</li><li>Em cada janela de ações, joga cartas da mão e carrega em Continuar.</li><li>Missão: escolhe quem comprometer. A carta de encontro é revelada sozinha e a missão resolve-se automaticamente.</li><li>Combate: para cada inimigo escolhes um defensor (ou nenhum); depois escolhes os teus ataques.</li><li>Respostas como A Test of Will, Wait no Longer e Oath of Eorl são oferecidas no momento certo.</li></ul></details></main>`}
function deckList(){let c=[];try{c=JSON.parse(localStorage.getItem('mk.decks')||'[]')}catch(e){}return c}
function saveDecks(l){try{localStorage.setItem('mk.decks',JSON.stringify(l))}catch(e){}}
const deckSize=d=>d.cards.reduce((t,[,q])=>t+q,0);
function heroStrip(ids){return `<div class="hstrip">${ids.map(id=>{const d=def(id);return `<div class="hmini" style="--sc:${SPH[d.sphere]}"><b>${esc(d.name)}</b>${imgTag(d)}</div>`}).join('')}</div>`}
function pageDecks(){
  if(ui.deckView){const d=ui.deckView,groups={};for(const[id,q]of d.cards){const x=def(id);(groups[x.type]=groups[x.type]||[]).push([x,q,id])}
    return `<main class="page"><button class="ghost" id="back">← Baralhos</button><h1>${esc(d.name)}</h1><p class="lede">${deckSize(d)} cartas · ameaça inicial ${d.heroes.reduce((t,id)=>t+def(id).cost,0)}</p>${heroStrip(d.heroes)}
    ${['Ally','Attachment','Event'].filter(t=>groups[t]).map(t=>`<h2>${TP[t]}s <small>${groups[t].reduce((a,[, q])=>a+q,0)}</small></h2><div class="grid">${groups[t].map(([x,q,id])=>`<div class="tile ${IMPLEMENTED.has(x.name)?'':'locked'}" data-def="${id}"><div class="card">${face(x)}${imgTag(x)}</div><em class="bd cnt">×${q}</em></div>`).join('')}</div>`).join('')}</main>`}
  const st=Object.entries(STARTERS).map(([k,d])=>{const ok=k===AUTO_DECK;return `<div class="deck ${ok?'':'off'}" data-deck="${k}">${heroStrip(d.heroes)}<b>${esc(d.name)}</b><small>${deckSize(d)} cartas · ${ok?'Automatizado':'Bloqueado'}</small></div>`}).join('');
  const my=deckList().map((d,i)=>`<div class="deck" data-my="${i}">${heroStrip(d.heroes)}<b>${esc(d.name)}</b><small>${deckSize(d)} cartas · Personalizado</small></div>`).join('');
  return `<main class="page"><h1>Baralhos</h1><p class="lede">Baralhos iniciais oficiais. Por agora só Riders of Rohan tem todas as cartas automatizadas; os outros ficam bloqueados até as suas cartas terem regras.</p><div class="decks">${st}</div>
  <h2>Os teus baralhos</h2>${my?`<div class="decks">${my}</div>`:'<p class="muted">Ainda não tens baralhos. Cria um no Construtor.</p>'}</main>`}
function pool(){const ids=new Set();for(const d of Object.values(STARTERS))for(const id of[...d.heroes,...d.cards.map(x=>x[0])])ids.add(id);return[...ids].map(id=>[id,def(id)])}
function pageBuilder(){
  const b=ui.build||(ui.build={name:'Novo baralho',heroes:[],cards:{}});
  const P=pool(),on=P.filter(([,d])=>IMPLEMENTED.has(d.name)),off=P.filter(([,d])=>!IMPLEMENTED.has(d.name));
  const n=Object.values(b.cards).reduce((a,v)=>a+v,0),thr=b.heroes.reduce((t,id)=>t+def(id).cost,0);
  const tile=([id,d])=>{const q=d.type==='Hero'?(b.heroes.includes(id)?1:0):(b.cards[id]||0);
    return `<div class="tile ${q?'pick':''}" data-def="${id}"><div class="card">${face(d)}${imgTag(d)}</div><div class="qty"><button data-dec="${id}" aria-label="Menos">−</button><b>${q}</b><button data-inc="${id}" aria-label="Mais">+</button></div></div>`};
  const by=t=>on.filter(([,d])=>d.type===t);
  return `<main class="page"><h1>Construtor</h1><p class="lede">Monta um baralho só com cartas automatizadas: até 3 heróis e até 3 cópias de cada carta (1 nas únicas e na The Red Arrow).</p>
  <div class="bbar"><input id="bname" value="${esc(b.name)}" aria-label="Nome do baralho"><span>${b.heroes.length}/3 heróis · ${n} cartas · ameaça ${thr}${n&&n<50?' · baralhos normais têm 50+':''}</span><button class="gold" id="bsave" ${b.heroes.length&&n>=20?'':'disabled'}>Guardar</button><button class="ghost" id="bclear">Limpar</button></div>
  ${['Hero','Ally','Attachment','Event'].map(t=>`<h2>${TP[t]}s</h2><div class="grid">${by(t).map(tile).join('')}</div>`).join('')}
  <details class="how"><summary>${off.length} cartas ainda bloqueadas (sem automação)</summary><div class="grid">${off.map(([id,d])=>`<div class="tile locked" data-def="${id}"><div class="card">${face(d)}${imgTag(d)}</div></div>`).join('')}</div></details></main>`}

// ---------- mesa ----------
function board(){
  if(!G)return `<main class="page"><p class="muted">Não há jogo a decorrer. <a href="#jogar">Escolhe um cenário.</a></p></main>`;
  const P=pending,pk=P&&P.kind==='pick'&&!ui.min?null:null;
  const hl=c=>G.window&&(G.hand.includes(c)?canPlay(c):canUse(c));
  const zone=(cls,label,inner,extra='')=>`<section class="zone ${cls}"><label>${label}</label><div class="row">${inner}</div>${extra}</section>`;
  const thrS=stagingThreat();
  return `<div class="board">
   <div class="brow r1">
     ${zone('z-quest','Missão',cardEl(G.quest)+`<em class="bd prgq">${G.qprog}/${G.quest.d.qp??'–'}</em>`)}
     ${zone('z-pile','Encontro',pile(G.edeck,'encounter','edeck'))}
     ${zone('z-pile','Descarte',pile(G.ediscard,'up','ediscard'))}
     ${zone('z-staging grow','Preparação',G.staging.map(c=>cardEl(c,{thr:1})).join(''),`<em class="bd thrT" title="Ameaça total">${thrS}</em>`)}
   </div>
   <div class="brow r2">
     ${zone('z-heroes grow','Heróis',G.heroes.map(c=>cardEl(c,{stats:1,hl:hl(c)})).join(''))}
     ${zone('z-loc','Localização',G.active?cardEl(G.active):'')}
     ${zone('z-eng grow','Enfrentados',G.engaged.map(c=>cardEl(c,{atk:1,note:c.feint?'Feint':''})).join(''))}
   </div>
   <div class="brow r3">
     ${zone('z-play grow','Área de jogo',G.allies.map(c=>cardEl(c,{stats:1,hl:hl(c)})).join(''))}
     ${zone('z-pile','Baralho',pile(G.deck,'player','deck'))}
     ${zone('z-pile','Descarte',pile(G.discard,'up','discard'))}
     ${G.victory.length?zone('z-pile','Vitória',pile(G.victory,'up','victory')):''}
   </div>
  </div>
  ${ui.hand?`<section class="hand"><label>Mão · ${G.hand.length}</label><div class="row">${G.hand.map(c=>cardEl(c,{hl:hl(c)})).join('')||'<p class="muted">Mão vazia.</p>'}</div></section>`:''}
  ${ui.log?`<aside class="log">${G.log.slice(-80).reverse().map(l=>`<p class="${l.cls}">${esc(l.m)}</p>`).join('')}</aside>`:''}
  <footer class="bar">
    <a class="ib btn ghost" href="#jogar" aria-label="Menu">Menu</a><button class="ib" id="tlog" aria-label="Registo">${ui.log?'✕':'☰'}</button>
    <span class="thr" title="Ameaça">${G.threat}<small>ameaça</small></span>
    <span class="ph">${G.round?G.round+' · ':''}${esc(G.phase)}${G.over?' · fim':''}</span>
    ${P&&P.kind==='window'?`<span class="wt">${esc(P.title)}</span><button class="gold" id="pass">Continuar</button>`:''}
    ${P&&P.kind!=='window'&&ui.min?`<button class="gold" id="unmin">Voltar à escolha</button>`:''}
    <button class="ib hb" id="thand">${ui.hand?'▼':'▲'} Mão ${G.hand.length}</button>
  </footer>
  ${G.error?`<div class="modal"><div class="box"><h3>Erro no motor</h3><pre>${esc(G.error)}</pre><a class="gold btn" href="#jogar">Voltar</a></div></div>`:''}
  ${G.over?`<div class="modal"><div class="box end ${G.over.win?'win':'lose'}"><h3>${G.over.win?'Vitória':'Derrota'}</h3><p>${esc(G.over.msg)}</p><p class="muted">Ronda ${G.round} · ameaça ${G.threat} · ${G.victory.reduce((t,c)=>t+(c.d.vp||0),0)} pontos de vitória</p><div class="btns"><button class="gold" id="again">Jogar outra vez</button><a class="ghost btn" href="#jogar">Menu</a></div></div></div>`:''}
  ${P&&P.kind!=='window'&&!ui.min?promptBox(P):''}`}
function promptBox(P){
  const head=`<div class="ph2"><h3>${esc(P.title)}</h3><button class="ib" id="min" aria-label="Ver mesa">–</button></div>`;
  if(P.kind==='buttons')return `<div class="modal"><div class="box">${head}${P.text?`<p>${esc(icon(P.text))}</p>`:''}
    <div class="pbody">${P.card?`<div class="big">${cardEl(P.card)}</div>`:''}${P.card&&!P.cards?`<div class="ztext">${zText(P.card)}</div>`:''}${P.cards?`<div class="row wrap">${P.cards.map(c=>cardEl(c)).join('')}</div>`:''}</div>
    <div class="btns">${P.options.map((o,i)=>`<button class="${o.primary?'gold':'ghost'}" data-opt="${i}">${esc(o.label)}</button>`).join('')}</div></div></div>`;
  const ok=ui.sel.size>=P.min&&ui.sel.size<=P.max;
  const lab=c=>P.stat==='hpleft'?`${stat(c,'hp')-c.dmg} PV`:P.stat==='qp'?`${c.d.qp} PM · ${stat(c,'thr')} AME`:P.stat==='eng'?`enfrent. ${c.d.eng}`:P.stat?`${{w:'FV',a:'ATQ',d:'DEF'}[P.stat]} ${stat(c,P.stat)}${isChar(c)?` · ${stat(c,'hp')-c.dmg} PV`:''}`:'';
  const sum=P.stat&&['w','a'].includes(P.stat)?[...ui.sel].reduce((t,u)=>t+stat(find(u),P.stat),0):null;
  return `<div class="modal"><div class="box">${head}${P.text?`<p>${esc(P.text)}</p>`:''}
    <div class="pbody">${P.card?`<div class="big sm">${cardEl(P.card)}</div>`:''}<div class="row wrap picks">${P.cands.map(c=>`<div class="pk">${cardEl(c,{sel:ui.sel.has(c.uid)})}<small>${esc(lab(c))}</small></div>`).join('')}</div></div>
    <div class="btns"><span class="muted">${P.max>1?`${ui.sel.size} escolhida(s)`:''}${sum!=null?` · total ${sum}`:''}</span>${P.min===0?`<button class="ghost" id="none">${P.max>1?'Nenhuma':'Nenhum / passar'}</button>`:''}<button class="gold" id="ok" ${ok?'':'disabled'}>Confirmar</button></div></div></div>`}
function zText(c){const d=c.d;return `<b class="zn">${esc(d.name)}</b><i>${esc(TP[d.type]||d.type)}${d.sphere?' · '+esc(d.sphere):''}${d.traits?.length?' · '+esc(d.traits.join('. ')):''}</i>
  ${d.kw?`<p><b>${esc(d.kw)}</b></p>`:''}${d.text?`<p>${esc(icon(d.text))}</p>`:''}${d.shadow?`<p class="sh">${esc(icon(d.shadow))}</p>`:''}
  ${G&&isChar(c)?`<p class="cur">Atual: FV ${stat(c,'w')} · ATQ ${stat(c,'a')} · DEF ${stat(c,'d')} · PV ${stat(c,'hp')-c.dmg}/${stat(c,'hp')}</p>`:''}
  ${G&&(isEnemy(c)&&enemiesInPlay().includes(c))?`<p class="cur">Atual: ATQ ${stat(c,'a')} · DEF ${stat(c,'d')} · PV ${stat(c,'hp')-c.dmg}/${stat(c,'hp')} · AME ${stat(c,'thr')}</p>`:''}
  ${!IMPLEMENTED.has(d.name)&&d.back==='player'?'<p class="muted">Carta ainda sem automação.</p>':''}`}
function zoomBox(){
  const z=ui.zoom;if(!z)return'';const c=z.c||{d:z.d,att:[]};
  const btn=[];
  if(z.c&&G&&pending?.kind==='window'){
    if(G.hand.includes(z.c)){if(canPlay(z.c))btn.push(`<button class="gold" id="zplay">Jogar (custo ${costOf(z.c)})</button>`);else btn.push(`<span class="muted">${RESP[N(z.c)]||'Não pode ser jogada agora.'}</span>`)}
    if(canUse(z.c))btn.push(`<button class="gold" id="zabil">${esc(ABIL[N(z.c)].label)}</button>`)}
  return `<div class="modal" id="zbg"><div class="box zoom"><div class="ph2"><h3>${esc(c.d.name)}</h3><button class="ib" id="zclose" aria-label="Fechar">✕</button></div>
   <div class="pbody"><div class="big">${z.c?cardEl(z.c):`<div class="slot"><div class="card">${face(c.d)}${imgTag(c.d)}</div></div>`}</div><div class="ztext">${zText(c)}${z.c&&z.c.att?.length?`<p>Anexos: ${z.c.att.map(a=>esc(N(a))).join(', ')}</p>`:''}</div></div>
   <div class="btns">${btn.join('')}</div></div></div>`}
function pileBox(){const p=ui.pile;if(!p||!G)return'';const l={discard:G.discard,ediscard:G.ediscard,victory:G.victory}[p.k];
  return `<div class="modal"><div class="box"><div class="ph2"><h3>${esc(p.title)} · ${l.length}</h3><button class="ib" id="pclose" aria-label="Fechar">✕</button></div><div class="row wrap picks">${[...l].reverse().map(c=>cardEl(c)).join('')}</div></div></div>`}
const rotateBox=()=>`<div class="rotate"><svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="currentColor" stroke-width="3"><rect x="20" y="8" width="24" height="44" rx="5"/><path d="M50 40a20 20 0 0 1-14 16M40 52l-4 4 4 4"/></svg><b>Vira o telemóvel para jogar</b><p>${ui.setup?'Escolhe as opções do jogo com o ecrã na horizontal.':'A mesa precisa de ecrã na horizontal. O jogo fica como está.'}</p><button class="ghost" id="rotback">← Cenários</button></div>`;
function savedGame(){if(G&&!G.over&&!G.error)return{round:G.round,deck:G.deckName,live:true};try{const s=JSON.parse(localStorage.getItem('mk.save')||'null');if(s)return{round:s.round,deck:s.deck.name,save:s}}catch(e){}return null}
function setupBox(){
  const s=ui.setup;if(!s)return'';
  const seg=(label,opts,val)=>`<div class="fld"><label>${label}</label><div class="seg">${opts.map(([v,t,ok])=>`<button class="${v===val?'on':''}" ${ok?'':'disabled'}>${t}</button>`).join('')}</div></div>`;
  if(s.step===0){const g=savedGame();return `<div class="modal"><div class="box sm"><div class="ph2"><h3>${esc(s.scen)}</h3><button class="ib" id="scx" aria-label="Fechar">✕</button></div>
    <p>Há um jogo em curso: ronda ${Math.max(1,g.round)}, 1 jogador, baralho ${esc(g.deck)}.</p>
    <div class="btns"><button class="link" id="scx2">← Cenários</button><button class="ghost" id="snew">Novo jogo</button><button class="gold" id="scont">Continuar</button></div></div></div>`}
  if(s.step===1)return `<div class="modal"><div class="box"><div class="ph2"><h3>${esc(s.scen)}</h3><button class="ib" id="scx" aria-label="Fechar">✕</button></div>
    <div class="fields">${seg('Modo',[['pve','PvE',1],['enc','Encounter',0]],'pve')}${seg('Jogadores',[[1,'1',1],[2,'2',0],[3,'3',0],[4,'4',0]],1)}${seg('Dificuldade',[['e','Easy',0],['n','Normal',1],['x','Nightmare',0]],'n')}${seg('Modo campanha',[['y','Yes',0],['ex','Expert',0],['no','No',1]],'no')}</div>
    <p class="muted">Só as opções automatizadas estão ativas.</p><div class="btns"><button class="ghost" id="scx2">Cancelar</button><button class="gold" id="sc1">Seguinte</button></div></div></div>`;
  const my=deckList();
  return `<div class="modal"><div class="box"><div class="ph2"><h3>Escolhe o teu baralho</h3><button class="ib" id="scx" aria-label="Fechar">✕</button></div>
   <div class="dpick">${Object.entries(STARTERS).map(([k,d])=>`<button class="dp ${s.deck==='s:'+k?'on':''}" data-dp="s:${k}" ${k===AUTO_DECK?'':'disabled'}>${esc(d.name)}<small>${k===AUTO_DECK?'Baralho inicial':'Bloqueado'}</small></button>`).join('')}
   ${my.map((d,i)=>`<button class="dp ${s.deck==='m:'+i?'on':''}" data-dp="m:${i}">${esc(d.name)}<small>Personalizado · ${deckSize(d)} cartas</small></button>`).join('')}</div>
   <div class="btns"><button class="ghost" id="scx2">Cancelar</button><button class="gold" id="sc2" ${s.deck?'':'disabled'}>Começar</button></div></div></div>`}

H.render=function(){
  const r=route(),app=$('#app');
  const body=r==='mesa'?board():r==='baralhos'?pageDecks():r==='construtor'?pageBuilder():pagePlay();
  const y=window.scrollY;
  app.className=(r==='mesa'?'is-board ':'')+(r==='mesa'||ui.setup?'need-land':'');
  app.innerHTML=(r==='mesa'?'':nav())+body+pileBox()+zoomBox()+setupBox()+rotateBox();
  if(r!=='mesa')window.scrollTo(0,y);
  const q=$('#q');if(q&&ui.focusQ){q.focus();q.setSelectionRange(q.value.length,q.value.length)}
};
let lastDeck=null;
H.save=()=>{try{localStorage.setItem('mk.save',JSON.stringify({scen:AUTO_SCEN,deck:lastDeck,round:G.round,state:saveState()}))}catch(e){}};
const clearSave=()=>{try{localStorage.removeItem('mk.save')}catch(e){}};
function startWith(deck){clearSave();lastDeck=deck;ui.setup=null;ui.hand=false;ui.log=false;newGame(deck);location.hash='mesa';H.render();runGame()}

document.addEventListener('input',e=>{if(e.target.id==='q'){ui.q=e.target.value;ui.focusQ=true;H.render();ui.focusQ=false}if(e.target.id==='bname')ui.build.name=e.target.value});
document.addEventListener('click',e=>{
  const t=e.target.closest('button,[data-uid],[data-def],[data-deck],[data-my],.pile,#zbg');if(!t)return;
  const id=t.id,P=pending;
  if(t.dataset.ed){ui.open[t.dataset.ed]=!ui.open[t.dataset.ed];return H.render()}
  if(t.dataset.scen){ui.setup={step:savedGame()?0:1,scen:t.dataset.scen,deck:'s:'+AUTO_DECK};return H.render()}
  if(id==='rotback'){ui.setup=null;location.hash='jogar';return H.render()}
  if(id==='snew'){ui.setup.step=1;return H.render()}
  if(id==='scont'){const g=savedGame();ui.setup=null;
    if(g&&g.live){location.hash='mesa';return H.render()}
    if(g&&g.save){lastDeck=g.save.deck;try{loadState(g.save.state)}catch(e){clearSave();ui.setup={step:1,scen:AUTO_SCEN,deck:'s:'+AUTO_DECK};return H.render()}
      pending=null;ui.hand=false;ui.log=false;location.hash='mesa';H.render();runGame(true)}
    return}
  if(id==='scx'||id==='scx2'){ui.setup=null;return H.render()}
  if(id==='sc1'){ui.setup.step=2;return H.render()}
  if(t.dataset.dp){ui.setup.deck=t.dataset.dp;return H.render()}
  if(id==='sc2'){const[k,v]=ui.setup.deck.split(':');const d=k==='s'?{name:STARTERS[v].name,heroes:STARTERS[v].heroes,cards:STARTERS[v].cards}:deckList()[+v];return startWith(d)}
  if(t.dataset.deck){if(t.classList.contains('off')&&!e.target.closest('.deck'))return;ui.deckView=STARTERS[t.dataset.deck];window.scrollTo(0,0);return H.render()}
  if(t.dataset.my){ui.deckView=deckList()[+t.dataset.my];window.scrollTo(0,0);return H.render()}
  if(id==='back'){ui.deckView=null;return H.render()}
  if(t.dataset.inc||t.dataset.dec){const did=t.dataset.inc||t.dataset.dec,d=def(did),b=ui.build,inc=!!t.dataset.inc;
    if(d.type==='Hero'){if(inc&&!b.heroes.includes(did)&&b.heroes.length<3)b.heroes.push(did);if(!inc)b.heroes=b.heroes.filter(x=>x!==did)}
    else{const lim=d.unique||d.name==='The Red Arrow'?(d.name==='The Red Arrow'?1:3):3;b.cards[did]=Math.max(0,Math.min(lim,(b.cards[did]||0)+(inc?1:-1)));if(!b.cards[did])delete b.cards[did]}
    return H.render()}
  if(id==='bsave'){const b=ui.build,l=deckList();l.push({name:b.name||'Baralho',heroes:b.heroes,cards:Object.entries(b.cards)});saveDecks(l);ui.build=null;location.hash='baralhos';ui.deckView=null;return H.render()}
  if(id==='bclear'){ui.build=null;return H.render()}
  if(t.dataset.def&&!e.target.closest('.qty')){ui.zoom={d:def(t.dataset.def)};return H.render()}
  if(id==='zclose'||(id==='zbg'&&e.target===t)){ui.zoom=null;return H.render()}
  if(id==='zplay'){const c=ui.zoom.c;return resolve({type:'play',c})}
  if(id==='zabil'){const c=ui.zoom.c;return resolve({type:'abil',c})}
  if(id==='pass')return resolve('pass');
  if(id==='tlog'){ui.log=!ui.log;return H.render()}
  if(id==='thand'){ui.hand=!ui.hand;return H.render()}
  if(id==='min'){ui.min=true;return H.render()}
  if(id==='unmin'){ui.min=false;return H.render()}
  if(id==='again'){return startWith(lastDeck)}
  if(t.dataset.opt!=null&&P)return resolve(P.options[+t.dataset.opt].value);
  if(id==='none'&&P)return resolve([]);
  if(id==='ok'&&P)return resolve(P.cands.filter(c=>ui.sel.has(c.uid)));
  if(t.dataset.uid){const c=find(t.dataset.uid);if(!c)return;
    if(t.closest('.pile')&&!t.closest('.modal')){const k=t.closest('.pile').dataset.pile;if(k!=='edeck'&&k!=='deck'){ui.pile={k,title:{discard:'O teu descarte',ediscard:'Descarte de encontro',victory:'Vitória'}[k]};return H.render()}}
    if(P&&P.kind==='pick'&&!ui.min&&P.cands.includes(c)){
      if(ui.sel.has(c.uid))ui.sel.delete(c.uid);else{if(P.max===1)ui.sel.clear();if(ui.sel.size<P.max)ui.sel.add(c.uid)}return H.render()}
    if(t.closest('.zoom'))return;
    ui.zoom={c};return H.render()}
  if(id==='pclose'){ui.pile=null;return H.render()}
  if(t.classList.contains('pile')&&G){const k=t.dataset.pile,l={discard:G.discard,ediscard:G.ediscard,victory:G.victory}[k];if(l&&l.length){ui.pile={k,title:{discard:'O teu descarte',ediscard:'Descarte de encontro',victory:'Vitória'}[k]};return H.render()}}
});
window.addEventListener('hashchange',()=>{if(location.hash!=='#baralhos')ui.deckView=null;ui.zoom=null;H.render()});
H.render();
}
