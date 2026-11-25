// ===== Motor de regras: Passage Through Mirkwood + Riders of Rohan (solo) =====
const IMGBASE='https://dragncards-lotrlcg.s3.amazonaws.com/cards/English/';
const BACKS={player:'https://dragncards-lotrlcg.s3.amazonaws.com/cardbacks/player.jpg',encounter:'https://dragncards-lotrlcg.s3.amazonaws.com/cardbacks/encounter.jpg'};
const P='51223bd0-ffd1-11df-a976-0801200c9';
const Q1=P+'119',Q2=P+'121',QPATH=P+'123',QBEORN=P+'125';
let G=null,UID=1;
const H={ask:null,render(){},onEnd(){}};
class GameOver extends Error{constructor(win,msg){super(msg);this.win=win}}
const def=(id,s=0)=>{const c=CARDS[id];return Array.isArray(c)?c[s]:c};
const mk=(id,side=0)=>({uid:UID++,id,side,d:def(id,side),exh:false,dmg:0,res:0,prog:0,att:[],mods:[],committed:false,shadow:[]});
function resetCard(c){Object.assign(c,{exh:false,dmg:0,res:0,prog:0,att:[],mods:[],committed:false,shadow:[],feint:false,muster:false,rk:false,host:null});return c}
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const N=c=>c.d.name;
const log=(m,cls='')=>{G.log.push({m,cls,r:G.round});if(G.log.length>400)G.log.shift();H.render()};
const ask=cfg=>H.ask(cfg);
const chars=()=>[...G.heroes,...G.allies];
const isChar=c=>G.heroes.includes(c)||G.allies.includes(c);
const isHero=c=>G.heroes.includes(c);
const isEnemy=c=>c.d.type==='Enemy';
const isLoc=c=>c.d.type==='Location';
const enemiesInPlay=()=>[...G.staging.filter(isEnemy),...G.engaged];
const activeName=()=>G.active&&N(G.active);
const RESTRICTED=['War Axe','Horn of the Mark','Firefoot'];
const sortEng=a=>[...a].sort((x,y)=>(y.d.eng||0)-(x.d.eng||0));

// Cartas com regras implementadas (o resto da coleção fica bloqueado)
const IMPLEMENTED=new Set(['Éomer','Lothíriel','Hirgon','Horseback Archer','Feint','A Test of Will','Gandalf','The Red Arrow','Wait no Longer','Riddermark Knight','Oath of Eorl','War Axe','Horn of the Mark','The Muster of Rohan','Westfold Lancer','Westfold Horse-Breaker','Escort from Edoras','Éomund','Ancient Mathom','Astonishing Speed','Guthlaf','West Road Traveller','Forth Eorlingas!','Westfold Outrider','Westfold Horse-breeder','Firefoot']);

function traitsOf(c){const t=[...(c.d.traits||[])];if(N(c)==='Lothíriel'&&G&&chars().some(x=>N(x)==='Éomer'))t.push('Rohan');return t}
const hasTrait=(c,t)=>traitsOf(c).includes(t);
function attBonus(a,c,s){const n=N(a);
  if(n==='The Red Arrow'&&s==='w')return 1;
  if(n==='War Axe'&&s==='a')return c.att.filter(x=>RESTRICTED.includes(N(x))).length;
  if(n==='Firefoot'&&s==='a')return N(c)==='Éomer'?2:1;
  return 0}
function stat(c,s){
  let v=c.d[s]||0;
  for(const m of c.mods)if(m.s===s)v+=m.v;
  for(const a of c.att)v+=attBonus(a,c,s);
  for(const e of G.effects)v+=e.fn(c,s)||0;
  if(N(c)==='Escort from Edoras'&&s==='w'&&c.committed)v+=2;
  if(N(c)==='Chieftan Ufthak'&&s==='a')v+=2*c.res;
  return Math.max(0,v)}
const stagingThreat=()=>G.staging.reduce((t,c)=>t+(isEnemy(c)||isLoc(c)?stat(c,'thr'):0),0);
const questWill=()=>chars().filter(c=>c.committed).reduce((t,c)=>t+stat(c,'w'),0);

// ---------- ajudantes de escolha ----------
async function pick(title,cands,o={}){if(!cands.length)return[];const min=Math.min(o.min??1,cands.length);return ask({kind:'pick',title,text:o.text||'',cands,min,max:o.max??1,stat:o.stat,card:o.card})}
async function pick1(title,cands,o={}){return(await pick(title,cands,{...o,min:1,max:1}))[0]}
const yesno=(title,text,card)=>ask({kind:'buttons',title,text,card,options:[{label:'Sim',value:true,primary:true},{label:'Não',value:false}]});
const show=(title,card,text)=>ask({kind:'buttons',title,text,card,options:[{label:'Continuar',value:1,primary:true}]});

// ---------- básicos ----------
function draw(n,why=''){
  if(activeName()==='Enchanted Stream'){log('Enchanted Stream está ativa: não podes comprar cartas.');return 0}
  let k=0;for(let i=0;i<n&&G.deck.length;i++){G.hand.push(G.deck.shift());k++}
  if(k)log(`Compras ${k} carta${k>1?'s':''}${why}.`);else if(n)log('O teu baralho está vazio.');
  return k}
