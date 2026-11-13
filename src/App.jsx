import {useEffect,useState} from 'react'
import {sb} from './supabase'
import {Icon,initials} from './ui'
import Login from './pages/Login'
import Patient from './pages/Patient'
import Trainer from './pages/Trainer'
import Admin from './pages/Admin'
const NAV={patient:[['hoje','home','Hoje'],['treino','dumbbell','Treino'],['evolucao','activity','Evolução']],
  personal:[['pacientes','users','Pacientes'],['biblioteca','utensils','Biblioteca']],
  admin:[['usuarios','shield','Usuários'],['biblioteca','utensils','Biblioteca']]}
const ROLE={patient:'Paciente',personal:'Personal',admin:'Administrador'}
export default function App(){
  const [s,setS]=useState(undefined),[p,setP]=useState(null),[tab,setTab]=useState(null),[miss,setMiss]=useState(false)
  useEffect(()=>{sb.auth.getSession().then(({data})=>setS(data.session))
    const {data:l}=sb.auth.onAuthStateChange((_,x)=>setS(x));return()=>l.subscription.unsubscribe()},[])
  useEffect(()=>{setTab(null);setP(null);setMiss(false);if(!s)return;let off=false
    ;(async()=>{for(let i=0;i<6&&!off;i++){const {data}=await sb.from('profiles').select('*').eq('id',s.user.id).maybeSingle()
      if(data){setP(data);return};await new Promise(r=>setTimeout(r,700))}
      if(!off)setMiss(true)})();return()=>{off=true}},[s])
  if(s===undefined)return null
  if(!s)return <Login/>
  if(miss)return <div className="shell"><div className="card empty" style={{marginTop:40}}><p>Não encontramos seu perfil. Rode o SQL 03_evolucao.sql no Supabase e entre de novo.</p><button className="btn" onClick={()=>sb.auth.signOut()}>Sair</button></div></div>
  if(!p)return <div className="shell"><p className="m" style={{paddingTop:40,textAlign:'center'}}>Carregando…</p></div>
  const V={admin:Admin,personal:Trainer,patient:Patient}[p.role]||Patient,nav=NAV[p.role]||NAV.patient,cur=tab||nav[0][0]
  return <div className="shell">
    <header className="top"><div className="av">{initials(p.name)}</div><div className="who"><small>{ROLE[p.role]}</small><b>{p.name}</b></div>
      <button className="ghost" onClick={()=>sb.auth.signOut()} aria-label="Sair"><Icon n="out" s={18}/></button></header>
    <main><V me={p} tab={cur}/></main>
    <nav className="nav">{nav.map(([k,i,l])=><button key={k} className={cur===k?'on':''} onClick={()=>{setTab(k);scrollTo(0,0)}}><Icon n={i} s={22}/><span>{l}</span></button>)}</nav>
  </div>
}
