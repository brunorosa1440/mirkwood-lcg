// ===== Rules engine: Passage Through Mirkwood + Riders of Rohan (solo) =====
const IMGBASE='https://dragncards-lotrlcg.s3.amazonaws.com/cards/English/';
const BACKS={player:'https://dragncards-lotrlcg.s3.amazonaws.com/cardbacks/player.jpg',encounter:'https://dragncards-lotrlcg.s3.amazonaws.com/cardbacks/encounter.jpg'};
const P='51223bd0-ffd1-11df-a976-0801200c9';
const Q1=P+'119',Q2=P+'121',QPATH=P+'123',QBEORN=P+'125';
let G=null,UID=1;
const H={ask:null,render(){},onEnd(){},save(){}};
class GameOver extends Error{constructor(win,msg){super(msg);this.win=win}}
const def=(id,s=0)=>{const c=CARDS[id];return Array.isArray(c)?c[s]:c};
const mk=(id,side=0)=>({uid:UID++,id,side,d:def(id,side),exh:false,dmg:0,res:0,prog:0,att:[],mods:[],committed:false,shadow:[]});
function resetCard(c){Object.assign(c,{exh:false,dmg:0,res:0,prog:0,att:[],mods:[],committed:false,shadow:[],feint:false,muster:false,rk:false,host:null,up:false});return c}
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
const pl=(n,w)=>`${n} ${w}${n===1?'':'s'}`;

// Cards with implemented rules (everything else stays locked)
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

// ---------- choice helpers ----------
async function pick(title,cands,o={}){if(!cands.length)return[];const min=Math.min(o.min??1,cands.length);return ask({kind:'pick',title,text:o.text||'',cands,min,max:o.max??1,stat:o.stat,card:o.card,inline:o.inline})}
async function pick1(title,cands,o={}){return(await pick(title,cands,{...o,min:1,max:1}))[0]}
const yesno=(title,text,card)=>ask({kind:'buttons',title,text,card,options:[{label:'Yes',value:true,primary:true},{label:'No',value:false}]});
const show=(title,card,text)=>ask({kind:'buttons',title,text,card,options:[{label:'Continue',value:1,primary:true}]});

// ---------- basics ----------
function draw(n,why=''){
  if(activeName()==='Enchanted Stream'){log('Enchanted Stream is active: you cannot draw cards.');return 0}
  let k=0;for(let i=0;i<n&&G.deck.length;i++){G.hand.push(G.deck.shift());k++}
  if(k)log(`You draw ${pl(k,'card')}${why}.`);else if(n)log('Your deck is empty.');
  return k}
function checkLose(){
  if(G.threat>=50)throw new GameOver(false,'Your threat reached 50.');
  if(!G.heroes.length)throw new GameOver(false,'All your heroes were destroyed.')}
function raiseThreat(n,why){if(n<=0)return;G.threat+=n;log(`Threat +${n}${why?' ('+why+')':''} → ${G.threat}.`,'bad');checkLose()}
function lowerThreat(n,why){G.threat=Math.max(0,G.threat-n);log(`Threat −${n}${why?' ('+why+')':''} → ${G.threat}.`,'good')}
const spawnInPlay=()=>enemiesInPlay().some(e=>N(e)==="Ungoliant's Spawn");
function checkWin(){
  const q=G.quest;if(!q)return;
  if(q.id===QPATH&&G.flags.spawnDead)throw new GameOver(true,"You found and defeated Ungoliant's Spawn. The message reaches Lórien!");
  if(q.id===QBEORN&&G.qprog>=10&&!spawnInPlay())throw new GameOver(true,"You completed Beorn's Path and made it out of Mirkwood!")}

function hostOf(a){return[...chars(),G.active,...G.staging].find(h=>h&&h.att.includes(a))}
function discardAttachment(a){const h=hostOf(a);if(h)h.att=h.att.filter(x=>x!==a);const enc=a.d.back==='encounter';resetCard(a);(enc?G.ediscard:G.discard).push(a);log(`${N(a)} is discarded.`)}
const myAttachments=(list=chars())=>list.flatMap(c=>c.att.filter(a=>a.d.back!=='encounter'));

async function damage(c,n,why){
  if(n<=0||!isChar(c))return;
  c.dmg+=n;log(`${N(c)} takes ${n} damage${why?' ('+why+')':''}.`,'bad');
  if(c.dmg>=stat(c,'hp')){log(`${N(c)} is destroyed.`,'bad');await leavePlay(c)}}