function checkLose(){
  if(G.threat>=50)throw new GameOver(false,'A tua ameaça chegou a 50.');
  if(!G.heroes.length)throw new GameOver(false,'Todos os teus heróis foram destruídos.')}
function raiseThreat(n,why){if(n<=0)return;G.threat+=n;log(`Ameaça +${n}${why?' ('+why+')':''} → ${G.threat}.`,'bad');checkLose()}
function lowerThreat(n,why){G.threat=Math.max(0,G.threat-n);log(`Ameaça −${n}${why?' ('+why+')':''} → ${G.threat}.`,'good')}
const spawnInPlay=()=>enemiesInPlay().some(e=>N(e)==="Ungoliant's Spawn");
function checkWin(){
  const q=G.quest;if(!q)return;
  if(q.id===QPATH&&G.flags.spawnDead)throw new GameOver(true,"Encontraste e derrotaste Ungoliant's Spawn. A mensagem chega a Lórien!");
  if(q.id===QBEORN&&G.qprog>=10&&!spawnInPlay())throw new GameOver(true,"Completaste Beorn's Path e saíste de Mirkwood!")}

function hostOf(a){return[...chars(),G.active,...G.staging].find(h=>h&&h.att.includes(a))}
function discardAttachment(a){const h=hostOf(a);if(h)h.att=h.att.filter(x=>x!==a);const enc=a.d.back==='encounter';resetCard(a);(enc?G.ediscard:G.discard).push(a);log(`${N(a)} é descartado.`)}
const myAttachments=(list=chars())=>list.flatMap(c=>c.att.filter(a=>a.d.back!=='encounter'));

async function damage(c,n,why){
  if(n<=0||!isChar(c))return;
  c.dmg+=n;log(`${N(c)} sofre ${n} de dano${why?' ('+why+')':''}.`,'bad');
  if(c.dmg>=stat(c,'hp')){log(`${N(c)} é destruído.`,'bad');await leavePlay(c)}}
async function leavePlay(c,dest='discard'){
  if(!isChar(c))return;
  const tr=traitsOf(c);
  G.heroes=G.heroes.filter(x=>x!==c);G.allies=G.allies.filter(x=>x!==c);
  for(const a of[...c.att])discardAttachment(a);
  resetCard(c);
  if(dest==='deck'){G.deck.push(c);shuffle(G.deck)}else G.discard.push(c);
  checkLose();
  const eo=G.heroes.find(h=>N(h)==='Éomer');
  if(eo&&!G.flags.eomer){G.flags.eomer=true;eo.mods.push({s:'a',v:2,u:'round'});log('Éomer: +2 ataque até ao fim da ronda.','good')}
  for(const h of G.heroes){const horn=h.att.find(a=>N(a)==='Horn of the Mark'&&!a.exh);
    if(horn&&traitsOf(h).some(t=>tr.includes(t))){horn.exh=true;log('Horn of the Mark é esgotado.');draw(1)}}
  if(N(c)==='Éomund'){for(const x of chars())if(hasTrait(x,'Rohan'))x.exh=false;log('Éomund: todas as personagens Rohan preparam.','good')}
  H.render()}
async function damageEnemy(e,n,why){
  if(n<=0||!enemiesInPlay().includes(e))return;
  e.dmg+=n;log(`${N(e)} sofre ${n} de dano${why?' ('+why+')':''}.`);
  if(e.dmg>=stat(e,'hp'))await destroyEnemy(e)}
async function destroyEnemy(e){
  G.staging=G.staging.filter(x=>x!==e);G.engaged=G.engaged.filter(x=>x!==e);
  for(const s of e.shadow)G.ediscard.push(resetCard(s));
  const vp=e.d.vp;resetCard(e);(vp?G.victory:G.ediscard).push(e);
  log(`${N(e)} é derrotado!${vp?' (+'+vp+' pontos de vitória)':''}`,'good');
  if(N(e)==="Ungoliant's Spawn"&&G.quest.id===QPATH)G.flags.spawnDead=true;
  checkWin()}

// ---------- custos ----------
function costOf(c,red=0){let v=c.d.cost||0;
  if(N(c)==='Guthlaf'&&G.heroes.some(h=>hasTrait(h,'Rohan')))v=Math.max(0,v-1);
  if(red&&v>0)v=Math.max(1,v-red);return v}
function payers(c){const sp=c.d.sphere;return G.heroes.filter(h=>sp==='Neutral'||h.d.sphere===sp||(N(c)==='The Muster of Rohan'&&hasTrait(h,'Rohan')))}
const canAfford=(c,red=0)=>payers(c).reduce((t,h)=>t+h.res,0)>=costOf(c,red);
function pay(c,cost){let left=cost;for(const h of payers(c).sort((a,b)=>b.res-a.res)){const t=Math.min(h.res,left);h.res-=t;left-=t}}
const uniqueBlocked=c=>c.d.unique&&chars().some(x=>N(x)===N(c));
function attachTargets(c){const n=N(c),ok=h=>!(RESTRICTED.includes(n)&&h.att.filter(a=>RESTRICTED.includes(N(a))).length>=2);
  if(n==='The Red Arrow')return G.heroes.filter(h=>hasTrait(h,'Gondor')&&ok(h));
  if(n==='War Axe')return chars().filter(h=>h.d.sphere==='Tactics'&&!h.att.some(a=>N(a)==='War Axe')&&ok(h));
  if(n==='Horn of the Mark')return G.heroes.filter(h=>hasTrait(h,'Rohan')&&ok(h));
  if(n==='Firefoot')return G.heroes.filter(h=>(h.d.sphere==='Tactics'||hasTrait(h,'Rohan'))&&ok(h));
  if(n==='Ancient Mathom')return[G.active,...G.staging.filter(isLoc)].filter(Boolean);
  return[]}
