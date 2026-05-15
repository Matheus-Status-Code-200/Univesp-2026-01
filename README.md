# 🍦 Mari Açaí - Sistema de Gestão e Pedidos

Este é um sistema completo "Full-Stack" desenvolvido sob medida para a loja **Mari Açaí**. Ele integra um cardápio digital para os clientes, um painel administrativo completo (Dashboard) para o gerenciamento da sorveteria/açaiteria, e uma integração exclusiva voltada para Internet das Coisas (IoT) usando **ESP32** para sinalização de pedidos.

## ✨ Funcionalidades

### 📱 Para o Cliente (Vitrine)
* **Cardápio Digital Dinâmico**: Visualização de produtos por categoria (Açaí ou Sorvetes).
* **Detalhes do Produto**: Visualização em tela cheia dos ingredientes e preços formatados dinamicamente.
* **Carrinho de Compras**: Adição de itens, controle de quantidades e cálculo de valor total sem erros de formatação.
* **Envio de Pedidos**: O cliente pode finalizar o pedido diretamente pelo site.

### 🔐 Para a Administração (Painel)
* **Controle de Acesso**: Protegido por autenticação de e-mail e senha.
* **Gestão de Produtos (Cardápio)**: 
  * Criar, editar e excluir itens.
  * Fazer upload e gerenciar imagens (via Supabase Storage integrado com S3).
  * Controle de formatação inteligente de preços.
* **Gestão de Pedidos (Cozinha/Balcão)**:
  * Grade em tempo real dos pedidos (Pendente, Pronto, Entregue).
* **Integração IoT (Hardware)**:
  * API para microcontroladores (como o **ESP32**) lerem o status e acenderem LEDs ou tocarem alarmes quando um pedido é marcado como "Pronto" na cozinha.

## 🛠 Tecnologias Utilizadas

* **Frontend**: React.js 19, Vite, Tailwind CSS, Framer Motion (para animações suaves) e Lucide React (ícones).
* **Backend**: Node.js, Express e WebSockets para eventos em tempo real locais.
* **Banco de Dados & Autenticação**: Supabase (PostgreSQL, Auth) e Storage S3 API para as imagens. Há também um banco SQLite (`orders.db`) atuando em segundo plano.

## 🚀 Como Executar o Projeto Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto contendo as chaves do seu Supabase:
   ```env
   # Credenciais do Supabase
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

   # Configurações do Storage (Para upload de Imagens via S3 API)
   S3_ACCESS_KEY_ID=sua_access_key
   S3_SECRET_ACCESS_KEY=sua_secret_key
   S3_ENDPOINT=sua_endpoint_s3
   S3_REGION=sa-east-1
   S3_BUCKET_NAME=imagens
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 🗄️ Configuração do Banco de Dados (Supabase)

Caso esteja configurando a base de dados do zero, você precisará aplicar as regras de segurança (RLS - Row Level Security) via **SQL Editor** no painel do Supabase.

<details>
<summary><b>Clique aqui para ver os Scripts SQL necessários</b></summary>

```sql
-- 1. TABELA DE PRODUTOS
alter table public.products enable row level security;
create policy "Produtos visíveis para todos" on public.products for select using (true);
create policy "Permitir inserção de produtos admin" on public.products for insert with check (true);
create policy "Permitir atualização de produtos admin" on public.products for update using (true);
create policy "Permitir exclusão de produtos admin" on public.products for delete using (true);

-- 2. TABELA DE PEDIDOS
alter table public.orders enable row level security;
create policy "Permitir leitura de pedidos" on public.orders for select using (true);
create policy "Permitir inserção de pedidos (Clientes)" on public.orders for insert with check (true);
create policy "Permitir tudo para admin (Atualização)" on public.orders for update using (true);
create policy "Permitir exclusão (Admin)" on public.orders for delete using (true);

-- 3. BUCKET DE IMAGENS
insert into storage.buckets (id, name, public) values ('imagens', 'imagens', true) on conflict do nothing;
create policy "Ver imagens publicamente" on storage.objects for select using ( bucket_id = 'imagens' );
create policy "Fazer upload de imagens" on storage.objects for insert with check ( bucket_id = 'imagens' );
```
</details>

## 📡 Integração com ESP32

O Backend diponibiliza rotas simples e diretas para integrar o hardware da loja:
* `GET /api/esp32/led`: Retorna `"1"` se o LED/sirene deve estar ligado (pedido recém marcado como pronto) ou `"0"` se deve estar desligado.
* O sistema envia um sinal de ativação para a placa quando o atendente clica em *"Marcar como Pronto"*.

---
