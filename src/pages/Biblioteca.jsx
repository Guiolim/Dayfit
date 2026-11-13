import {useEffect,useState} from 'react'
import {sb,form} from '../supabase'
import {Icon} from '../ui'
export default function Biblioteca(){
  const [f,setF]=useState([]),[e,setE]=useState([]),[q,setQ]=useState(''),[t,setT]=useState('alimentos')
  const load=()=>{sb.from('foods').select('*').order('name').then(r=>setF(r.data||[]));sb.from('exercises').select('*').order('name').then(r=>setE(r.data||[]))}
  useEffect(()=>{load()},[])
  const ins=async(tb,row)=>{const r=await sb.from(tb).insert(row);if(r.error)alert(r.error.message);load()}
  const n=x=>Number(x)||0,has=s=>(s||'').toLowerCase().includes(q.toLowerCase())
  return <><h1>Biblioteca</h1>
    <div className="seg" style={{margin:'12px 0'}}><button className={t==='alimentos'?'on':''} onClick={()=>setT('alimentos')}>Alimentos</button><button className={t==='exercicios'?'on':''} onClick={()=>setT('exercicios')}>Exercícios</button></div>
    <label className="fld" style={{marginBottom:12}}><Icon n="search" s={18}/><input placeholder={t==='alimentos'?'Buscar alimento':'Buscar exercício'} value={q} onChange={x=>setQ(x.target.value)}/></label>
    {t==='alimentos'?<>
      <div className="card"><p className="m">Valores por 100 g.</p>{f.filter(x=>has(x.name)).map(x=><div className="it" key={x.id}><span className="fn">{x.name}</span><span className="m end">{Math.round(x.kcal)} kcal · P{x.protein} C{x.carbs} G{x.fat}</span></div>)}</div>
      <form className="card" onSubmit={x=>{const v=form(x);ins('foods',{name:v.name,kcal:n(v.kcal),protein:n(v.p),carbs:n(v.c),fat:n(v.g)})}}><h3>Novo alimento (por 100 g)</h3>
        <div className="row"><input name="name" placeholder="Nome" required style={{flexBasis:'100%'}}/><input name="kcal" type="number" step="any" placeholder="kcal" required/><input name="p" type="number" step="any" placeholder="Prot" required/><input name="c" type="number" step="any" placeholder="Carbo" required/><input name="g" type="number" step="any" placeholder="Gord" required/></div><button className="btn full">Adicionar alimento</button></form></>
    :<>
      <div className="card">{e.filter(x=>has(x.name)||has(x.muscle)).map(x=><div className="it" key={x.id}><span className="fn">{x.name}</span><span className="m end">{x.muscle}</span></div>)}</div>
      <form className="card" onSubmit={x=>{const v=form(x);ins('exercises',v)}}><h3>Novo exercício</h3><div className="row"><input name="name" placeholder="Nome" required/><input name="muscle" placeholder="Grupo muscular"/></div><button className="btn full">Adicionar exercício</button></form></>}</>
}