const EVT={'Feint':{t:'combat',ok:()=>G.engaged.length>0},'Astonishing Speed':{t:'action'},'Forth Eorlingas!':{t:'combat'},'The Muster of Rohan':{t:'planning'}};
const RESP={'A Test of Will':'Resposta: oferecida quando é revelada uma carta com "When Revealed".','Wait no Longer':'Resposta: oferecida no início do passo de preparação.','Oath of Eorl':'Resposta: oferecida no início da fase de combate.'};
function canPlay(c){
  const w=G.window;if(!w||!G.hand.includes(c))return false;
  const t=c.d.type;
  if(t==='Ally'||t==='Attachment'){if(w!=='planning'||uniqueBlocked(c))return false;if(t==='Attachment'&&!attachTargets(c).length)return false}
  else if(t==='Event'){const e=EVT[N(c)];if(!e)return false;
    if(e.t==='planning'&&w!=='planning')return false;if(e.t==='combat'&&w!=='combat')return false;if(e.ok&&!e.ok())return false}
  return canAfford(c)}
function canResp(n){const c=G.hand.find(x=>N(x)===n);if(!c||!canAfford(c))return false;
  if(n==='Oath of Eorl')return chars().some(x=>x.d.unique&&hasTrait(x,'Rohan'))&&chars().some(x=>x.d.unique&&hasTrait(x,'Gondor'));
  return true}
function playResponse(n){const c=G.hand.find(x=>N(x)===n);G.hand=G.hand.filter(x=>x!==c);pay(c,costOf(c));G.discard.push(c);log(`Jogas ${n}.`,'play')}

async function playCard(c,{red=0}={}){
  const cost=costOf(c,red);
  let tg=null;
  if(c.d.type==='Attachment')tg=await pick1(`Anexar ${N(c)} a…`,attachTargets(c));
  G.hand=G.hand.filter(x=>x!==c);pay(c,cost);
  log(`Jogas ${N(c)} (custo ${cost}).`,'play');
  if(c.d.type==='Ally')await enterPlay(c,true);
  else if(tg){tg.att.push(c);log(`${N(c)} fica anexado a ${N(tg)}.`)}
  else if(c.d.type==='Event'){G.discard.push(c);await EVENTS[N(c)](c)}}

async function enterPlay(c,fromHand=false){
  resetCard(c);G.allies.push(c);log(`${N(c)} entra em jogo.`);const n=N(c);
  if(n==='Gandalf'){const ens=enemiesInPlay();
    const o=await ask({kind:'buttons',title:'Gandalf entra em jogo',text:'Escolhe 1 efeito:',card:c,options:[{label:'Comprar 3 cartas',value:'d',primary:true},...(ens.length?[{label:'4 de dano a 1 inimigo',value:'x'}]:[]),{label:'Reduzir ameaça em 5',value:'t'}]});
    if(o==='d')draw(3);else if(o==='t')lowerThreat(5,'Gandalf');else{const e=await pick1('Gandalf: escolhe o inimigo',ens,{stat:'hpleft'});await damageEnemy(e,4,'Gandalf')}}
  if(n==='Westfold Horse-breeder'){const m=G.deck.slice(0,10).filter(x=>(x.d.traits||[]).includes('Mount'));
    if(m.length){const r=await pick('Westfold Horse-breeder: junta um anexo Mount à mão',m,{min:0,max:1});if(r[0]){G.deck=G.deck.filter(x=>x!==r[0]);G.hand.push(r[0]);log(`${N(r[0])} vai para a tua mão.`)}}
    else log('Westfold Horse-breeder: não há Mount nas 10 do topo.');shuffle(G.deck)}
  if(n==='West Road Traveller'&&fromHand&&G.active&&G.staging.some(isLoc)){
    const r=await pick('West Road Traveller: troca a localização ativa por outra da área de preparação (opcional)',G.staging.filter(isLoc),{min:0,max:1});
    if(r[0]){G.staging=G.staging.filter(x=>x!==r[0]);G.staging.push(G.active);G.active=r[0];log(`${N(r[0])} passa a ser a localização ativa.`)}}
  H.render()}

const EVENTS={
  'Feint':async()=>{const e=await pick1('Feint: escolhe um inimigo enfrentado — não te ataca nesta fase',G.engaged);e.feint=true;log(`${N(e)} não ataca nesta fase.`)},
  'Astonishing Speed':async()=>{G.effects.push({u:'phase',fn:(c,s)=>s==='w'&&isChar(c)&&hasTrait(c,'Rohan')?2:0});log('Personagens Rohan +2 força de vontade nesta fase.','good')},
  'Forth Eorlingas!':async()=>{G.flags.forth=true;log('Heróis Rohan podem atacar inimigos na área de preparação nesta fase.','good')},
  'The Muster of Rohan':async()=>{const al=G.deck.slice(0,10).filter(x=>x.d.type==='Ally'&&(x.d.traits||[]).includes('Rohan'));
    if(al.length){const r=await pick('The Muster of Rohan: escolhe até 4 aliados Rohan para pôr em jogo',al,{min:0,max:4});
      for(const c of r){if(uniqueBlocked(c))continue;G.deck=G.deck.filter(x=>x!==c);await enterPlay(c);c.muster=true}}
    else log('Não há aliados Rohan nas 10 do topo.');shuffle(G.deck)}};

