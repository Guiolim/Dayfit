import React from 'react'
import {createRoot} from 'react-dom/client'
import './styles.css'
const root=createRoot(document.getElementById('root'))
if(!import.meta.env.VITE_SUPABASE_URL||!import.meta.env.VITE_SUPABASE_ANON_KEY){
  root.render(<div style={{padding:20}}><h2>Faltam as chaves do Supabase</h2><p>Crie o arquivo .env e reinicie o npm run dev.</p></div>)
}else{
  import('./App').then(m=>root.render(<m.default/>)).catch(e=>root.render(<pre style={{padding:20,whiteSpace:'pre-wrap'}}>{String(e)}</pre>))
}
