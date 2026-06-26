# MultaAI - Gerador de Recursos de Multas de Trânsito

MultaAI é um sistema web desenvolvido em Next.js para auxiliar motoristas a identificarem inconsistências formais em autos de infração e gerarem recursos administrativos fundamentados de forma automatizada. 

Este projeto foi reestruturado como um MVP (Mínimo Produto Viável) focado em usabilidade e simplicidade, integrando inteligência artificial (Google Gemini) e controle de acessos (Clerk).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend e Backend**: Next.js 16 (App Router + Turbopack)
- **Autenticação**: Clerk
- **IA/OCR**: Google GenAI SDK (Gemini API)
- **Banco de Dados**: Prisma ORM (PostgreSQL)
- **Exportação**: docx (Geração de arquivos Word `.docx`)
- **Estilo**: CSS Vanilla (Tema Claro Simples)

---

## 🚀 Funcionalidades do MVP

### 1. Análise sem Login (Acesso Público)
- Qualquer usuário pode enviar um arquivo de multa (imagem ou PDF) e obter a análise processual de forma gratuita e anônima.
- A minuta do recurso gerada é exibida na tela e fica disponível para download em Word.
- Os dados de usuários não logados não são salvos no banco de dados.

### 2. Painel de Controle e Histórico (Acesso Protegido)
- As rotas `/dashboard` e `/history` são protegidas por autenticação via Clerk.
- Usuários autenticados têm suas defesas e análises salvas no banco de dados automaticamente.
- O Dashboard exibe métricas pessoais agregadas (economia estimada, pontos na carteira salvos, etc.).

### 3. Pré-Configuração Dinâmica de Modelos
- Ao carregar a página inicial, o sistema faz uma requisição silenciosa em segundo plano para `/api/models` e testa a disponibilidade dos modelos do Gemini (`gemini-3-flash-preview`, `gemini-flash-latest` e `gemini-2.5-flash`).
- O sistema escolhe automaticamente o primeiro modelo ativo disponível e o repassa para a API de análise na hora de gerar a defesa, mantendo a performance da rota principal estável e rápida.

### 4. Proteção Ativa Contra Flood (Rate Limiting)
- O sistema conta com limitação de requisições por endereço de IP em memória:
  - **API de Análise (`/api/analyze`)**: Máximo de 1 requisição a cada 2 horas por IP.
  - **API de Modelos (`/api/models`)**: Máximo de 1 requisição a cada 2 horas por IP.
- Usuários que excederem o limite receberão uma resposta de erro HTTP `429 (Muitas requisições)`.

### 5. Estética Simplificada
- Visual em modo claro, limpo, livre de gradientes ou temas escuros de ficção científica, focado na acessibilidade e clareza de dados.

---

## 📁 Estrutura do Projeto

- `app/`: Estrutura de rotas e páginas do Next.js.
  - `app/api/analyze/route.ts`: Endpoint principal de análise de multas com IA.
  - `app/api/models/route.ts`: Endpoint de teste e saúde de modelos.
  - `app/api/history/route.ts` & `app/api/kpis/route.ts`: APIs de histórico e painel do usuário (protegidas).
  - `app/page.tsx`: Interface principal de upload, visualização e download.
  - `app/globals.css`: Folha de estilos central.
- `lib/`: Utilitários compartilhados (Prisma, docx, limitador de taxa).
- `prisma/`: Modelagem do banco de dados relacional.
- `proxy.ts`: Middleware de controle de rotas públicas e autenticação.
- `DOCUMENTO_REQUISITOS.md`: Documento conceitual de requisitos contendo a matriz GUT e diagramas UML do projeto.

---

## ⚙️ Configuração Local

### Pré-requisitos
- Node.js v20+ instalado
- Banco de dados PostgreSQL configurado

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Leopinheiro132/recorredor-de-multa.git
cd recorredor-de-multa
```

2. Instale as dependências:
```bash
npm install
```

3. Duplique o arquivo `.env.example` para `.env` e configure as chaves:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/multaai"
GEMINI_API_KEY="sua_chave_do_google_gemini"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="sua_publishable_key_do_clerk"
CLERK_SECRET_KEY="sua_secret_key_do_clerk"
```

4. Sincronize o banco de dados (Prisma):
```bash
npx prisma db push
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o protótipo em execução.
