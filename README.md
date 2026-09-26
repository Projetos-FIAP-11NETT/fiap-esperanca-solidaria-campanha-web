# fiap-esperanca-solidaria-campanha-web

Front-end da plataforma **Esperança Solidária** (MVP "Conexão Solidária", FIAP 11NETT): painel público de
transparência das campanhas, cadastro/login de doadores, doações com recibo e a área do gestor de ONG
para criar, editar e cancelar campanhas.

> O front depende do ambiente completo (API Gateway no LocalStack, APIs no k8s). Para subir tudo do zero,
> siga o README do repositório **`fiap-esperanca-solidaria-infra`** e volte aqui no último passo.

---

## Sumário

- [Stack](#stack)
- [Como o front conversa com o backend](#como-o-front-conversa-com-o-backend)
- [Estrutura](#estrutura)
- [Páginas](#páginas)
- [Autenticação e sessão](#autenticação-e-sessão)
- [Configuração](#configuração)
- [Rodando localmente](#rodando-localmente)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [Pendências](#pendências)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Build | Vite 8 + React 19 + TypeScript |
| Estilo | Tailwind CSS v4 (tokens de tema, modo escuro) |
| Roteamento | React Router 7 |
| Dados | TanStack Query 5 |
| Testes | Vitest |
| Lint | oxlint |
| Fontes | Fraunces (display) + IBM Plex Sans (texto) |

---

## Como o front conversa com o backend

```
                         ┌────────────────────────────────────────────────────────────┐
  gatewayClient.ts ────▶ │ API Gateway (LocalStack :30466)                            │
  (VITE_GATEWAY_BASE_URL)│   /users/api/v1/User/*   → usuario-api                     │
                         │   /api/v1/campanhas*     → campanha-api (leitura pública)  │
                         │   /api/v1/doacoes*       → campanha-api (Doador)           │
                         └────────────────────────────────────────────────────────────┘
  client.ts ───────────▶ campanha-api direto (:30081 no k8s / :5054 local) — CRUD do gestor
  (VITE_API_BASE_URL)
```

| Módulo | Cliente | Chamadas |
|---|---|---|
| `src/api/auth.ts` | gateway | cadastro (`User/Doador`), upload de foto (`User/images`), login, refresh, logout |
| `src/api/campaigns.ts` | gateway | `listPublicCampaigns`, `getCampaignById` |
| `src/api/campaigns.ts` | **direto** | `listCampaigns`, `createCampaign`, `updateCampaign`, `cancelCampaign`, `uploadCampaignImage` |
| `src/api/donations.ts` | gateway | `donate`, `getMyDonations` |

O id da REST API do gateway muda a cada restart do LocalStack; o script `scripts/sync-gateway-env.mjs`
descobre o id atual (procurando a API `local-api-gateway-v1`) e grava `VITE_GATEWAY_BASE_URL` no
`.env.development`. Ele roda sozinho antes do `npm run dev` e nunca derruba o dev server — se o
LocalStack não responder, só avisa.

---

## Estrutura

```
.
├── scripts/sync-gateway-env.mjs   # Descobre o id do API Gateway e grava no .env.development
├── src/
│   ├── api/
│   │   ├── gatewayClient.ts       # fetch para o API Gateway (timeout, mensagens de erro do authorizer)
│   │   ├── client.ts              # fetch direto ao campanha-api + ApiError e regras 401/403
│   │   ├── auth.ts, campaigns.ts, donations.ts   # Funções por domínio
│   │   └── types.ts               # Tipos das respostas das APIs
│   ├── auth/
│   │   ├── AuthContext.tsx        # Sessão, papéis (claim roles do JWT), refresh automático do token
│   │   ├── RequireGestor.tsx      # Guarda das rotas /gestor/*
│   │   └── sessionStorage.ts      # Persistência da sessão no localStorage
│   ├── components/                # Header, Footer, CampaignCard, DonationForm, ProgressBar, StatusBadge, ThemeToggle...
│   ├── lib/                       # cpf.ts (validação), format.ts (moeda/data pt-BR), jwt.ts, password.ts
│   ├── pages/                     # Home, CampaignDetail, DoadorEntrar/Cadastro/Perfil, ManagerHome, ManagerCampaignForm, NotFound
│   ├── App.tsx                    # Rotas
│   └── main.tsx                   # Bootstrap (QueryClient, Router, AuthProvider)
├── .env.example                   # Modelo das variáveis
├── vite.config.ts
└── .oxlintrc.json
```

---

## Páginas

| Rota | Acesso | Descrição |
|---|---|---|
| `/` | público | Painel de transparência: campanhas ativas, busca por título, totais arrecadados |
| `/campanhas/:id` | público | Detalhe da campanha e formulário de doação (exige login de doador) |
| `/entrar` | público | Login único para doador e gestor (`/login` redireciona pra cá) |
| `/cadastro` | público | Cadastro de doador (nome, e-mail, CPF validado, senha, foto opcional) |
| `/perfil` | logado | Dados da conta e "Minhas doações" com status de cada pagamento |
| `/gestor` | GestorONG | Todas as campanhas (qualquer status), com ações de editar/cancelar |
| `/gestor/nova` | GestorONG | Criar campanha, com upload de imagem de capa |
| `/gestor/campanhas/:id/editar` | GestorONG | Editar campanha |
| `*` | — | Página 404 |

---

## Autenticação e sessão

- Login via `POST /users/api/v1/User/Login` (gateway → `usuario-api` → Firebase). A resposta
  (`sessionId`, `idToken`, `refreshToken`, `expiresIn`, `email`) fica no `localStorage`
  (`auth/sessionStorage.ts`).
- Os papéis vêm da claim `roles` do `idToken` decodificado (`lib/jwt.ts`). Quem tem `GestorONG` vê o link
  "Área do gestor"; `RequireGestor` bloqueia `/gestor/*` para os demais.
- O `AuthContext` agenda o **refresh do token** 60 s antes de expirar (`POST .../User/RefreshToken`),
  mantendo a sessão enquanto a aba estiver aberta.
- Chamadas autenticadas enviam `Authorization: Bearer <idToken>`.
- **401** sempre derruba a sessão. **403** é ambíguo porque o authorizer do gateway nega com "explicit
  deny" tanto token vencido quanto papel insuficiente: se o token ainda é válido, a tela mostra "sem
  permissão" em vez de mandar para o login (`isSessionRejected` / `isPermissionDenied` em `client.ts`).
- Logout chama `DELETE .../User/Session/{sessionId}` e limpa o armazenamento local.
- Para promover uma conta a gestor: `PUT /users/api/v1/User/MakeGestorONG` (via gateway, com token de
  gestor). O usuário promovido precisa sair e entrar de novo para o token trazer a nova claim.

---

## Configuração

Copie `.env.example` para `.env.development` (arquivo ignorado pelo git):

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_GATEWAY_BASE_URL` | Base do API Gateway (preenchida pelo `gateway:sync`) | `http://localhost:30466/restapis/<id>/dev/_user_request_` |
| `VITE_API_BASE_URL` | `campanha-api` direto (CRUD do gestor) | `http://localhost:30081` (k8s) ou `http://localhost:5054` (dotnet run) |

Variáveis opcionais do script de sincronização: `GATEWAY_HOST` (padrão `http://localhost:30466`),
`GATEWAY_API_NAME` (padrão `local-api-gateway-v1`) e `GATEWAY_STAGE` (padrão `dev`).

A origem `http://localhost:5173` precisa estar liberada no CORS das APIs chamadas diretamente
(`Cors:AllowedOrigins`).

---

## Rodando localmente

Pré-requisitos: Node.js 20+ e o ambiente da infra no ar (LocalStack com o Terraform aplicado, APIs no k8s
e o `kubectl port-forward` do LocalStack aberto para o authorizer).

```bash
npm install
cp .env.example .env.development   # ajuste VITE_API_BASE_URL se necessário
npm run dev                        # roda o gateway:sync e sobe em http://localhost:5173
```

Se o LocalStack reiniciar com o dev server aberto: reaplique o Terraform da infra, rode
`npm run gateway:sync` e reinicie o `npm run dev` (o Vite só lê o `.env` no start).

---

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Sincroniza o gateway (`predev`) e sobe o Vite |
| `npm run gateway:sync` | Só atualiza `VITE_GATEWAY_BASE_URL` no `.env.development` |
| `npm run build` | Type-check (`tsc -b`) + build de produção em `dist/` |
| `npm run preview` | Serve o build localmente |
| `npm run lint` | oxlint |
| `npm test` | Vitest (`vitest run`) |

---

## Troubleshooting

| Sintoma | Solução |
|---|---|
| "VITE_GATEWAY_BASE_URL não definida" | LocalStack fora do ar ou Terraform não aplicado. Suba-os e rode `npm run gateway:sync`. |
| Tudo retorna 404 / `NoSuchBucket` | O id do gateway mudou. `npm run gateway:sync` e reinicie o dev server. |
| Login ok, mas doar dá "sem permissão" | Conta sem papel `Doador` na claim `roles` (ex.: usuário antigo/seed). Crie uma conta nova pelo `/cadastro`. |
| Área do gestor dá erro de CORS | O `campanha-api` chamado direto precisa liberar `http://localhost:5173` em `Cors:AllowedOrigins`. |
| Chamadas protegidas travam/500 | Port-forward `4566` do LocalStack fechado (o authorizer não consegue rodar). |
| Doação com Boleto fica "Pendente" | O `doacao-work` não tem taxa de aprovação para Boleto (ver pendências). |

---

## Pendências

- O CRUD de campanhas do gestor ainda chama o `campanha-api` direto; as rotas equivalentes
  (`/api/v1/campanhas/gestao`, `POST/PUT /api/v1/campanhas`, `/images`, `/{id}/cancel`) já existem no
  gateway e podem substituir o `client.ts`.
- O formulário de doação oferece **Boleto**, mas o `doacao-work` não tem `Payments:ApprovalRate:Boleto`,
  então essas doações nunca saem de `Pending`.
- Deploy num host estático ainda não configurado.
