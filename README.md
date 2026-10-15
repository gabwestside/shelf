# 🎮 Estante — Sua Estante Multimídia Pessoal

Uma estante virtual online com estética de launcher de jogos (prateleira horizontal de capas com foco central), acompanhamento de sequências diárias (*streaks* estilo Duolingo com cálculo de fuso horário `America/Fortaleza`), notas, editor de resenhas com salvamento automático e integrações completas com catálogos externos.

---

## 🚀 Funcionalidades

- **Visual Launcher de Jogos**: Carrossel horizontal responsivo (mobile-first com gestos de *swipe* e navegação por setas do teclado) destacando a obra central com foco ampliado e iluminação ambiente.
- **4 Seções Multimídia com Navegação por Abas**:
  - 📖 **/livros**: "Quero ler", "Lendo", "Lido" (Proporção 2:3)
  - 🎮 **/jogos**: "Quero jogar", "Jogando", "Zerado" (Proporção 3:4)
  - 🎬 **/filmes**: "Quero assistir", "Assistido" (Proporção 2:3)
  - 📺 **/series**: "Quero assistir", "Assistindo", "Concluída" (Proporção 2:3)
- **🔥 Sequência de Dias (Streaks estilo Duolingo)**:
  - Cada categoria possui seu próprio streak com foguinho 🔥.
  - Botão de check-in diário ("Li/Joguei/Assisti hoje") com trava de 1 registro por dia por seção.
  - Fuso horário fixado em `America/Fortaleza` no servidor PostgreSQL para precisão cronológica.
  - Calendário Heatmap visual dos últimos 90 dias com indicação de dias ativos.
  - Efeito comemorativo de confetes e partículas ao pontuar.
- **Busca Externa & Cadastro Manual**:
  - Modal de busca com *debounce* de 400ms consultando Google Books (com fallback para Open Library), RAWG e TMDB em pt-BR.
  - Opção de cadastro manual com capa personalizada.
- **Página de Detalhes & Resenhas**:
  - Informações completas, sinopse, notas (0 a 10), datas de início e término.
  - Editor de resenha pessoal com **salvamento automático (auto-save)** em segundo plano.
  - Alternância de visibilidade (privada por padrão, com opção de tornar pública).
- **Busca Global**: Atalho `⌘K` / `Ctrl+K` para buscar em todas as categorias de qualquer lugar do site.
- **Perfil Público**: Compartilhe suas obras e resenhas públicas através da rota `/u/[username]`.

---

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 16 (App Router, Server Components & Server Actions)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4 com paleta profunda de azul launcher e tema escuro
- **Animações**: Framer Motion + Canvas Confetti
- **Componentes**: Radix UI + Lucide React
- **Banco de Dados & Autenticação**: Supabase (PostgreSQL, Auth com Magic Link & Google, Row Level Security)
- **Provedores de APIs**: Google Books, Open Library, RAWG Video Games Database, The Movie Database (TMDB)

---

## 📦 Como Rodar Localmente

### 1. Clonar e Instalar Dependências

```bash
git clone https://github.com/seu-usuario/books-read.git
cd books-read
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha as variáveis em `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Opcionais (para busca de jogos e filmes/séries)
GOOGLE_BOOKS_API_KEY=
RAWG_API_KEY=
TMDB_API_KEY=
```

### 3. Rodar as Migrações do Banco de Dados

1. Acesse o painel do seu projeto no **[Supabase](https://supabase.com/dashboard)**.
2. Vá em **SQL Editor** > **New Query**.
3. Copie o script consolidado em [`supabase/full_schema.sql`](file:///c:/Users/gabriel.lima/source/repos/books-read/supabase/full_schema.sql) e clique em **Run**.

### 4. Executar o Servidor de Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🔑 Como Obter as Chaves das APIs

| Serviço | Como Obter | Custo |
| :--- | :--- | :--- |
| **Supabase** | Crie uma conta gratuita em [supabase.com](https://supabase.com), crie um novo projeto e pegue as credenciais em `Project Settings > API`. | Gratuito |
| **Google Books** | Opcional (funciona sem chave para limites padrão). Para maiores quotas, ative a *Google Books API* no [Google Cloud Console](https://console.cloud.google.com/). | Gratuito |
| **Open Library** | Não requer nenhuma chave de API. Utilizado como fallback automático. | Gratuito |
| **RAWG (Jogos)** | Acesse [rawg.io/apidocs](https://rawg.io/apidocs), crie uma conta e gere sua API Key pessoal. | Gratuito |
| **TMDB (Filmes & Séries)** | Crie uma conta em [themoviedb.org](https://www.themoviedb.org/), acesse `Configurações > API` e solicite uma chave de desenvolvedor (uso não comercial). | Gratuito |

---

## 🚢 Deploy na Vercel

1. Crie um repositório no seu GitHub e faça o push do código:
   ```bash
   git add .
   git commit -m "feat: estante multimídia completa"
   git push origin main
   ```
2. Acesse a **[Vercel](https://vercel.com)** e importe o repositório.
3. Nas configurações do projeto na Vercel (**Environment Variables**), adicione as mesmas variáveis do `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (coloque a URL final da Vercel, ex: `https://minha-estante.vercel.app`)
   - `RAWG_API_KEY` (se for usar busca de jogos)
   - `TMDB_API_KEY` (se for usar busca de filmes/séries)
4. No painel do **Supabase**:
   - Vá em `Authentication > URL Configuration`.
   - Em **Site URL**, adicione a URL da sua aplicação na Vercel (`https://sua-aplicacao.vercel.app`).
   - Em **Redirect URLs**, adicione `https://sua-aplicacao.vercel.app/auth/callback` e `http://localhost:3000/auth/callback`.
5. Clique em **Deploy** na Vercel.

---

## 📜 Atribuições de Dados

- **The Movie Database (TMDB)**: Este produto usa a API do TMDB, mas não é certificado pelo TMDB.
- **RAWG**: Dados e metadados de jogos providos por RAWG Video Games Database.
- **Google Books & Open Library**: Dados bibliográficos providos por Google Books e Internet Archive Open Library.