const ABIL={
  'Westfold Horse-Breaker':{label:'Descartar: preparar um herói',ok:()=>G.heroes.some(h=>h.exh),
    run:async c=>{const h=await pick1('Escolhe um herói para preparar',G.heroes.filter(h=>h.exh));await leavePlay(c);h.exh=false;log(`${N(h)} prepara.`,'good')}},
  'Westfold Outrider':{label:'Descartar: enfrentar um inimigo',ok:()=>G.staging.some(isEnemy),
    run:async c=>{const e=await pick1('Escolhe o inimigo a enfrentar',G.staging.filter(isEnemy));await leavePlay(c);await engage(e)}}};
const canUse=c=>!!(G.window&&G.allies.includes(c)&&ABIL[N(c)]&&ABIL[N(c)].ok(c));

async function actionWindow(label,kind){
  for(;;){G.window=kind;
    const r=await ask({kind:'window',title:label});
    G.window=null;
    if(!r||r==='pass')break;
    if(r.type==='play'&&canPlayIn(r.c,kind))await playCard(r.c);
    else if(r.type==='abil')await ABIL[N(r.c)].run(r.c)}
  G.window=null}
function canPlayIn(c,k){const w=G.window;G.window=k;const ok=canPlay(c);G.window=w;return ok}

// ---------- encontro ----------
async function engage(e){
  G.staging=G.staging.filter(x=>x!==e);if(!G.engaged.includes(e))G.engaged.push(e);
  log(`${N(e)} está agora enfrentado contigo.`,'enc');
  if(N(e)==='Forest Spider'){e.mods.push({s:'a',v:1,u:'round'});log('Forest Spider: +1 ataque até ao fim da ronda.')}
  if(N(e)==='Hummerhorns'&&G.heroes.length){const h=await pick1('Hummerhorns: escolhe um herói para sofrer 5 de dano',G.heroes);await damage(h,5,'Hummerhorns')}}

const WR={
  'King Spider':async()=>{const r=chars().filter(c=>!c.exh);if(r.length){const c=await pick1('King Spider: escolhe e esgota 1 personagem',r);c.exh=true;log(`${N(c)} é esgotado.`)}},
  "Ungoliant's Spawn":async()=>{const cs=chars().filter(c=>c.committed);for(const c of cs)c.mods.push({s:'w',v:-1,u:'phase'});if(cs.length)log('Personagens em missão: −1 força de vontade nesta fase.','bad')},
  'Dol Guldur Orcs':async()=>{const r=chars().filter(c=>c.committed);if(r.length){const c=await pick1('Dol Guldur Orcs: escolhe uma personagem em missão para sofrer 2 de dano',r);await damage(c,2,'Dol Guldur Orcs')}},
  'Black Forest Bats':async()=>{const r=chars().filter(c=>c.committed);if(r.length){const c=await pick1('Black Forest Bats: retira 1 personagem da missão',r);c.committed=false;log(`${N(c)} sai da missão (não prepara).`)}},
  'Eyes of the Forest':async()=>{const ev=G.hand.filter(c=>c.d.type==='Event');G.hand=G.hand.filter(c=>c.d.type!=='Event');G.discard.push(...ev);log(`Descartas ${ev.length} evento(s) da mão.`,'bad')},
  'Caught in a Web':async c=>{const h=await pick1('Caught in a Web: escolhe o herói que recebe esta condição',G.heroes);h.att.push(c);c.host=h;log(`Caught in a Web fica anexado a ${N(h)}.`,'bad')},
  'Driven by Shadow':async()=>{const s=G.staging.filter(x=>isEnemy(x)||isLoc(x));if(!s.length)return'surge';
    G.effects.push({u:'phase',fn:(c,st)=>st==='thr'&&s.includes(c)&&G.staging.includes(c)?1:0});log('Cada inimigo e localização na preparação: +1 ameaça nesta fase.','bad')},
  "The Necromancer's Reach":async()=>{for(const c of chars().filter(c=>c.exh))await damage(c,1,"Necromancer's Reach")}};

async function reveal(){
  if(!G.edeck.length){if(!G.ediscard.length){log('O baralho de encontro está vazio.');return}
    G.edeck=shuffle(G.ediscard.map(resetCard));G.ediscard=[];log('O descarte de encontro é baralhado e forma um novo baralho.')}
  const c=G.edeck.shift();log(`Revelada: ${N(c)}.`,'enc');
  await show('Carta de encontro revelada',c);
  const wr=WR[N(c)];let cancel=false;
  if(wr&&canResp('A Test of Will')){cancel=await yesno('Jogar A Test of Will?',`Cancela o efeito "When Revealed" de ${N(c)} (custa 1 recurso Spirit).`,c);if(cancel){playResponse('A Test of Will');log('Efeito cancelado.','good')}}
  if(isEnemy(c)||isLoc(c))G.staging.push(c);
  let surge=false;
  if(wr&&!cancel)surge=(await wr(c))==='surge';
  if(c.d.type==='Treachery'&&!c.host)G.ediscard.push(c);
  H.render();
  if(surge){log('Surge: revela outra carta.','enc');await reveal()}}