async function leavePlay(c,dest='discard'){
  if(!isChar(c))return;
  const tr=traitsOf(c);
  G.heroes=G.heroes.filter(x=>x!==c);G.allies=G.allies.filter(x=>x!==c);
  for(const a of[...c.att])discardAttachment(a);
  resetCard(c);
  if(dest==='deck'){G.deck.push(c);shuffle(G.deck)}else G.discard.push(c);
  checkLose();
  const eo=G.heroes.find(h=>N(h)==='Éomer');
  if(eo&&!G.flags.eomer){G.flags.eomer=true;eo.mods.push({s:'a',v:2,u:'round'});log('Éomer gets +2 attack until the end of the round.','good')}
  for(const h of G.heroes){const horn=h.att.find(a=>N(a)==='Horn of the Mark'&&!a.exh);
    if(horn&&traitsOf(h).some(t=>tr.includes(t))){horn.exh=true;log('Horn of the Mark is exhausted.');draw(1)}}
  if(N(c)==='Éomund'){for(const x of chars())if(hasTrait(x,'Rohan'))x.exh=false;log('Éomund: all Rohan characters ready.','good')}
  H.render()}
async function damageEnemy(e,n,why){
  if(n<=0||!enemiesInPlay().includes(e))return;
  e.dmg+=n;log(`${N(e)} takes ${n} damage${why?' ('+why+')':''}.`);
  if(e.dmg>=stat(e,'hp'))await destroyEnemy(e)}
async function destroyEnemy(e){
  G.staging=G.staging.filter(x=>x!==e);G.engaged=G.engaged.filter(x=>x!==e);
  for(const s of e.shadow)G.ediscard.push(resetCard(s));
  const vp=e.d.vp;resetCard(e);(vp?G.victory:G.ediscard).push(e);
  log(`${N(e)} is defeated!${vp?' (+'+vp+' victory points)':''}`,'good');
  if(N(e)==="Ungoliant's Spawn"&&G.quest.id===QPATH)G.flags.spawnDead=true;
  checkWin()}

// ---------- costs ----------
function costOf(c,red=0){let v=c.d.cost||0;
  if(N(c)==='Guthlaf'&&G.heroes.some(h=>hasTrait(h,'Rohan')))v=Math.max(0,v-1);
  if(red&&v>0)v=Math.max(1,v-red);return v}
function payers(c){const sp=c.d.sphere;return G.heroes.filter(h=>sp==='Neutral'||h.d.sphere===sp||(N(c)==='The Muster of Rohan'&&hasTrait(h,'Rohan')))}
const canAfford=(c,red=0)=>payers(c).reduce((t,h)=>t+h.res,0)>=costOf(c,red);
// default split: take from the heroes with the most resources first
function defaultAlloc(c,cost){const a=[];let left=cost;for(const h of payers(c).sort((x,y)=>y.res-x.res)){const t=Math.min(h.res,left);if(t)a.push([h.uid,t]);left-=t}return a}
function validAlloc(c,cost,alloc){if(!Array.isArray(alloc))return false;const ps=payers(c);let sum=0;
  for(const[u,n]of alloc){const h=ps.find(x=>x.uid===u);if(!h||n<0||n>h.res)return false;sum+=n}return sum===cost}
function applyAlloc(alloc){const parts=[];for(const[u,n]of alloc){if(!n)continue;const h=G.heroes.find(x=>x.uid===u);h.res-=n;parts.push(`${N(h)} ${n}`)}return parts.join(', ')}
// asks the player which heroes pay; returns the split, or null if they cancel
async function askPay(c,cost,title,text){
  if(cost<=0)return[];
  const a=await ask({kind:'pay',title,text,card:c,cost});
  return a&&validAlloc(c,cost,a)?a:null}
const uniqueBlocked=c=>c.d.unique&&chars().some(x=>N(x)===N(c));
function attachTargets(c){const n=N(c),ok=h=>!(RESTRICTED.includes(n)&&h.att.filter(a=>RESTRICTED.includes(N(a))).length>=2);
  if(n==='The Red Arrow')return G.heroes.filter(h=>hasTrait(h,'Gondor')&&ok(h));
  if(n==='War Axe')return chars().filter(h=>h.d.sphere==='Tactics'&&!h.att.some(a=>N(a)==='War Axe')&&ok(h));
  if(n==='Horn of the Mark')return G.heroes.filter(h=>hasTrait(h,'Rohan')&&ok(h));
  if(n==='Firefoot')return G.heroes.filter(h=>(h.d.sphere==='Tactics'||hasTrait(h,'Rohan'))&&ok(h));
  if(n==='Ancient Mathom')return[G.active,...G.staging.filter(isLoc)].filter(Boolean);
  return[]}
const EVT={'Feint':{t:'combat',ok:()=>G.engaged.length>0},'Astonishing Speed':{t:'action'},'Forth Eorlingas!':{t:'combat'},'The Muster of Rohan':{t:'planning'}};
const RESP={'A Test of Will':'Response: offered when a card with a "When Revealed" effect is revealed.','Wait no Longer':'Response: offered at the start of the staging step.','Oath of Eorl':'Response: offered at the start of the combat phase.'};
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
// offers a response card; the payment window doubles as the yes/no question
async function offerResponse(n,text){
  const c=G.hand.find(x=>N(x)===n);
  const a=await askPay(c,costOf(c),`Play ${n}?`,text);
  if(!a)return false;
  const paid=applyAlloc(a);G.hand=G.hand.filter(x=>x!==c);G.discard.push(c);
  log(`You play ${n}${paid?' (paid by '+paid+')':''}.`,'play');return true}

