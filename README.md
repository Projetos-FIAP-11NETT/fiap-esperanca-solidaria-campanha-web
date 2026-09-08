# fiap-esperanca-solidaria-campanha-web

Front-end do painel de transparência e da área do gestor do MVP "Conexão Solidária"
(ONG Esperança Solidária) — Hackathon FIAP Pós Tech. Consome o `campanha-api`.

## Stack

| Camada | Tecnologia |
|---|---|
| Build | Vite + React + TypeScript |
| Estilo | Tailwind CSS v4 (tokens de tema com suporte a modo escuro) |
| Roteamento | React Router |
| Dados | TanStack Query |
| Fontes | Fraunces (display) + IBM Plex Sans (texto) |

## Estrutura

```
src/
  api/            client HTTP tipado (client.ts, campaigns.ts, types.ts)
  auth/           AuthContext (sessão local) + RequireGestor (guarda de rota)
  components/     Header, Footer, CampaignCard, StatusBadge, ThemeToggle, etc.
  pages/          Home, CampaignDetail, Login, ManagerHome, ManagerCampaignForm
  lib/format.ts   formatação de moeda/data em pt-BR
```

## Páginas

| Rota | Acesso | Descrição |
|---|---|---|
| `/` | Público | Painel de transparência — campanhas ativas, busca por título |
| `/campanhas/:id` | Público | Detalhe de uma campanha |
| `/login` | Público | Login do gestor (ver nota abaixo) |
| `/gestor` | Gestor | Lista todas as campanhas (qualquer status), criar/editar/cancelar |
| `/gestor/nova` | Gestor | Criar campanha (com upload de imagem de capa) |
| `/gestor/campanhas/:id/editar` | Gestor | Editar campanha |

> **Login do gestor**: o `usuario-api` (emissor do JWT real via Firebase) ainda
> não existe. Em desenvolvimento, `/login` aceita qualquer e-mail e guarda uma
> sessão local (`localStorage`) só pra liberar as telas de gestor — as
> chamadas autenticadas usam o dev bypass que o próprio `campanha-api` expõe
> (`X-Dev-Role`/`X-Dev-User`, ver `AuthConfig.cs`/`DevAuthHandler.cs` no
> backend), nunca disponível fora de `Development`. Nada aqui é autenticação
> de verdade — é um estado provisório documentado, não uma feature escondida.

## Rodando localmente

### Pré-requisitos

- Node 20+
- `campanha-api` rodando (local via `dotnet run` ou container) com CORS
  liberado pra origem deste front e `Auth:DevBypassEnabled=true`
- Pra upload de imagem: LocalStack com S3 disponível, apontado no
  `S3Settings` do `campanha-api`

### Configurar

```bash
cp .env.example .env.development
```

`VITE_API_BASE_URL` aponta pro `campanha-api` (padrão: `http://localhost:5054`).

### Rodar

```bash
npm install
npm run dev
```

### Build de produção

```bash
npm run build
```

## Próximos passos

- Login de verdade assim que o `usuario-api` sair da fase de esqueleto.
- Paginação/filtro na lista de campanhas do painel do gestor.
- Deploy do front num host estático (Vercel/Netlify) — decisão já tomada,
  ainda não configurado neste repo.
