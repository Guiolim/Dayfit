import {useEffect,useState} from 'react'
import {sb,form} from '../supabase'
import {today,tot,loadPlans,Icon,initials,DietView,WorkoutView} from '../ui'
import Biblioteca from './Biblioteca'
import Evolucao from './Evolucao'
export default function Trainer({me,tab}){return tab==='biblioteca'?<Biblioteca/>:<Pacientes me={me}/>}
function Pacientes({me}){
  const [pts,setPts]=useState([]),[free,setFree]=useState([]),[sel,setSel]=useState(null),[q,setQ]=useState('')
  const load=async()=>{const r=await sb.from('profiles').select('id,name,trainer_id').eq('role','patient').order('name');const a=r.data||[]
    setPts(a.filter(x=>x.trainer_id===me.id));setFree(a.filter(x=>!x.trainer_id))}
  useEffect(()=>{load()},[])
  if(sel)return <Editor p={sel} back={()=>setSel(null)} me={me}/>
  const f=pts.filter(x=>x.name.toLowerCase().includes(q.toLowerCase()))
  return <><h1>Meus pacientes</h1><p className="m">{pts.length} {pts.length===1?'paciente ativo':'pacientes ativos'}</p>
    <label className="fld" style={{margin:'12px 0'}}><Icon n="search" s={18}/><input placeholder="Buscar paciente" value={q} onChange={e=>setQ(e.target.value)}/></label>
    {f.map(x=><div className="card meal pt" key={x.id} onClick={()=>setSel(x)}><div className="av">{initials(x.name)}</div><div className="t"><h3>{x.name}</h3><span className="m">Dieta · Treino · Evolução</span></div><Icon n="down" s={20}/></div>)}
    {!f.length&&<div className="card empty"><Icon n="users" s={28}/><p>Nenhum paciente {q?'encontrado':'vinculado ainda'}.</p></div>}
    {free.length>0&&<><h2>Pacientes sem personal</h2>{free.map(x=><div className="card meal" key={x.id}><div className="av">{initials(x.name)}</div><div className="t"><h3>{x.name}</h3></div>
      <button className="btn alt" onClick={async()=>{await sb.from('profiles').update({trainer_id:me.id}).eq('id',x.id);load()}}>Assumir</button></div>)}</>}</>
}
function Resumo({p,d,w}){
  const [s,setS]=useState({})
  useEffect(()=>{(async()=>{
    const ev=await sb.from('evolution').select('weight,day').eq('patient_id',p.id).not('weight','is',null).order('day',{ascending:false}).limit(1)
    const wk=await sb.from('workout_logs').select('id',{count:'exact',head:true}).eq('patient_id',p.id).gte('done_at',new Date(Date.now()-7*864e5).toISOString())
    const mc=await sb.from('meal_checks').select('meal').eq('patient_id',p.id).eq('day',today())
    setS({kg:ev.data?.[0]?.weight,wk:wk.count,mc:(mc.data||[]).length})})()},[p.id])
  const meals=d?new Set(d.diet_items.map(i=>i.meal)).size:0
  const cards=[['scale',s.kg??'–','Peso atual (kg)'],['flame',d?Math.round(tot(d.diet_items,'kcal')):'–','kcal planejadas'],['utensils',d?`${s.mc??0}/${meals}`:'–','Refeições hoje'],['dumbbell',s.wk??'–','Exercícios em 7 dias']]
  return <><div className="grid2">{cards.map(([i,v,l])=><div className="card st" key={l}><Icon n={i} s={18}/><b>{v}</b><span>{l}</span></div>)}</div>
    <div className="card"><h3>Plano atual</h3><p className="m">Dieta: {d?`${d.title}${d.kcal_goal?` · meta ${d.kcal_goal} kcal`:''}`:'não criada'}</p><p className="m">Treino: {w?w.title:'não criado'}</p></div></>
}
function Editor({p,me,back}){
  const [t,setT]=useState('resumo'),[d,setD]=useState(),[w,setW]=useState(),[foods,setFoods]=useState([]),[ex,setEx]=useState([]),[ready,setReady]=useState(false)
  const load=async()=>{const [a,b]=await loadPlans(p.id);setD(a);setW(b);setReady(true)}
  useEffect(()=>{load();sb.from('foods').select('id,name').order('name').then(r=>setFoods(r.data||[]));sb.from('exercises').select('id,name').order('name').then(r=>setEx(r.data||[]))},[])
  const run=async q=>{const r=await q;if(r.error)alert(r.error.message);load()}
  const n=x=>Number(x)||null
  const find=(l,name)=>l.find(x=>x.name.toLowerCase()===name.trim().toLowerCase())
  const addFood=e=>{const v=form(e),f=find(foods,v.food);if(!f)return alert('Escolha um alimento da lista (ou cadastre na Biblioteca).')
    run(sb.from('diet_items').insert({plan_id:d.id,meal:v.meal.trim(),food_id:f.id,grams:Number(v.grams)}))}
  const addEx=e=>{const v=form(e),x=find(ex,v.ex);if(!x)return alert('Escolha um exercício da lista (ou cadastre na Biblioteca).')
    run(sb.from('workout_items').insert({plan_id:w.id,day:v.day.trim(),exercise_id:x.id,sets:Number(v.sets),reps:v.reps,notes:v.notes||null}))}
  return <><button className="ghost back" onClick={back}><Icon n="back" s={18}/> Pacientes</button>
    <div className="meal" style={{margin:'12px 0'}}><div className="av lg">{initials(p.name)}</div><div className="t"><h1>{p.name}</h1><span className="m">Paciente</span></div></div>
    <div className="seg">{[['resumo','Resumo'],['dieta','Dieta'],['treino','Treino'],['evolucao','Evolução']].map(([k,l])=><button key={k} className={t===k?'on':''} onClick={()=>setT(k)}>{l}</button>)}</div>
    {t==='resumo'&&ready&&<Resumo p={p} d={d} w={w}/>}
    {t==='dieta'&&<>
      {d&&<div className="card"><div className="meal"><div className="t"><h3>{d.title}</h3><span className="m">{Math.round(tot(d.diet_items,'kcal'))} kcal · P {Math.round(tot(d.diet_items,'protein'))} · C {Math.round(tot(d.diet_items,'carbs'))} · G {Math.round(tot(d.diet_items,'fat'))} g{d.kcal_goal?` · meta ${d.kcal_goal}`:''}</span></div>
        <button className="x" onClick={()=>confirm('Excluir esta dieta inteira?')&&run(sb.from('diet_plans').delete().eq('id',d.id))} aria-label="Excluir dieta"><Icon n="trash" s={18}/></button></div></div>}
      <DietView d={d} onDel={id=>run(sb.from('diet_items').delete().eq('id',id))} onGrams={(id,g)=>run(sb.from('diet_items').update({grams:g}).eq('id',id))}/>
      {d&&<form className="card" onSubmit={addFood}><h3>Adicionar alimento</h3>
        <datalist id="ml">{['Café da manhã','Lanche da manhã','Almoço','Lanche da tarde','Pré-treino','Pós-treino','Jantar','Ceia'].map(x=><option key={x} value={x}/>)}</datalist>
        <datalist id="fl">{foods.map(x=><option key={x.id} value={x.name}/>)}</datalist>
        <div className="row"><input name="meal" list="ml" placeholder="Refeição" required/><input name="food" list="fl" placeholder="Alimento (digite para buscar)" required/><input name="grams" type="number" min="1" placeholder="Gramas" required/></div>
        <button className="btn full">Adicionar</button></form>}
      <details className="card" open={ready&&!d}><summary><Icon n="plus" s={18}/> {d?'Criar nova dieta (substitui a atual)':'Criar dieta'}</summary>
        <form onSubmit={e=>{const v=form(e);run(sb.from('diet_plans').insert({patient_id:p.id,author_id:me.id,title:v.title,kcal_goal:n(v.kcal),notes:v.notes||null}))}}>
        <div className="row"><input name="title" placeholder="Título (ex.: Dieta de hipertrofia)" required/><input name="kcal" type="number" placeholder="Meta kcal"/></div>
        <div className="row"><input name="notes" placeholder="Observações para o paciente"/></div><button className="btn full">Criar dieta</button></form></details></>}
    {t==='treino'&&<>
      {w&&<div className="card"><div className="meal"><div className="t"><h3>{w.title}</h3><span className="m">{new Set(w.workout_items.map(i=>i.day)).size} dias · {w.workout_items.length} exercícios</span></div>
        <button className="x" onClick={()=>confirm('Excluir este treino inteiro?')&&run(sb.from('workout_plans').delete().eq('id',w.id))} aria-label="Excluir treino"><Icon n="trash" s={18}/></button></div></div>}
      <WorkoutView w={w} onDel={id=>run(sb.from('workout_items').delete().eq('id',id))}/>
      {w&&<form className="card" onSubmit={addEx}><h3>Adicionar exercício</h3>
        <datalist id="xl">{ex.map(x=><option key={x.id} value={x.name}/>)}</datalist>
        <div className="row"><input name="day" placeholder="Dia (ex.: Treino A)" required/><input name="ex" list="xl" placeholder="Exercício (digite para buscar)" required/></div>
        <div className="row"><input name="sets" type="number" min="1" placeholder="Séries" required/><input name="reps" placeholder="Reps (ex.: 8-10)" required/><input name="notes" placeholder="Obs. (descanso, técnica)"/></div>
        <button className="btn full">Adicionar</button></form>}
      <details className="card" open={ready&&!w}><summary><Icon n="plus" s={18}/> {w?'Criar novo treino (substitui o atual)':'Criar treino'}</summary>
        <form onSubmit={e=>{const v=form(e);run(sb.from('workout_plans').insert({patient_id:p.id,author_id:me.id,title:v.title,notes:v.notes||null}))}}>
        <div className="row"><input name="title" placeholder="Título (ex.: ABC hipertrofia)" required/><input name="notes" placeholder="Observações"/></div><button className="btn full">Criar treino</button></form></details></>}
    {t==='evolucao'&&<Evolucao patientId={p.id} me={me} ask="Registrar avaliação ou feedback"/>}</>
}