async function playCard(c,{red=0,alloc=null}={}){
  const cost=costOf(c,red);
  if(!validAlloc(c,cost,alloc)){alloc=await askPay(c,cost,`Play ${N(c)}?`);if(!alloc)return false}
  let tg=null;
  if(c.d.type==='Attachment')tg=await pick1(`Attach ${N(c)} to…`,attachTargets(c));
  G.hand=G.hand.filter(x=>x!==c);const paid=applyAlloc(alloc);
  log(`You play ${N(c)} (cost ${cost}${paid?': '+paid:''}).`,'play');
  if(c.d.type==='Ally')await enterPlay(c,true);
  else if(tg){tg.att.push(c);log(`${N(c)} is attached to ${N(tg)}.`)}
  else if(c.d.type==='Event'){G.discard.push(c);await EVENTS[N(c)](c)}
  return true}

async function enterPlay(c,fromHand=false){
  resetCard(c);G.allies.push(c);log(`${N(c)} enters play.`);const n=N(c);
  if(n==='Gandalf'){const ens=enemiesInPlay();
    const o=await ask({kind:'buttons',title:'Gandalf enters play',text:'Choose 1:',card:c,options:[{label:'Draw 3 cards',value:'d',primary:true},...(ens.length?[{label:'Deal 4 damage to 1 enemy',value:'x'}]:[]),{label:'Reduce your threat by 5',value:'t'}]});
    if(o==='d')draw(3);else if(o==='t')lowerThreat(5,'Gandalf');else{const e=await pick1('Gandalf: choose an enemy',ens,{stat:'hpleft'});await damageEnemy(e,4,'Gandalf')}}
  if(n==='Westfold Horse-breeder'){const m=G.deck.slice(0,10).filter(x=>(x.d.traits||[]).includes('Mount'));
    if(m.length){const r=await pick('Westfold Horse-breeder: add a Mount attachment to your hand',m,{min:0,max:1});if(r[0]){G.deck=G.deck.filter(x=>x!==r[0]);G.hand.push(r[0]);log(`${N(r[0])} goes to your hand.`)}}
    else log('Westfold Horse-breeder: no Mount in the top 10 cards.');shuffle(G.deck)}
  if(n==='West Road Traveller'&&fromHand&&G.active&&G.staging.some(isLoc)){
    const r=await pick('West Road Traveller: switch the active location with a location in the staging area (optional)',G.staging.filter(isLoc),{min:0,max:1});
    if(r[0]){G.staging=G.staging.filter(x=>x!==r[0]);G.staging.push(G.active);G.active=r[0];log(`${N(r[0])} is now the active location.`)}}
  H.render()}

const EVENTS={
  'Feint':async()=>{const e=await pick1('Feint: choose an engaged enemy — it cannot attack you this phase',G.engaged);e.feint=true;log(`${N(e)} cannot attack this phase.`)},
  'Astonishing Speed':async()=>{G.effects.push({u:'phase',fn:(c,s)=>s==='w'&&isChar(c)&&hasTrait(c,'Rohan')?2:0});log('Rohan characters get +2 willpower this phase.','good')},
  'Forth Eorlingas!':async()=>{G.flags.forth=true;log('Rohan heroes can attack enemies in the staging area this phase.','good')},
  'The Muster of Rohan':async()=>{const al=G.deck.slice(0,10).filter(x=>x.d.type==='Ally'&&(x.d.traits||[]).includes('Rohan'));
    if(al.length){const r=await pick('The Muster of Rohan: choose up to 4 Rohan allies to put into play',al,{min:0,max:4});
      for(const c of r){if(uniqueBlocked(c))continue;G.deck=G.deck.filter(x=>x!==c);await enterPlay(c);c.muster=true}}
    else log('No Rohan allies in the top 10 cards.');shuffle(G.deck)}};

const ABIL={
  'Westfold Horse-Breaker':{label:'Discard: ready a hero',ok:()=>G.heroes.some(h=>h.exh),
    run:async c=>{const h=await pick1('Choose a hero to ready',G.heroes.filter(h=>h.exh));await leavePlay(c);h.exh=false;log(`${N(h)} readies.`,'good')}},
  'Westfold Outrider':{label:'Discard: engage an enemy',ok:()=>G.staging.some(isEnemy),
    run:async c=>{const e=await pick1('Choose the enemy to engage',G.staging.filter(isEnemy));await leavePlay(c);await engage(e)}}};
const canUse=c=>!!(G.window&&G.allies.includes(c)&&ABIL[N(c)]&&ABIL[N(c)].ok(c));

async function actionWindow(label,kind){
  for(;;){G.window=kind;
    const r=await ask({kind:'window',title:label});
    G.window=null;
    if(!r||r==='pass')break;
    if(r.type==='play'&&canPlayIn(r.c,kind))await playCard(r.c,{alloc:r.alloc});
    else if(r.type==='abil')await ABIL[N(r.c)].run(r.c)}
  G.window=null}