const SHADOW={
  'King Spider':async(e,d,u)=>{for(let i=0;i<(u?2:1);i++){const r=chars().filter(c=>!c.exh);if(!r.length)break;const c=await pick1('Sombra: escolhe e esgota 1 personagem',r);c.exh=true}},
  'Hummerhorns':async(e,d,u)=>{for(const c of chars())await damage(c,u?2:1,'sombra')},
  "Ungoliant's Spawn":async(e,d,u)=>raiseThreat(u?8:4,'sombra'),
  'Dol Guldur Orcs':async(e,d,u)=>{e.mods.push({s:'a',v:u?3:1,u:'attack'});log(`${N(e)} +${u?3:1} ataque.`,'bad')},
  'Forest Spider':async()=>{const at=myAttachments();if(at.length){const a=await pick1('Sombra: descarta 1 anexo que controlas',at);discardAttachment(a)}},
  'East Bight Patrol':async(e,d,u)=>{e.mods.push({s:'a',v:1,u:'attack'});log(`${N(e)} +1 ataque.`,'bad');if(u)raiseThreat(3,'sombra')},
  'Driven by Shadow':async(e,d,u)=>{if(u){for(const a of myAttachments())discardAttachment(a)}
    else if(d&&myAttachments([d]).length){const a=await pick1('Sombra: descarta 1 anexo do defensor',myAttachments([d]));discardAttachment(a)}}};

function dealShadow(e){if(!G.edeck.length)return;const s=G.edeck.shift();e.shadow.push(s)}

// ---------- missão ----------
async function placeProgress(n){
  if(G.active&&n>0){const L=G.active,t=Math.min(n,L.d.qp-L.prog);L.prog+=t;n-=t;log(`${t} progresso em ${N(L)}.`);if(L.prog>=L.d.qp)await explore()}
  if(n>0){G.qprog+=n;log(`${n} progresso na missão (${G.qprog}/${G.quest.d.qp}).`,'good')}
  await checkQuest()}
async function checkQuest(){
  const q=G.quest;
  if(q.id===Q1&&G.qprog>=8)await advance(Q2);
  else if(q.id===Q2&&G.qprog>=2){log('A Fork in the Road: avanças para um dos "A Chosen Path", ao acaso.');await advance(Math.random()<.5?QPATH:QBEORN)}
  else checkWin()}
async function advance(id){
  G.qprog=0;G.quest=mk(id,0);H.render();await show('Nova etapa da missão',G.quest);
  G.quest=mk(id,1);log(`Etapa ${G.quest.d.cost}: ${N(G.quest)}.`,'phase');await show('Etapa virada',G.quest);
  if(id===QPATH){const pool=[...G.edeck,...G.ediscard].filter(c=>(c.d.traits||[]).includes('Spider'));
    if(pool.length){const c=await pick1("Don't Leave the Path!: escolhe 1 carta Spider para a área de preparação",pool);
      G.edeck=G.edeck.filter(x=>x!==c);G.ediscard=G.ediscard.filter(x=>x!==c);resetCard(c);G.staging.push(c);shuffle(G.edeck);log(`${N(c)} é adicionado à área de preparação.`,'enc')}}
  checkWin()}
async function explore(){
  const L=G.active;G.active=null;log(`${N(L)} foi explorada.`,'good');
  const math=L.att.some(a=>N(a)==='Ancient Mathom');for(const a of[...L.att]){L.att=L.att.filter(x=>x!==a);G.discard.push(resetCard(a))}
  resetCard(L);G.ediscard.push(L);
  if(math){log('Ancient Mathom:');draw(3)}
  if(N(L)==='Mountains of Mirkwood'&&G.deck.length){const top=G.deck.slice(0,5);
    const r=await pick('Mountains of Mirkwood: junta à mão 1 das 5 cartas do topo (opcional)',top,{min:0,max:1});
    if(r[0]){G.deck=G.deck.filter(x=>x!==r[0]);G.hand.push(r[0]);log(`${N(r[0])} vai para a tua mão.`)}shuffle(G.deck)}}

