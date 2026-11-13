import {useEffect,useState} from 'react'
import {sb,form} from '../supabase'
import {today,br,Icon,WeightChart} from '../ui'
const ROLE={patient:'Paciente',personal:'Personal',admin:'Admin'}
export default function Evolucao({patientId,me,ask}){
  const [rows,setRows]=useState(null),[err,setErr]=useState('')
  const load=()=>sb.from('evolution').select('*').eq('patient_id',patientId).order('day',{ascending:false}).order('id',{ascending:false}).then(r=>{if(r.error)setErr(r.error.message);setRows(r.data||[])})
  useEffect(()=>{setRows(null);load()},[patientId])
  const add=async e=>{const v=form(e),n=x=>x===''||x==null?null:Number(x)
    if(!v.weight&&!v.waist&&!v.note?.trim()){setErr('Preencha peso, cintura ou uma observação.');return}
    const r=await sb.from('evolution').insert({patient_id:patientId,author_id:me.id,author_role:me.role,day:v.day||today(),weight:n(v.weight),waist:n(v.waist),note:v.note?.trim()||null})
    setErr(r.error?r.error.message:'');load()}
  const del=async id=>{if(!confirm('Excluir este registro?'))return;const r=await sb.from('evolution').delete().eq('id',id);if(r.error)setErr(r.error.message);load()}
  if(!rows)return <p className="m">Carregando…</p>
  const w=[...rows].filter(x=>x.weight!=null).reverse(),last=w[w.length-1],first=w[0]
  const ws=[...rows].filter(x=>x.waist!=null),waist=ws[0]
  return <>
    <div className="stats3">
      <div className="card st"><Icon n="scale" s={18}/><b>{last?last.weight:'–'}</b><span>Peso atual (kg)</span></div>
      <div className="card st"><Icon n="activity" s={18}/><b>{last&&first&&w.length>1?((last.weight-first.weight>=0?'+':'')+(last.weight-first.weight).toFixed(1)):'–'}</b><span>Variação (kg)</span></div>
      <div className="card st"><Icon n="target" s={18}/><b>{waist?waist.waist:'–'}</b><span>Cintura (cm)</span></div></div>
    <WeightChart pts={w}/>
    <form className="card" onSubmit={add}><h3>{ask||'Novo registro de evolução'}</h3>
      <div className="row"><input name="day" type="date" defaultValue={today()}/><input name="weight" type="number" step="0.1" placeholder="Peso (kg)"/><input name="waist" type="number" step="0.1" placeholder="Cintura (cm)"/></div>
      <textarea name="note" rows="2" placeholder={me.role==='patient'?'Como você está se sentindo? Treino, fome, sono…':'Feedback, ajustes e orientações para o paciente'}/>
      <button className="btn full">Salvar registro</button>{err&&<p className="err">{err}</p>}</form>
    <h2>Linha do tempo</h2>
    {!rows.length&&<div className="card empty"><Icon n="msg" s={28}/><p>Nenhum registro ainda.</p></div>}
    {rows.map(x=><div className="card tl" key={x.id}>
      <div className="tlh"><span className={'badge '+x.author_role}>{ROLE[x.author_role]||x.author_role}</span><span className="m">{br(x.day)}</span>
        {x.author_id===me.id&&<button className="x" onClick={()=>del(x.id)} aria-label="Excluir"><Icon n="trash" s={16}/></button>}</div>
      {(x.weight!=null||x.waist!=null)&&<div className="tlm">{x.weight!=null&&<span><b>{x.weight}</b> kg</span>}{x.waist!=null&&<span><b>{x.waist}</b> cm cintura</span>}</div>}
      {x.note&&<p className="note">{x.note}</p>}</div>)}</>
}
