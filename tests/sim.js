const fs=require('fs'),vm=require('vm');
const ctx={console,Math,setTimeout};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/../src/data.js','utf8')+fs.readFileSync(__dirname+'/../src/engine.js','utf8')+`
;this.run=async function(seed){
 const deck={name:'Riders',heroes:STARTERS.starterRohan.heroes,cards:STARTERS.starterRohan.cards};
 let steps=0;
 H.ask=async cfg=>{ if(++steps>20000) throw new Error('loop');
   if(cfg.kind==='window'){ // try to play something affordable randomly
     const pl=G.hand.filter(canPlay); const ab=G.allies.filter(canUse);
     if(pl.length&&Math.random()<.7) return {type:'play',c:pl[Math.random()*pl.length|0]};
     if(ab.length&&Math.random()<.1) return {type:'abil',c:ab[0]};
     return 'pass'}
   if(cfg.kind==='buttons') return cfg.options[0].value;
   if(cfg.kind==='pick'){ const t=cfg.title; let c=[...cfg.cands]; if(cfg.stat) c.sort((a,b)=>stat(b,cfg.stat==='hpleft'?'hp':cfg.stat)-stat(a,cfg.stat==='hpleft'?'hp':cfg.stat)); if(t.startsWith('Missão: escolhe')) return c.slice(0,Math.max(0,c.length-1)); if(t.startsWith('Atacantes')) return c; if(t.includes('Enfrentamento opcional')) return []; return c.slice(0,Math.max(cfg.min,1)).slice(0,cfg.max)}
 };
 newGame(deck); await runGame(); return {over:G.over,err:G.error,round:G.round,steps,quest:G.quest&&N(G.quest),threat:G.threat};
}`,ctx);
(async()=>{const res={};let errs=0;for(let i=0;i<300;i++){const r=await ctx.run(i);if(r.err){errs++;if(errs<4)console.log(r.err)}const k=(r.quest||'')+' | '+(r.over?(r.over.win?'WIN ':'LOSE ')+r.over.msg.slice(0,30):'none');res[k]=(res[k]||0)+1;}
console.log(res,'errors',errs)})();