async function questSuccess(com){
  const hg=com.find(c=>N(c)==='Hirgon'&&isHero(c));
  if(hg){const al=G.hand.filter(c=>c.d.type==='Ally'&&c.d.sphere==='Tactics'&&!uniqueBlocked(c)&&canAfford(c,1));
    if(al.length){const r=await pick('Hirgon: joga um aliado Tactics da mão com custo −1 (mín. 1)',al,{min:0,max:1});
      if(r[0]){const a=r[0];await playCard(a,{red:1});
        if(G.allies.includes(a)&&await yesno('Hirgon',`Aumentar a ameaça em 1 para dar +1 ataque e +1 defesa a ${N(a)} até ao fim da ronda?`,a)){raiseThreat(1,'Hirgon');a.mods.push({s:'a',v:1,u:'round'},{s:'d',v:1,u:'round'})}}}}
  for(const l of com.filter(c=>N(c)==='Westfold Lancer'&&G.allies.includes(c))){const t=G.staging.filter(e=>isEnemy(e)&&!e.d.unique);if(!t.length)break;
    const r=await pick('Westfold Lancer: descarta-o para dar 2 de dano a um inimigo não-único na preparação (opcional)',t,{min:0,max:1,stat:'hpleft'});
    if(r[0]){await leavePlay(l);await damageEnemy(r[0],2,'Westfold Lancer')}}
  for(const h of com.filter(isHero)){const ra=h.att.find(a=>N(a)==='The Red Arrow');
    if(ra&&G.threat>=40&&await yesno('The Red Arrow (Valour)','Põe The Red Arrow na vitória para procurar um aliado nas 5 cartas do topo e pô-lo em jogo?',ra)){
      h.att=h.att.filter(a=>a!==ra);G.victory.push(resetCard(ra));
      const al=G.deck.slice(0,5).filter(c=>c.d.type==='Ally'&&!uniqueBlocked(c));
      if(al.length){const c=await pick1('The Red Arrow: escolhe o aliado',al);G.deck=G.deck.filter(x=>x!==c);await enterPlay(c)}shuffle(G.deck)}}}

// ---------- fases ----------
function endPhase(){
  const all=[...chars(),...G.staging,...G.engaged,G.active].filter(Boolean);
  for(const c of all){c.mods=c.mods.filter(m=>m.u!=='phase'&&m.u!=='attack');c.feint=false}
  G.effects=G.effects.filter(e=>e.u!=='phase');G.flags.forth=false}
function phase(name){endPhase();G.phase=name;log(`Ronda ${G.round} · ${name}`,'phase')}

async function resourcePhase(){phase('Recursos');for(const h of G.heroes)h.res++;log('Cada herói recebe 1 recurso.');draw(1)}
async function planningPhase(){phase('Planeamento');H.openHand&&H.openHand();await actionWindow('Planeamento: joga aliados, anexos e eventos','planning')}
async function questPhase(){
  phase('Missão');
  const ready=chars().filter(c=>!c.exh);
  const com=await pick(`Missão: escolhe as personagens a comprometer (ameaça na preparação: ${stagingThreat()})`,ready,{min:0,max:ready.length,stat:'w'});
  for(const c of com){c.committed=true;c.exh=true}
  log(com.length?`Comprometes ${com.map(N).join(', ')}.`:'Não comprometes ninguém.');
  const lo=com.find(c=>N(c)==='Lothíriel');
  if(lo){const lt=traitsOf(lo);const al=G.hand.filter(c=>c.d.type==='Ally'&&(c.d.traits||[]).some(t=>lt.includes(t))&&!uniqueBlocked(c));
    if(al.length){const r=await pick('Lothíriel: põe em jogo um aliado da mão que partilhe um traço com ela (esgotado e em missão)',al,{min:0,max:1});
      if(r[0]){G.hand=G.hand.filter(x=>x!==r[0]);await enterPlay(r[0]);r[0].exh=true;r[0].committed=true;G.flags.lothAlly=r[0]}}}
  await actionWindow('Missão: ações antes da preparação','quest');
  G.phase='Missão · Preparação';
  let n=1;
  if(canResp('Wait no Longer')&&await yesno('Wait no Longer','Procurar um inimigo nas 5 cartas do topo do baralho de encontro, enfrentá-lo e revelar menos 1 carta?')){
    playResponse('Wait no Longer');const t=G.edeck.slice(0,5).filter(isEnemy);
    if(t.length){const e=await pick1('Wait no Longer: escolhe o inimigo',t);G.edeck=G.edeck.filter(x=>x!==e);await engage(e)}
    shuffle(G.edeck);n=0}
  for(let i=0;i<n;i++)await reveal();
  await actionWindow(`Missão: força de vontade ${questWill()} contra ameaça ${stagingThreat()}. Ações antes de resolver`,'quest');
  const W=questWill(),T=stagingThreat(),com2=chars().filter(c=>c.committed);
  log(`Resolução: força de vontade ${W} contra ameaça ${T}.`,'phase');
  if(W>T){await placeProgress(W-T);await questSuccess(com2)}
  else if(T>W)raiseThreat(T-W,'missão falhada');
  else log('Empate: nada acontece.');
  for(const c of G.allies.filter(c=>c.committed&&N(c)==='Escort from Edoras')){log('Escort from Edoras é descartado.');await leavePlay(c)}
  for(const c of chars())c.committed=false;
  const la=G.flags.lothAlly;G.flags.lothAlly=null;
  if(la&&G.allies.includes(la)){log(`${N(la)} é baralhado de volta no teu baralho (Lothíriel).`);await leavePlay(la,'deck')}}
