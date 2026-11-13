import {useState} from 'react'
import {sb} from '../supabase'
import {Icon} from '../ui'
export default function Login(){
  const [up,setUp]=useState(false),[role,setRole]=useState('patient'),[msg,setMsg]=useState(''),[ok,setOk]=useState(''),[busy,setBusy]=useState(false)
  const fail=m=>m==='Invalid login credentials'?'E-mail ou senha incorretos.':m==='User already registered'?'Este e-mail já tem conta. Use “Entrar”.':m==='Email not confirmed'?'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).':m
  async function go(e){e.preventDefault();setMsg('');setOk('');setBusy(true)
    const v=Object.fromEntries(new FormData(e.target))
    const r=up?await sb.auth.signUp({email:v.email,password:v.password,options:{data:{name:v.name,role}}}):await sb.auth.signInWithPassword({email:v.email,password:v.password})
    setBusy(false)
    if(r.error)setMsg(fail(r.error.message))
    else if(up&&!r.data.session)setOk('Conta criada! Enviamos um e-mail de confirmação. Confirme e depois entre.')}
  async function forgot(){const email=document.querySelector('input[name=email]').value
    if(!email){setMsg('Digite seu e-mail primeiro.');return}
    const r=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin});setMsg('');setOk(r.error?'':'Enviamos um link para redefinir a senha.');if(r.error)setMsg(r.error.message)}
  return <>
    <div className="hero"><div className="logo big"><Icon n="flame" s={32}/></div><h1>NutriFit</h1><p>Dieta, treino e evolução em um só lugar</p></div>
    <div className="lg"><form className="card" onSubmit={go}>
      <div className="seg"><button type="button" className={!up?'on':''} onClick={()=>{setUp(false);setMsg('');setOk('')}}>Entrar</button><button type="button" className={up?'on':''} onClick={()=>{setUp(true);setMsg('');setOk('')}}>Criar conta</button></div>
      {up&&<><p className="m" style={{marginBottom:8}}>Eu sou…</p>
        <div className="roles"><button type="button" className={role==='patient'?'on':''} onClick={()=>setRole('patient')}><Icon n="user" s={26}/><b>Paciente</b><span>Quero minha dieta e treino</span></button>
        <button type="button" className={role==='personal'?'on':''} onClick={()=>setRole('personal')}><Icon n="dumbbell" s={26}/><b>Personal</b><span>Atendo meus alunos</span></button></div>
        <label className="fld"><Icon n="user" s={18}/><input name="name" placeholder="Seu nome" required/></label></>}
      <label className="fld"><Icon n="mail" s={18}/><input name="email" type="email" placeholder="E-mail" required/></label>
      <label className="fld"><Icon n="lock" s={18}/><input name="password" type="password" placeholder="Senha (mín. 6 caracteres)" minLength={6} required/></label>
      <button className="btn full" disabled={busy}>{busy?'Aguarde…':up?`Criar conta de ${role==='personal'?'personal':'paciente'}`:'Entrar'}</button>
      {!up&&<button type="button" className="link" onClick={forgot}>Esqueci minha senha</button>}
      {msg&&<p className="err">{msg}</p>}{ok&&<p className="okm">{ok}</p>}
    </form></div></>
}
