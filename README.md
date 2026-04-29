# 🥬 HortiFresh — Sistema de Gestão para Distribuidora

Sistema SaaS moderno para gestão completa de distribuidoras de hortaliças e verduras.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** (design system próprio)
- **Prisma ORM 7** + **PostgreSQL**
- **Recharts** (gráficos)
- **Radix UI** (primitivos acessíveis)

## Funcionalidades

| Módulo | Descrição |
|---|---|
| Dashboard | KPIs, gráficos de faturamento e perdas |
| Estoque | Cadastro de produtos, controle por lote, FIFO |
| Pedidos | Criação com baixa automática de estoque |
| Clientes | Cadastro e gestão de clientes |
| Perdas | Registro de desperdícios com análise por motivo |
| Relatórios | Gráficos de vendas, produtos mais vendidos |

## Configuração Local

### 1. Pré-requisitos
- Node.js 20+
- PostgreSQL 15+

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar banco de dados
Edite o `.env`:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/hortifresh?schema=public"
```

E atualize o `prisma.config.ts` com a mesma URL.

### 4. Migrar o banco
```bash
npx prisma migrate dev --name init
```

### 5. Rodar em desenvolvimento
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000)

## Deploy em VPS

### Instalação
```bash
# Node.js via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20 && nvm use 20

# PostgreSQL
sudo apt install postgresql postgresql-contrib -y
sudo -u postgres createuser --superuser hortifresh
sudo -u postgres createdb hortifresh

# PM2
npm install -g pm2
```

### Build e Deploy
```bash
git clone <repo> && cd hortifresh
npm install
npx prisma migrate deploy
npm run build
pm2 start npm --name "hortifresh" -- start
pm2 save && pm2 startup
```

## Arquitetura

```
src/
├── app/
│   ├── api/               # API Routes (produtos, pedidos, clientes, perdas, estoque)
│   ├── estoque/           # Página de estoque com lotes
│   ├── pedidos/           # Criação e gestão de pedidos
│   ├── clientes/          # Cadastro de clientes
│   ├── perdas/            # Registro e análise de perdas
│   ├── relatorios/        # Relatórios e gráficos
│   └── page.tsx           # Dashboard
├── components/
│   ├── layout/            # Sidebar, Topbar
│   └── ui/                # Badge, Button, Card, Dialog, Input, Table
├── lib/
│   ├── prisma.ts          # Singleton do PrismaClient
│   ├── utils.ts           # Formatadores, cálculo de desconto, FIFO helpers
│   └── validations.ts     # Schemas Zod
├── services/              # Regras de negócio (estoque, pedido, perda, dashboard)
└── types/                 # TypeScript types
prisma/
└── schema.prisma          # Modelos: Produto, Lote, Cliente, Pedido, Perda, Movimentacao
```

## Regras de Negócio

- **FIFO**: lotes mais antigos são consumidos primeiro nos pedidos
- **Desconto automático por validade**: 3d → 10%, 2d → 25%, 1d → 40%
- **Alertas**: estoque abaixo do mínimo + validade ≤ 3 dias
- **Cancelamento de pedido**: restaura automaticamente o estoque dos lotes


```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