function canPlayIn(c,k){const w=G.window;G.window=k;const ok=canPlay(c);G.window=w;return ok}

// ---------- encounter ----------
async function engage(e){
  G.staging=G.staging.filter(x=>x!==e);if(!G.engaged.includes(e))G.engaged.push(e);
  log(`${N(e)} engages you.`,'enc');
  if(N(e)==='Forest Spider'){e.mods.push({s:'a',v:1,u:'round'});log('Forest Spider gets +1 attack until the end of the round.')}
  if(N(e)==='Hummerhorns'&&G.heroes.length){const h=await pick1('Hummerhorns: choose a hero to take 5 damage',G.heroes);await damage(h,5,'Hummerhorns')}}

const WR={
  'King Spider':async()=>{const r=chars().filter(c=>!c.exh);if(r.length){const c=await pick1('King Spider: choose and exhaust 1 character',r);c.exh=true;log(`${N(c)} is exhausted.`)}},
  "Ungoliant's Spawn":async()=>{const cs=chars().filter(c=>c.committed);for(const c of cs)c.mods.push({s:'w',v:-1,u:'phase'});if(cs.length)log('Each questing character gets −1 willpower this phase.','bad')},
  'Dol Guldur Orcs':async()=>{const r=chars().filter(c=>c.committed);if(r.length){const c=await pick1('Dol Guldur Orcs: choose a questing character to take 2 damage',r);await damage(c,2,'Dol Guldur Orcs')}},
  'Black Forest Bats':async()=>{const r=chars().filter(c=>c.committed);if(r.length){const c=await pick1('Black Forest Bats: remove 1 character from the quest',r);c.committed=false;log(`${N(c)} is removed from the quest.`)}},
  'Eyes of the Forest':async()=>{const ev=G.hand.filter(c=>c.d.type==='Event');G.hand=G.hand.filter(c=>c.d.type!=='Event');G.discard.push(...ev);log(`You discard ${pl(ev.length,'event')} from your hand.`,'bad')},
  'Caught in a Web':async c=>{const h=await pick1('Caught in a Web: choose the hero that gets this condition',G.heroes);h.att.push(c);c.host=h;log(`Caught in a Web is attached to ${N(h)}.`,'bad')},
  'Driven by Shadow':async()=>{const s=G.staging.filter(x=>isEnemy(x)||isLoc(x));if(!s.length)return'surge';
    G.effects.push({u:'phase',fn:(c,st)=>st==='thr'&&s.includes(c)&&G.staging.includes(c)?1:0});log('Each enemy and location in the staging area gets +1 threat this phase.','bad')},
  "The Necromancer's Reach":async()=>{for(const c of chars().filter(c=>c.exh))await damage(c,1,"Necromancer's Reach")}};

async function reveal(){
  if(!G.edeck.length){if(!G.ediscard.length){log('The encounter deck is empty.');return}
    G.edeck=shuffle(G.ediscard.map(resetCard));G.ediscard=[];log('The encounter discard pile is shuffled into a new encounter deck.')}
  const c=G.edeck.shift();log(`Revealed: ${N(c)}.`,'enc');
  await show('Encounter card revealed',c);
  const wr=WR[N(c)];let cancel=false;
  if(wr&&canResp('A Test of Will')){cancel=await offerResponse('A Test of Will',`Cancel the "When Revealed" effect of ${N(c)}.`);if(cancel)log('Effect cancelled.','good')}
  if(isEnemy(c)||isLoc(c))G.staging.push(c);
  let surge=false;
  if(wr&&!cancel)surge=(await wr(c))==='surge';
  if(c.d.type==='Treachery'&&!c.host)G.ediscard.push(c);
  H.render();
  if(surge){log('Surge: reveal another card.','enc');await reveal()}}

const SHADOW={
  'King Spider':async(e,d,u)=>{for(let i=0;i<(u?2:1);i++){const r=chars().filter(c=>!c.exh);if(!r.length)break;const c=await pick1('Shadow: choose and exhaust 1 character',r);c.exh=true}},
  'Hummerhorns':async(e,d,u)=>{for(const c of chars())await damage(c,u?2:1,'shadow')},
  "Ungoliant's Spawn":async(e,d,u)=>raiseThreat(u?8:4,'shadow'),
  'Dol Guldur Orcs':async(e,d,u)=>{e.mods.push({s:'a',v:u?3:1,u:'attack'});log(`${N(e)} gets +${u?3:1} attack.`,'bad')},
  'Forest Spider':async()=>{const at=myAttachments();if(at.length){const a=await pick1('Shadow: discard 1 attachment you control',at);discardAttachment(a)}},
  'East Bight Patrol':async(e,d,u)=>{e.mods.push({s:'a',v:1,u:'attack'});log(`${N(e)} gets +1 attack.`,'bad');if(u)raiseThreat(3,'shadow')},
  'Driven by Shadow':async(e,d,u)=>{if(u){for(const a of myAttachments())discardAttachment(a)}
    else if(d&&myAttachments([d]).length){const a=await pick1('Shadow: discard 1 attachment from the defending character',myAttachments([d]));discardAttachment(a)}}};

