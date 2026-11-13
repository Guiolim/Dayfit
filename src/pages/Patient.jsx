import {useEffect,useState} from 'react'
import {sb} from '../supabase'
import {today,tot,loadPlans,Icon,WeekStrip,Summary,DietView,WorkoutView} from '../ui'
import Evolucao from './Evolucao'
function Hoje({me}){
  const [d,setD]=useState(null),[ck,setCk]=useState(new Set()),[day,setDay]=useState(today())
  const loadChecks=async()=>{const r=await sb.from('meal_checks').select('meal').eq('patient_id',me.id).eq('day',day);setCk(new Set((r.data||[]).map(x=>x.meal)))}
  useEffect(()=>{loadPlans(me.id).then(([a])=>setD(a||false))},[])
  useEffect(()=>{loadChecks()},[day])
  const toggle=async m=>{ck.has(m)?await sb.from('meal_checks').delete().eq('patient_id',me.id).eq('meal',m).eq('day',day):await sb.from('meal_checks').insert({patient_id:me.id,meal:m,day});loadChecks()}
  const head=<><h1>Olá, {me.name.split(' ')[0]} 👋</h1><p className="m cap">{new Date(day+'T12:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</p><WeekStrip day={day} onPick={setDay}/></>
  if(d===null)return head
  if(!d)return <>{head}<div className="card empty"><Icon n="utensils" s={28}/><h3>Sem dieta ainda</h3><p className="m">Seu personal ainda não enviou um plano.</p></div></>
  const all=d.diet_items,eat=all.filter(i=>ck.has(i.meal)),goal=d.kcal_goal||Math.round(tot(all,'kcal'))
  return <>{head}
    <Summary eaten={tot(eat,'kcal')} goal={goal} macros={[
      {n:'Proteína',v:tot(eat,'protein'),max:Math.round(tot(all,'protein')),color:'var(--p)'},
      {n:'Carboidrato',v:tot(eat,'carbs'),max:Math.round(tot(all,'carbs')),color:'var(--c)'},
      {n:'Gordura',v:tot(eat,'fat'),max:Math.round(tot(all,'fat')),color:'var(--f)'}]}/>
    <h2>{d.title}</h2>{d.notes&&<p className="m">{d.notes}</p>}
    <p className="m" style={{margin:'0 2px 10px'}}>Toque no ✓ ao concluir cada refeição.</p>
    <DietView d={d} ck={ck} onCk={toggle}/></>
}
function Treino({me}){
  const [w,setW]=useState(null),[done,setDone]=useState(new Set())
  const load=async()=>{const [,b]=await loadPlans(me.id);setW(b||false)
    const r=await sb.from('workout_logs').select('item_id').eq('patient_id',me.id).gte('done_at',new Date(today()+'T00:00:00').toISOString());setDone(new Set((r.data||[]).map(x=>x.item_id)))}
  useEffect(()=>{load()},[])
  const log=async(i,c)=>{if(done.has(i.id))return;await sb.from('workout_logs').insert({item_id:i.id,patient_id:me.id,load:c});load()}
  return <><h1>{w?w.title:'Treino'}</h1><p className="m" style={{marginBottom:12}}>Toque no exercício para informar a carga e concluir.</p>
    {w===null?null:<WorkoutView w={w||undefined} onLog={log} done={done}/>}</>
}
export default function Patient({me,tab}){return tab==='treino'?<Treino me={me}/>:tab==='evolucao'?<><h1>Minha evolução</h1><p className="m" style={{marginBottom:12}}>Você e seu personal veem estes registros.</p><Evolucao patientId={me.id} me={me}/></>:<Hoje me={me}/>}