const canTravel=L=>N(L)==='Great Forest Web'?G.heroes.some(h=>!h.exh):N(L)==="Necromancer's Pass"?G.hand.length>=2:true;
async function travelPhase(){
  phase('Viagem');
  if(G.active){log(`${N(G.active)} continua ativa: não há viagem.`);return}
  const locs=G.staging.filter(isLoc).filter(canTravel);if(!locs.length)return;
  const L=(await pick('Viagem: escolhe uma localização para viajar (opcional)',locs,{min:0,max:1,stat:'qp'}))[0];if(!L)return;
  const n=N(L);
  if(n==='Great Forest Web'){const h=await pick1('Great Forest Web: esgota 1 herói para viajar',G.heroes.filter(h=>!h.exh));h.exh=true}
  if(n==="Necromancer's Pass")for(let i=0;i<2;i++){const c=G.hand.splice(Math.random()*G.hand.length|0,1)[0];G.discard.push(c);log(`Descartas ${N(c)} ao acaso.`,'bad')}
  if(n==='Mountains of Mirkwood'){log('Mountains of Mirkwood: revela a carta do topo do encontro.');await reveal()}
  G.staging=G.staging.filter(x=>x!==L);G.active=L;log(`Viajas para ${n}.`);
  if(n==='Old Forest Road'){const ex=chars().filter(c=>c.exh);if(ex.length){const r=await pick('Old Forest Road: prepara 1 personagem (opcional)',ex,{min:0,max:1});if(r[0]){r[0].exh=false;log(`${N(r[0])} prepara.`,'good')}}}
  if(n==='Forest Gate'&&await yesno('Forest Gate','Comprar 2 cartas?',L))draw(2)}
async function encounterPhase(){
  phase('Encontro');
  const en=G.staging.filter(isEnemy);
  if(en.length){const r=await pick(`Enfrentamento opcional (a tua ameaça: ${G.threat})`,en,{min:0,max:1,stat:'eng'});if(r[0])await engage(r[0])}
  for(;;){const c=sortEng(G.staging.filter(e=>isEnemy(e)&&e.d.eng<=G.threat));if(!c.length)break;
    log(`Verificação: ${N(c[0])} (custo ${c[0].d.eng}) ≤ ameaça ${G.threat}.`);await engage(c[0])}}
async function enemyAttack(e){
  if(N(e)==='Dol Guldur Beastmaster'){dealShadow(e);log('Dol Guldur Beastmaster recebe outra carta de sombra.')}
  const cands=chars().filter(c=>!c.exh);
  const r=await pick(`${N(e)} ataca com ${stat(e,'a')}. Escolhe um defensor (ou nenhum)`,cands,{min:0,max:1,stat:'d',card:e});
  const d=r[0]||null,u=!d;
  if(d){d.exh=true;log(`${N(d)} defende contra ${N(e)}.`)}else log(`${N(e)}: ataque sem defesa!`,'bad');
  for(const s of e.shadow){if(s.up)continue;s.up=true;H.render();await show('Carta de sombra',s,s.d.shadow||'Sem efeito de sombra.');const f=SHADOW[N(s)];if(f&&s.d.shadow)await f(e,d,u)}
  if(G.engaged.includes(e)){const atk=stat(e,'a');
    if(d){if(isChar(d)){const dm=atk-stat(d,'d');if(dm>0)await damage(d,dm,N(e));else log(`${N(d)} absorve o ataque.`)}}
    else if(G.heroes.length){const h=await pick1(`Ataque sem defesa: ${atk} de dano a um herói`,G.heroes,{stat:'hpleft'});await damage(h,atk,`${N(e)}, sem defesa`)}
    if(N(e)==='Chieftan Ufthak'){e.res++;log('Chieftain Ufthak recebe 1 recurso (+2 ataque cada).','bad')}}
  for(const c of[...chars(),e])c.mods=c.mods.filter(m=>m.u!=='attack');
  checkLose()}
async function playerAttacks(){
  for(;;){
    const ready=chars().filter(c=>!c.exh);if(!ready.length)break;
    const rohanHeroes=ready.filter(c=>isHero(c)&&hasTrait(c,'Rohan'));
    const targets=[...G.engaged,...(G.flags.forth&&rohanHeroes.length?G.staging.filter(isEnemy):[])];
    if(!targets.length)break;
    const e=(await pick('Os teus ataques: escolhe um inimigo para atacar (ou termina)',targets,{min:0,max:1,stat:'hpleft'}))[0];if(!e)break;
    const pool=G.staging.includes(e)?rohanHeroes:ready;
    const A=await pick(`Atacantes contra ${N(e)} (defesa ${stat(e,'d')}, vida ${stat(e,'hp')-e.dmg})`,pool,{min:0,max:pool.length,stat:'a',card:e});
    if(!A.length)continue;
    for(const c of A)c.exh=true;
    for(const k of A.filter(c=>N(c)==='Riddermark Knight'))if(await yesno('Riddermark Knight','+2 ataque neste ataque? (é descartado no fim do ataque)',k)){k.mods.push({s:'a',v:2,u:'attack'});k.rk=true}
    const atk=A.reduce((t,c)=>t+stat(c,'a'),0),dm=Math.max(0,atk-stat(e,'d')),left=stat(e,'hp')-e.dmg;
    log(`Ataque ${atk} contra defesa ${stat(e,'d')}: ${dm} de dano.`);
    let ex=0,ffT=null;
    if(A.length===1&&dm>left){const ff=A[0].att.find(a=>N(a)==='Firefoot'&&!a.exh);const o=G.engaged.filter(x=>x!==e&&!x.d.unique);
      if(ff&&o.length&&await yesno('Firefoot',`Esgotar Firefoot para passar ${dm-left} de dano em excesso a outro inimigo não-único?`,ff)){ff.exh=true;ex=dm-left;ffT=await pick1('Firefoot: escolhe o inimigo',o,{stat:'hpleft'})}}
    await damageEnemy(e,dm-ex,'ataque');if(ffT)await damageEnemy(ffT,ex,'Firefoot');
    for(const k of A.filter(c=>c.rk&&G.allies.includes(c))){log('Riddermark Knight é descartado.');await leavePlay(k)}
    for(const c of chars())c.mods=c.mods.filter(m=>m.u!=='attack')}}