function dealShadow(e){if(!G.edeck.length)return;const s=G.edeck.shift();e.shadow.push(s)}

// ---------- quest ----------
async function placeProgress(n){
  if(G.active&&n>0){const L=G.active,t=Math.min(n,L.d.qp-L.prog);L.prog+=t;n-=t;log(`${t} progress on ${N(L)}.`);if(L.prog>=L.d.qp)await explore()}
  if(n>0){G.qprog+=n;log(`${n} progress on the quest (${G.qprog}/${G.quest.d.qp}).`,'good')}
  await checkQuest()}
async function checkQuest(){
  const q=G.quest;
  if(q.id===Q1&&G.qprog>=8)await advance(Q2);
  else if(q.id===Q2&&G.qprog>=2){log('A Fork in the Road: you advance to one of the "A Chosen Path" stages at random.');await advance(Math.random()<.5?QPATH:QBEORN)}
  else checkWin()}
async function advance(id){
  G.qprog=0;G.quest=mk(id,0);H.render();await show('New quest stage',G.quest);
  G.quest=mk(id,1);log(`Stage ${G.quest.d.cost}: ${N(G.quest)}.`,'phase');await show('Quest stage flipped',G.quest);
  if(id===QPATH){const pool=[...G.edeck,...G.ediscard].filter(c=>(c.d.traits||[]).includes('Spider'));
    if(pool.length){const c=await pick1("Don't Leave the Path!: choose 1 Spider card to add to the staging area",pool);
      G.edeck=G.edeck.filter(x=>x!==c);G.ediscard=G.ediscard.filter(x=>x!==c);resetCard(c);G.staging.push(c);shuffle(G.edeck);log(`${N(c)} is added to the staging area.`,'enc')}}
  checkWin()}
async function explore(){
  const L=G.active;G.active=null;log(`${N(L)} is explored.`,'good');
  const math=L.att.some(a=>N(a)==='Ancient Mathom');for(const a of[...L.att]){L.att=L.att.filter(x=>x!==a);G.discard.push(resetCard(a))}
  resetCard(L);G.ediscard.push(L);
  if(math){log('Ancient Mathom:');draw(3)}
  if(N(L)==='Mountains of Mirkwood'&&G.deck.length){const top=G.deck.slice(0,5);
    const r=await pick('Mountains of Mirkwood: add 1 of the top 5 cards of your deck to your hand (optional)',top,{min:0,max:1});
    if(r[0]){G.deck=G.deck.filter(x=>x!==r[0]);G.hand.push(r[0]);log(`${N(r[0])} goes to your hand.`)}shuffle(G.deck)}}

async function questSuccess(com){
  const hg=com.find(c=>N(c)==='Hirgon'&&isHero(c));
  if(hg){const al=G.hand.filter(c=>c.d.type==='Ally'&&c.d.sphere==='Tactics'&&!uniqueBlocked(c)&&canAfford(c,1));
    if(al.length){const r=await pick('Hirgon: play a Tactics ally from your hand, reducing its cost by 1 (to a minimum of 1)',al,{min:0,max:1});
      if(r[0]){const a=r[0];
        if(await playCard(a,{red:1})&&G.allies.includes(a)&&await yesno('Hirgon',`Raise your threat by 1 to give ${N(a)} +1 attack and +1 defense until the end of the round?`,a)){raiseThreat(1,'Hirgon');a.mods.push({s:'a',v:1,u:'round'},{s:'d',v:1,u:'round'})}}}}
  for(const l of com.filter(c=>N(c)==='Westfold Lancer'&&G.allies.includes(c))){const t=G.staging.filter(e=>isEnemy(e)&&!e.d.unique);if(!t.length)break;
    const r=await pick('Westfold Lancer: discard it to deal 2 damage to a non-unique enemy in the staging area (optional)',t,{min:0,max:1,stat:'hpleft'});
    if(r[0]){await leavePlay(l);await damageEnemy(r[0],2,'Westfold Lancer')}}
  for(const h of com.filter(isHero)){const ra=h.att.find(a=>N(a)==='The Red Arrow');
    if(ra&&G.threat>=40&&await yesno('The Red Arrow (Valour)','Add The Red Arrow to the victory display to search the top 5 cards of your deck for an ally and put it into play?',ra)){
      h.att=h.att.filter(a=>a!==ra);G.victory.push(resetCard(ra));
      const al=G.deck.slice(0,5).filter(c=>c.d.type==='Ally'&&!uniqueBlocked(c));
      if(al.length){const c=await pick1('The Red Arrow: choose the ally',al);G.deck=G.deck.filter(x=>x!==c);await enterPlay(c)}shuffle(G.deck)}}}

// ---------- phases ----------
function endPhase(){
  const all=[...chars(),...G.staging,...G.engaged,G.active].filter(Boolean);
  for(const c of all){c.mods=c.mods.filter(m=>m.u!=='phase'&&m.u!=='attack');c.feint=false}
  G.effects=G.effects.filter(e=>e.u!=='phase');G.flags.forth=false}
