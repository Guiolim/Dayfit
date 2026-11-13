import {useEffect,useState} from 'react'
import {sb} from '../supabase'
import {Icon,initials} from '../ui'
import Biblioteca from './Biblioteca'
export default function Admin({tab}){
  const [u,setU]=useState([]),[q,setQ]=useState('')
  const load=()=>sb.from('profiles').select('*').order('created_at').then(r=>setU(r.data||[]))
  useEffect(()=>{load()},[])
  if(tab==='biblioteca')return <Biblioteca/>
  const set=async(id,patch)=>{const r=await sb.from('profiles').update(patch).eq('id',id);if(r.error)alert(r.error.message);load()}
  const pers=u.filter(x=>x.role==='personal'),c=r=>u.filter(x=>x.role===r).length
  return <><h1>Usuários</h1>
    <div className="stats3"><div className="card st"><Icon n="user" s={18}/><b>{c('patient')}</b><span>Pacientes</span></div><div className="card st"><Icon n="dumbbell" s={18}/><b>{c('personal')}</b><span>Personals</span></div><div className="card st"><Icon n="shield" s={18}/><b>{c('admin')}</b><span>Admins</span></div></div>
    <label className="fld" style={{marginBottom:12}}><Icon n="search" s={18}/><input placeholder="Buscar usuário" value={q} onChange={e=>setQ(e.target.value)}/></label>
    {u.filter(x=>(x.name||'').toLowerCase().includes(q.toLowerCase())).map(x=><div className="card" key={x.id}><div className="meal"><div className="av">{initials(x.name)}</div><div className="t"><h3>{x.name}</h3></div></div>
      <div className="row"><select value={x.role} onChange={e=>set(x.id,{role:e.target.value})}><option value="patient">Paciente</option><option value="personal">Personal</option><option value="admin">Admin</option></select>
      {x.role==='patient'&&<select value={x.trainer_id||''} onChange={e=>set(x.id,{trainer_id:e.target.value||null})}><option value="">Sem personal</option>{pers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>}</div></div>)}</>
}