async function combatPhase(){
  phase('Combate');
  if(!G.engaged.length){
    const fe=G.hand.find(c=>N(c)==='Forth Eorlingas!');
    if(!(fe&&G.staging.some(isEnemy)&&canPlayIn(fe,'combat')))return;
    await actionWindow('Combate: sem inimigos enfrentados (podes jogar Forth Eorlingas!)','combat');
    if(!G.engaged.length&&!G.flags.forth)return}
  let oath=false;
  if(G.engaged.length&&canResp('Oath of Eorl')&&await yesno('Oath of Eorl','Atacar primeiro, antes dos ataques inimigos nesta fase?')){playResponse('Oath of Eorl');oath=true}
  for(const e of sortEng(G.engaged))dealShadow(e);
  H.render();
  await actionWindow('Combate: ações antes dos ataques inimigos','combat');
  const enemyPhase=async()=>{for(const e of sortEng(G.engaged)){if(!G.engaged.includes(e))continue;if(e.feint){log(`${N(e)} não ataca (Feint).`);continue}await enemyAttack(e)}};
  if(oath){await playerAttacks();await enemyPhase()}
  else{await enemyPhase();if(G.engaged.length||G.flags.forth)await actionWindow('Combate: ações antes dos teus ataques','combat');await playerAttacks()}
  for(const e of G.engaged){G.ediscard.push(...e.shadow.map(resetCard));e.shadow=[]}}
async function refreshPhase(){
  phase('Restauro');
  for(const c of chars()){const web=c.att.find(a=>N(a)==='Caught in a Web');
    if(web&&c.exh){if(c.res>=2&&await yesno('Caught in a Web',`Pagar 2 recursos de ${N(c)} para o preparar?`,web)){c.res-=2;c.exh=false}else log(`${N(c)} não prepara (Caught in a Web).`,'bad')}
    else c.exh=false;
    for(const a of c.att)a.exh=false}
  raiseThreat(1,'fase de restauro');
  for(const c of G.allies.filter(c=>N(c)==='Gandalf')){log('Gandalf é descartado no fim da ronda.');await leavePlay(c)}
  for(const c of G.allies.filter(c=>c.muster)){log(`${N(c)} é descartado (The Muster of Rohan).`);await leavePlay(c)}
  for(const c of[...chars(),...G.staging,...G.engaged,G.active].filter(Boolean))c.mods=c.mods.filter(m=>m.u!=='round');
  G.effects=G.effects.filter(e=>e.u!=='round');G.flags.eomer=false}

// ---------- jogo ----------
function newGame(deck){
  UID=1;
  G={threat:0,heroes:[],allies:[],hand:[],deck:[],discard:[],edeck:[],ediscard:[],staging:[],active:null,engaged:[],victory:[],
     quest:null,qprog:0,round:0,phase:'Preparação do jogo',effects:[],flags:{},log:[],window:null,over:null,deckName:deck.name};
  G.heroes=deck.heroes.map(id=>mk(id));G.threat=G.heroes.reduce((t,h)=>t+(h.d.cost||0),0);
  for(const[id,q]of deck.cards)for(let i=0;i<q;i++)G.deck.push(mk(id));shuffle(G.deck);
  for(const[id,q,g]of PTM){if(g==='QuestDeck')continue;for(let i=0;i<q;i++)(g==='StagingArea'?G.staging:G.edeck).push(mk(id))}
  shuffle(G.edeck);G.quest=mk(Q1,0);return G}
async function runGame(){
  try{
    log(`Ameaça inicial ${G.threat}.`,'phase');H.render();
    await show('Passage Through Mirkwood',G.quest,'Preparação: Forest Spider e Old Forest Road são adicionados à área de preparação e o baralho de encontro é baralhado.');
    G.quest=mk(Q1,1);log('Etapa 1: Flies and Spiders.','phase');
    G.hand=G.deck.splice(0,6);H.render();
    const m=await ask({kind:'buttons',title:'Mão inicial',text:'Podes fazer mulligan uma vez: baralhar a mão de volta e comprar 6 novas cartas.',cards:G.hand,options:[{label:'Manter',value:'k',primary:true},{label:'Mulligan',value:'m'}]});
    if(m==='m'){G.deck.push(...G.hand);G.hand=[];shuffle(G.deck);G.hand=G.deck.splice(0,6);log('Fazes mulligan.')}
    for(;;){G.round++;await resourcePhase();await planningPhase();await questPhase();await travelPhase();await encounterPhase();await combatPhase();await refreshPhase()}
  }catch(e){
    if(e instanceof GameOver){G.over={win:e.win,msg:e.message};G.window=null;log(e.win?'Vitória! '+e.message:'Derrota. '+e.message,e.win?'good':'bad');H.render();H.onEnd()}
    else{console.error(e);G.error=String(e&&e.stack||e);H.render()}}}