function phase(name){endPhase();G.phase=name;log(`Round ${G.round} · ${name}`,'phase')}

async function resourcePhase(){phase('Resource');for(const h of G.heroes)h.res++;log('Each hero gains 1 resource.');draw(1)}
async function planningPhase(){phase('Planning');H.openHand&&H.openHand();await actionWindow('Planning: play allies, attachments and events','planning')}
async function questPhase(){
  phase('Quest');
  const ready=chars().filter(c=>!c.exh);
  const com=await pick('Quest: select the characters to commit',ready,{min:0,max:ready.length,stat:'w',inline:true});
  for(const c of com){c.committed=true;c.exh=true}
  log(com.length?`You commit ${com.map(N).join(', ')}.`:'You commit no characters.');
  const lo=com.find(c=>N(c)==='Lothíriel');
  if(lo){const lt=traitsOf(lo);const al=G.hand.filter(c=>c.d.type==='Ally'&&(c.d.traits||[]).some(t=>lt.includes(t))&&!uniqueBlocked(c));
    if(al.length){const r=await pick('Lothíriel: put an ally from your hand that shares a Trait with her into play, exhausted and committed to the quest',al,{min:0,max:1});
      if(r[0]){G.hand=G.hand.filter(x=>x!==r[0]);await enterPlay(r[0]);r[0].exh=true;r[0].committed=true;G.flags.lothAlly=r[0]}}}
  await actionWindow('Quest: actions before staging','quest');
  G.phase='Quest · Staging';
  let n=1;
  if(canResp('Wait no Longer')&&await offerResponse('Wait no Longer','Search the top 5 cards of the encounter deck for an enemy, put it into play engaged with you and reveal 1 fewer card this phase.')){
    const t=G.edeck.slice(0,5).filter(isEnemy);
    if(t.length){const e=await pick1('Wait no Longer: choose the enemy',t);G.edeck=G.edeck.filter(x=>x!==e);await engage(e)}
    shuffle(G.edeck);n=0}
  for(let i=0;i<n;i++)await reveal();
  await actionWindow('Quest: actions before resolving the quest','quest');
  const W=questWill(),T=stagingThreat(),com2=chars().filter(c=>c.committed);
  log(`Quest resolution: ${W} willpower vs ${T} threat.`,'phase');
  if(W>T){await placeProgress(W-T);await questSuccess(com2)}
  else if(T>W)raiseThreat(T-W,'failed quest');
  else log('Tie: nothing happens.');
  for(const c of G.allies.filter(c=>c.committed&&N(c)==='Escort from Edoras')){log('Escort from Edoras is discarded.');await leavePlay(c)}
  for(const c of chars())c.committed=false;
  const la=G.flags.lothAlly;G.flags.lothAlly=null;
  if(la&&G.allies.includes(la)){log(`${N(la)} is shuffled back into your deck (Lothíriel).`);await leavePlay(la,'deck')}}
const canTravel=L=>N(L)==='Great Forest Web'?G.heroes.some(h=>!h.exh):N(L)==="Necromancer's Pass"?G.hand.length>=2:true;
async function travelPhase(){
  phase('Travel');
  if(G.active){log(`${N(G.active)} is still active: no travel.`);return}
  const locs=G.staging.filter(isLoc).filter(canTravel);if(!locs.length)return;
  const L=(await pick('Travel: choose a location to travel to (optional)',locs,{min:0,max:1,stat:'qp',inline:true}))[0];if(!L)return;
  const n=N(L);
  if(n==='Great Forest Web'){const h=await pick1('Great Forest Web: exhaust 1 hero to travel here',G.heroes.filter(h=>!h.exh),{inline:true});h.exh=true}
  if(n==="Necromancer's Pass")for(let i=0;i<2;i++){const c=G.hand.splice(Math.random()*G.hand.length|0,1)[0];G.discard.push(c);log(`You discard ${N(c)} at random.`,'bad')}
  if(n==='Mountains of Mirkwood'){log('Mountains of Mirkwood: reveal the top card of the encounter deck.');await reveal()}
  G.staging=G.staging.filter(x=>x!==L);G.active=L;log(`You travel to ${n}.`);
  if(n==='Old Forest Road'){const ex=chars().filter(c=>c.exh);if(ex.length){const r=await pick('Old Forest Road: ready 1 character (optional)',ex,{min:0,max:1,inline:true});if(r[0]){r[0].exh=false;log(`${N(r[0])} readies.`,'good')}}}
  if(n==='Forest Gate'&&await yesno('Forest Gate','Draw 2 cards?',L))draw(2)}
async function encounterPhase(){
  phase('Encounter');
  const en=G.staging.filter(isEnemy);
  if(en.length){const r=await pick(`Optional engagement: choose an enemy to engage (your threat: ${G.threat})`,en,{min:0,max:1,stat:'eng',inline:true});if(r[0])await engage(r[0])}
  for(;;){const c=sortEng(G.staging.filter(e=>isEnemy(e)&&e.d.eng<=G.threat));if(!c.length)break;
    log(`Engagement check: ${N(c[0])} (engagement ${c[0].d.eng}) ≤ threat ${G.threat}.`);await engage(c[0])}}
