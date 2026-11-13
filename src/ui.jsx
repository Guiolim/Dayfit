import {useState} from 'react'
import {sb} from './supabase'

export const today=()=>new Date().toLocaleDateString('sv')
export const br=d=>new Date(d+'T12:00').toLocaleDateString('pt-BR')
export const tot=(it,f)=>it.reduce((a,i)=>a+(i.foods?.[f]||0)*i.grams/100,0)
export const initials=n=>(n||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()

export const mealEmoji=n=>{n=(n||'').toLowerCase()
  return n.includes('café')?'☕':n.includes('pré')?'⚡':n.includes('pós')?'🥤':n.includes('lanche')?'🍎':n.includes('almoço')?'🍛':n.includes('jantar')?'🍲':n.includes('ceia')?'🌙':'🍽️'}

const IC={
  home:['M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z','M9 21v-7h6v7'],
  dumbbell:['M6.5 6.5v11','M17.5 6.5v11','M3.5 9v6','M20.5 9v6','M6.5 12h11'],
  activity:['M22 12h-4l-3 9L9 3l-3 9H2'],
  users:['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8','M22 21v-2a4 4 0 0 0-3-3.9','M16 3.1a4 4 0 0 1 0 7.8'],
  user:['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2','M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8'],
  utensils:['M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2','M7 2v20','M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7'],
  shield:['M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z'],
  plus:['M5 12h14','M12 5v14'],check:['M20 6 9 17l-5-5'],x:['M18 6 6 18','M6 6l12 12'],
  down:['m6 9 6 6 6-6'],back:['m12 19-7-7 7-7','M19 12H5'],
  out:['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4','m16 17 5-5-5-5','M21 12H9'],
  flame:['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.900 4 6.500 2 1.600 3 3.500 3 5.500a7 7 0 1 1-14 0c0-1.200.4-2.300 1-3a2.500 2.500 0 0 0 2.500 2.500z'],
  msg:['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
  search:['M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16','m21 21-4.3-4.3'],
  trash:['M3 6h18','M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6','M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'],
  mail:['M3 5h18v14H3z','m3 7 9 6 9-6'],lock:['M5 11h14v10H5z','M8 11V7a4 4 0 0 1 8 0v4'],
  scale:['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z','M8 9a4 4 0 0 1 8 0','m12 9 2-2'],
  target:['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18','M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8'],
  book:['M4 19.5A2.5 2.5 0 0 1 6.5 17H20','M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'],
}
export const Icon=({n,s=22,w=2})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{(IC[n]||[]).map((d,i)=><path key={i} d={d}/>)}</svg>

export const loadPlans=async id=>{
  const q=(t,s)=>sb.from(t).select(s).eq('patient_id',id).order('created_at',{ascending:false}).limit(1).then(r=>r.data?.[0])
  const d=await q('diet_plans','*,diet_items(*,foods(*))'),w=await q('workout_plans','*,workout_items(*,exercises(name,muscle))')
  d?.diet_items.sort((a,b)=>a.id-b.id);w?.workout_items.sort((a,b)=>a.id-b.id)
  return [d,w]
}

export function WeekStrip({day,onPick}){
  const t=new Date(),mon=new Date(t);mon.setDate(t.getDate()-((t.getDay()+6)%7))
  const names=['seg','ter','qua','qui','sex','sáb','dom']
  return <div className="week">{names.map((n,i)=>{const d=new Date(mon);d.setDate(mon.getDate()+i);const s=d.toLocaleDateString('sv')
    return <button key={s} className={(day===s?'on ':'')+(s===today()?'now':'')} onClick={()=>onPick(s)}><small>{n}</small><b>{d.getDate()}</b></button>})}</div>
}

export function Ring({v,max,size=132}){
  const r=52,c=2*Math.PI*r,p=Math.min(v/(max||1),1),left=Math.round(max-v)
  return <div className="ring" style={{width:size,height:size}}><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r={r} className="rb"/><circle cx="60" cy="60" r={r} className="rf" strokeDasharray={c} strokeDashoffset={c*(1-p)}/></svg>
    <div className="mid"><b>{Math.abs(left)}</b><span>{left>=0?'restantes':'acima da meta'}</span></div></div>
}

export function Summary({eaten,goal,macros}){
  return <div className="card hero-card">
    <div className="sumrow"><div className="stat"><Icon n="utensils" s={18}/><b>{Math.round(eaten)}</b><span>Consumidas</span></div>
      <Ring v={eaten} max={goal}/>
      <div className="stat"><Icon n="target" s={18}/><b>{Math.round(goal)}</b><span>Meta kcal</span></div></div>
    <div className="macros3">{macros.map(m=><div key={m.n}><div className="lab"><span>{m.n}</span><b>{Math.round(m.v)}<small>/{m.max} g</small></b></div>
      <div className="bar"><i style={{width:Math.min(m.v/(m.max||1)*100,100)+'%',background:m.color}}/></div></div>)}</div></div>
}

export function DietView({d,onDel,ck,onCk,onGrams}){
  const [shut,setShut]=useState({})
  if(!d)return <div className="card empty"><Icon n="utensils" s={28}/><p>Sem dieta ainda.</p></div>
  const meals=[...new Set(d.diet_items.map(i=>i.meal))]
  if(!meals.length)return <div className="card empty"><Icon n="utensils" s={28}/><p>Dieta criada, mas ainda sem alimentos.</p></div>
  return <>{meals.map(m=>{const its=d.diet_items.filter(i=>i.meal===m),open=!shut[m]
    return <div className="card meal-card" key={m}>
      <div className="meal"><div className="ico">{mealEmoji(m)}</div>
        <div className="t" onClick={()=>setShut({...shut,[m]:open})} style={{cursor:'pointer'}}><h3>{m}</h3><span className="m">{Math.round(tot(its,'kcal'))} kcal · P {Math.round(tot(its,'protein'))} · C {Math.round(tot(its,'carbs'))} · G {Math.round(tot(its,'fat'))}</span></div>
        {onCk?<button className={'chk'+(ck?.has(m)?' on':'')} onClick={()=>onCk(m)} aria-label="Marcar refeição"><Icon n="check" s={18} w={3}/></button>
          :<button className={'chev'+(open?' up':'')} onClick={()=>setShut({...shut,[m]:open})} aria-label="Abrir"><Icon n="down" s={20}/></button>}</div>
      {open&&its.map(i=><div className="it" key={i.id}><span className="fn">{i.foods.name}</span>
        <span className="m end">{onGrams?<input className="g" type="number" defaultValue={i.grams} onBlur={e=>{const g=Number(e.target.value);if(g>0&&g!==i.grams)onGrams(i.id,g)}}/>:<>{i.grams}</>} g · {Math.round(i.foods.kcal*i.grams/100)} kcal
          {onDel&&<button className="x" onClick={()=>onDel(i.id)} aria-label="Remover"><Icon n="trash" s={16}/></button>}</span></div>)}</div>})}</>
}

export function WorkoutView({w,onDel,onLog,done}){
  const [sel,setSel]=useState(null),[open,setOpen]=useState(null),[load,setLoad]=useState('')
  if(!w)return <div className="card empty"><Icon n="dumbbell" s={28}/><p>Sem treino ainda.</p></div>
  const days=[...new Set(w.workout_items.map(i=>i.day))]
  if(!days.length)return <div className="card empty"><Icon n="dumbbell" s={28}/><p>Treino criado, mas ainda sem exercícios.</p></div>
  const cur=days.includes(sel)?sel:days[0],items=w.workout_items.filter(i=>i.day===cur),nd=items.filter(i=>done?.has(i.id)).length
  return <>{w.notes&&<p className="m" style={{marginBottom:8}}>{w.notes}</p>}
    <div className="chips">{days.map(d=><button key={d} className={d===cur?'on':''} onClick={()=>{setSel(d);setOpen(null)}}>{d}</button>)}</div>
    {onLog&&<div className="card"><div className="lab"><span>Progresso de hoje</span><b>{nd}/{items.length}</b></div><div className="bar"><i style={{width:(nd/items.length*100)+'%',background:'var(--g)'}}/></div></div>}
    {items.map((i,k)=>{const dn=done?.has(i.id)
      return <div className="card ex" key={i.id}><div className="meal">
        <div className="num">{k+1}</div>
        <div className="t" style={{cursor:onLog&&!dn?'pointer':'default'}} onClick={()=>{if(onLog&&!dn){setOpen(open===i.id?null:i.id);setLoad('')}}}><h3>{i.exercises.name}</h3>
          <span className="m">{i.sets} séries × {i.reps}{i.exercises.muscle?` · ${i.exercises.muscle}`:''}</span>{i.notes&&<span className="m" style={{display:'block'}}>{i.notes}</span>}</div>
        {onLog&&<button className={'chk'+(dn?' on':'')} onClick={()=>{if(!dn){setOpen(open===i.id?null:i.id);setLoad('')}}} aria-label="Concluir"><Icon n="check" s={18} w={3}/></button>}
        {onDel&&<button className="x" onClick={()=>onDel(i.id)} aria-label="Remover"><Icon n="trash" s={16}/></button>}</div>
      {open===i.id&&<div className="row"><input type="number" step="0.5" placeholder="Carga usada (kg)" value={load} onChange={e=>setLoad(e.target.value)} autoFocus/><button className="btn" onClick={()=>{onLog(i,Number(load)||null);setOpen(null)}}>Concluir</button></div>}</div>})}</>
}

export function WeightChart({pts}){
  if(!pts.length)return <div className="card empty"><Icon n="activity" s={28}/><p>Sem registros de peso.</p></div>
  const v=pts.map(x=>+x.weight),mn=Math.min(...v)-.5,mx=Math.max(...v)+.5,W=300,H=100,d=v[v.length-1]-v[0]
  const xy=v.map((y,i)=>[v.length>1?i*W/(v.length-1):W/2,H-(y-mn)/(mx-mn)*H])
  return <div className="card"><div className="lab"><span>Peso</span><b>{v[v.length-1]} kg</b></div>
    <svg viewBox={`-6 -6 ${W+12} ${H+12}`} style={{width:'100%',overflow:'visible'}}>
      <polyline points={xy.map(p=>p.join(',')).join(' ')} fill="none" stroke="#16b364" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
      {xy.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#fff" stroke="#16b364" strokeWidth="2.5"/>)}</svg>
    {v.length>1&&<p className="m">{d>=0?'+':''}{d.toFixed(1)} kg desde {br(pts[0].day)}</p>}</div>
}
