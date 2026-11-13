# NutriFit
App com 3 perfis (paciente, personal, admin): dieta com banco de alimentos e plano de treino. React + Vite + Supabase.

## Rodar
1. Crie um projeto em supabase.com. No **SQL Editor**, cole e execute `supabase/schema.sql`.
2. `cp .env.example .env` e preencha URL e anon key (Project Settings > API).
3. `npm install && npm run dev`
4. Crie sua conta no app e, no SQL Editor, torne-se admin:
   `update profiles set role='admin' where id=(select id from auth.users where email='seu@email.com');`
5. Logado como admin: promova usuários a `personal` e vincule cada paciente a um personal.

## GitHub
`git init && git add . && git commit -m "NutriFit" && git branch -M main && git remote add origin URL_DO_REPO && git push -u origin main`

Deploy: Vercel ou Netlify (build `npm run build`, pasta `dist`, com as 2 variáveis de ambiente). Em Supabase > Auth > URL Configuration, adicione a URL do deploy.

## Segurança
Acesso por RLS (fim do schema): paciente vê só os próprios dados; personal vê e edita só pacientes vinculados; admin vê tudo. Nunca use a service_role key no front-end.