async function enemyAttack(e){
  if(N(e)==='Dol Guldur Beastmaster'){dealShadow(e);log('Dol Guldur Beastmaster is dealt an additional shadow card.')}
  const cands=chars().filter(c=>!c.exh);
  const r=await pick(`${N(e)} attacks (${stat(e,'a')} attack): choose a defender, or none`,cands,{min:0,max:1,stat:'d',card:e,inline:true});
  const d=r[0]||null,u=!d;
  if(d){d.exh=true;log(`${N(d)} defends against ${N(e)}.`)}else log(`${N(e)}: undefended attack!`,'bad');
  for(const s of e.shadow){if(s.up)continue;s.up=true;H.render();await show('Shadow card',s,s.d.shadow||'No shadow effect.');const f=SHADOW[N(s)];if(f&&s.d.shadow)await f(e,d,u)}
  if(G.engaged.includes(e)){const atk=stat(e,'a');
    if(d){if(isChar(d)){const dm=atk-stat(d,'d');if(dm>0)await damage(d,dm,N(e));else log(`${N(d)} absorbs the attack.`)}}
    else if(G.heroes.length){const h=await pick1(`Undefended attack: ${atk} damage to one hero`,G.heroes,{stat:'hpleft',inline:true});await damage(h,atk,`${N(e)}, undefended`)}
    if(N(e)==='Chieftan Ufthak'){e.res++;log('Chieftain Ufthak gets 1 resource (+2 attack each).','bad')}}
  for(const c of[...chars(),e])c.mods=c.mods.filter(m=>m.u!=='attack');
  checkLose()}
async function playerAttacks(){
  for(;;){
    const ready=chars().filter(c=>!c.exh);if(!ready.length)break;
    const rohanHeroes=ready.filter(c=>isHero(c)&&hasTrait(c,'Rohan'));
    const targets=[...G.engaged,...(G.flags.forth&&rohanHeroes.length?G.staging.filter(isEnemy):[])];
    if(!targets.length)break;
    const e=(await pick('Your attacks: choose an enemy to attack, or finish',targets,{min:0,max:1,stat:'hpleft',inline:true}))[0];if(!e)break;
    const pool=G.staging.includes(e)?rohanHeroes:ready;
    const A=await pick(`Attackers against ${N(e)} (defense ${stat(e,'d')}, ${stat(e,'hp')-e.dmg} hit points left)`,pool,{min:0,max:pool.length,stat:'a',card:e,inline:true});
    if(!A.length)continue;
    for(const c of A)c.exh=true;
    for(const k of A.filter(c=>N(c)==='Riddermark Knight'))if(await yesno('Riddermark Knight','+2 attack for this attack? (it is discarded at the end of the attack)',k)){k.mods.push({s:'a',v:2,u:'attack'});k.rk=true}
    const atk=A.reduce((t,c)=>t+stat(c,'a'),0),dm=Math.max(0,atk-stat(e,'d')),left=stat(e,'hp')-e.dmg;
    log(`Attack ${atk} vs defense ${stat(e,'d')}: ${dm} damage.`);
    let ex=0,ffT=null;
    if(A.length===1&&dm>left){const ff=A[0].att.find(a=>N(a)==='Firefoot'&&!a.exh);const o=G.engaged.filter(x=>x!==e&&!x.d.unique);
      if(ff&&o.length&&await yesno('Firefoot',`Exhaust Firefoot to assign ${dm-left} excess damage to another non-unique enemy?`,ff)){ff.exh=true;ex=dm-left;ffT=await pick1('Firefoot: choose the enemy',o,{stat:'hpleft',inline:true})}}
    await damageEnemy(e,dm-ex,'attack');if(ffT)await damageEnemy(ffT,ex,'Firefoot');
    for(const k of A.filter(c=>c.rk&&G.allies.includes(c))){log('Riddermark Knight is discarded.');await leavePlay(k)}
    for(const c of chars())c.mods=c.mods.filter(m=>m.u!=='attack')}}
async function combatPhase(){
  phase('Combat');
  if(!G.engaged.length){
    const fe=G.hand.find(c=>N(c)==='Forth Eorlingas!');
    if(!(fe&&G.staging.some(isEnemy)&&canPlayIn(fe,'combat')))return;
    await actionWindow('Combat: no engaged enemies (you can play Forth Eorlingas!)','combat');
    if(!G.engaged.length&&!G.flags.forth)return}
  let oath=false;
  if(G.engaged.length&&canResp('Oath of Eorl'))oath=await offerResponse('Oath of Eorl','Resolve your attacks first, before the enemy attacks this phase.');
  for(const e of sortEng(G.engaged))dealShadow(e);
  H.render();
  await actionWindow('Combat: actions before enemy attacks','combat');
  const enemyPhase=async()=>{for(const e of sortEng(G.engaged)){if(!G.engaged.includes(e))continue;if(e.feint){log(`${N(e)} does not attack (Feint).`);continue}await enemyAttack(e)}};
  if(oath){await playerAttacks();await enemyPhase()}
  else{await enemyPhase();if(G.engaged.length||G.flags.forth)await actionWindow('Combat: actions before your attacks','combat');await playerAttacks()}
  for(const e of G.engaged){G.ediscard.push(...e.shadow.map(resetCard));e.shadow=[]}}
