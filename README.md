# Guardar Dinheiro 💰 (Neon + Vercel)

Tela com 500 números (1 a 500). Você entra com **e-mail e senha**, clica nos números
que já guardou (pode marcar quantos quiser) e o app mostra **quanto já juntou (R$)** e
**quantos números marcou**. Cada usuário tem o seu próprio progresso, salvo no **Neon**
(Postgres) e acessível de qualquer aparelho.

- Marcar o nº **50** = guardou **R$ 50**. Todos os 500 = **R$ 125.250**.

## Como funciona (full-stack)
- `index.html` — o site (login + app). Chama a API; não tem segredo nenhum dentro dele.
- `api/` — funções serverless (Vercel) que falam com o Neon:
  - `POST /api/signup`, `POST /api/login`, `POST /api/logout`, `GET /api/me`
  - `GET /api/marks` (lista), `POST /api/marks` {n, add} (marca/desmarca), `DELETE /api/marks` (zera)
- `lib/` — conexão com o Neon e sessão por JWT (cookie httpOnly).
- Login: senha criptografada com bcrypt; sessão em cookie seguro (httpOnly, 30 dias).

## Banco (já criado no Neon)
Projeto Neon `fancy-sun-37625571`, tabelas já criadas e seu login semeado:
- `users(id, email, password_hash, created_at)`
- `marks(user_id, n, marked_at)` — progresso por usuário
- Login pronto: **danibrunoo18@gmail.com** / **guardar2026** (troque depois se quiser).

## Publicar na Vercel
1. Suba esta pasta (em vercel.com/new dá pra arrastar a pasta; ou via GitHub). Não precisa
   subir `node_modules` — a Vercel instala as dependências sozinha.
2. **Defina 2 variáveis de ambiente** no projeto (Settings → Environment Variables):
   - `DATABASE_URL` = a sua connection string do Neon (a mesma que você me passou,
     aquela `postgresql://neondb_owner:...@ep-holy-hall-...neon.tech/neondb?sslmode=require`).
   - `JWT_SECRET` = `3dfc867c9edbf0abbea5b5c2f324a6ba9dca6c10a1d3ba2247f18a1463d296a6`
     (uma chave aleatória que gerei; pode trocar por outra, mas use uma só).
3. Faça o **deploy** (ou um redeploy, se você adicionou as variáveis depois do primeiro).
4. Não precisa mexer em "Deployment Protection" — o site é público e o login é o do app.

> A connection string fica **só** nessa variável de ambiente, no servidor. Nunca no HTML.

## Rodar local (opcional)
`npm install` e `vercel dev` (CLI da Vercel), com as mesmas variáveis num arquivo `.env`.

## Pode apagar o Supabase
Este projeto não usa mais nada do Supabase — pode deletar aquele banco sem afetar o app.