async function refreshPhase(){
  phase('Refresh');
  for(const c of chars()){const web=c.att.find(a=>N(a)==='Caught in a Web');
    if(web&&c.exh){if(c.res>=2&&await yesno('Caught in a Web',`Pay 2 resources from ${N(c)} to ready them?`,web)){c.res-=2;c.exh=false}else log(`${N(c)} does not ready (Caught in a Web).`,'bad')}
    else c.exh=false;
    for(const a of c.att)a.exh=false}
  raiseThreat(1,'refresh phase');
  for(const c of G.allies.filter(c=>N(c)==='Gandalf')){log('Gandalf is discarded at the end of the round.');await leavePlay(c)}
  for(const c of G.allies.filter(c=>c.muster)){log(`${N(c)} is discarded (The Muster of Rohan).`);await leavePlay(c)}
  for(const c of[...chars(),...G.staging,...G.engaged,G.active].filter(Boolean))c.mods=c.mods.filter(m=>m.u!=='round');
  G.effects=G.effects.filter(e=>e.u!=='round');G.flags.eomer=false}

// ---------- game ----------
function newGame(deck){
  UID=1;
  G={threat:0,heroes:[],allies:[],hand:[],deck:[],discard:[],edeck:[],ediscard:[],staging:[],active:null,engaged:[],victory:[],
     quest:null,qprog:0,round:0,phase:'Setup',effects:[],flags:{},log:[],window:null,over:null,deckName:deck.name};
  G.heroes=deck.heroes.map(id=>mk(id));G.threat=G.heroes.reduce((t,h)=>t+(h.d.cost||0),0);
  for(const[id,q]of deck.cards)for(let i=0;i<q;i++)G.deck.push(mk(id));shuffle(G.deck);
  for(const[id,q,g]of PTM){if(g==='QuestDeck')continue;for(let i=0;i<q;i++)(g==='StagingArea'?G.staging:G.edeck).push(mk(id))}
  shuffle(G.edeck);G.quest=mk(Q1,0);return G}

// ---------- save / resume (checkpoint at the start of every phase) ----------
function saveState(){return JSON.stringify(G,(k,v)=>k==='d'?undefined:k==='host'?(v&&v.uid):k==='effects'?[]:k==='lothAlly'?null:k==='log'?v.slice(-80):v)}
function loadState(str){
  const g=JSON.parse(str);let max=0;
  const fix=o=>{if(Array.isArray(o)){o.forEach(fix);return}if(o&&typeof o==='object'){if(o.uid&&o.id){o.d=def(o.id,o.side||0);max=Math.max(max,o.uid)}for(const k in o)if(k!=='d')fix(o[k])}};
  fix(g);G=g;UID=max+1;
  for(const c of[...G.heroes,...G.allies])for(const a of c.att)if(a.host)a.host=c;
  Object.assign(G,{window:null,over:null,error:null,effects:[]});return G}
const PHASES=[resourcePhase,planningPhase,questPhase,travelPhase,encounterPhase,combatPhase,refreshPhase];
async function runGame(resume=false){
  try{
    if(resume){log(`Game resumed: round ${G.round+(G.ph===0?1:0)}.`,'phase')}
    else{
    log(`Starting threat ${G.threat}.`,'phase');H.render();
    await show('Passage Through Mirkwood',G.quest,'Setup: Forest Spider and Old Forest Road are added to the staging area, and the encounter deck is shuffled.');
    G.quest=mk(Q1,1);log('Stage 1: Flies and Spiders.','phase');
    G.hand=G.deck.splice(0,6);H.render();
    const m=await ask({kind:'buttons',title:'Opening hand',text:'You may take one mulligan: shuffle your hand back into your deck and draw 6 new cards.',cards:G.hand,options:[{label:'Keep',value:'k',primary:true},{label:'Mulligan',value:'m'}]});
    if(m==='m'){G.deck.push(...G.hand);G.hand=[];shuffle(G.deck);G.hand=G.deck.splice(0,6);log('You take a mulligan.')}
    G.ph=0}
    for(;;){H.save();if(G.ph===0)G.round++;await PHASES[G.ph]();G.ph=(G.ph+1)%PHASES.length}
  }catch(e){
    if(e instanceof GameOver){G.over={win:e.win,msg:e.message};G.window=null;log(e.win?'Victory! '+e.message:'Defeat. '+e.message,e.win?'good':'bad');H.render();H.onEnd()}
    else{console.error(e);G.error=String(e&&e.stack||e);H.render()}}}
