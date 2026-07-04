# metricX — Especificação de Requisitos e Arquitetura

> Documento consolidado a partir do levantamento de requisitos. Serve como referência para o desenvolvimento nas fases seguintes com Claude Code + Supabase + Vercel + GitHub.

---

## 1. Visão Geral

**Problema:** gestores de TI têm falta de visibilidade, governança e previsibilidade nas estimativas de software. Hoje esse controle é feito em planilhas.

**Solução:** plataforma de gestão de métricas de software (contagem de pontos de função, padrão IFPUG), com fluxo de governança entre empresa cliente e empresa fornecedora, dashboards de indicadores e histórico auditável de todas as contagens e revisões.

**Referência de mercado:** Quanter, da empresa LedaMC (Espanha).

**Identidade visual de referência:** [metricX](https://cleberferrareze.lovable.app/) — fundo azul-escuro, texto branco, toques discretos de dourado.

**Uso:** exclusivamente desktop/laptop (sem necessidade de responsividade mobile/tablet).

---

## 2. Perfis de Usuário

Um único conjunto de papéis, reaproveitado tanto do lado do Cliente quanto do Fornecedor:

| Perfil | Visão | Responsabilidades |
|---|---|---|
| **Administrador** | Configuração | Configura parâmetros do sistema: SLAs por etapa, nº de rodadas de revisão, parâmetros gerais, e **cadastro de usuários** (centralizado — não há auto-cadastro aberto) |
| **Executivo** | Estratégica | Visualiza dashboards executivos |
| **Gestor** | Tática | Visualiza dashboards + esforço/contagem; solicita contagem (lado Cliente) e recebe/aciona analista (lado Fornecedor) |
| **Analista** | Operacional | Realiza a contagem (lado Fornecedor) ou revisa a contagem (lado Cliente/consultoria independente) |

Cada usuário pertence a uma Empresa (Cliente ou Fornecedor) e tem um dos 4 perfis acima dentro dela.

---

## 3. Modelo de Dados e Hierarquia

```
Empresa (Cliente ou Fornecedor)
 └── Portfólio
      ├── Programa (pode conter vários Projetos)
      └── Projeto (pode pertencer a 0, 1 ou vários Programas, sempre dentro do mesmo Portfólio)
           └── Aplicação (gerada a partir de um Projeto de Desenvolvimento Novo)
                ├── Contagem do Projeto de Desenvolvimento Novo
                ├── Contagem de Baseline / Aplicação (ocorre depois, na conclusão do Projeto de Desenvolvimento Novo)
                └── Projeto(s) de Melhoria → gera Contagem de Melhoria → sempre atualiza o Baseline da Aplicação
```

**Regras de relacionamento entre empresas:**
- Um Cliente (Empresa A) pode contratar vários Fornecedores (Empresas B).
- Um Fornecedor pode atender vários Clientes diferentes simultaneamente — **mas nunca mais de um Cliente no mesmo Projeto ou Programa**.
- Um Programa/Projeto pertence sempre a um único Cliente.

**Tipos de Contagem** (conforme protótipo):
- Aplicação (Baseline)
- Projeto de Desenvolvimento – Contagem Inicial
- Projeto de Desenvolvimento – Contagem Final
- Projeto de Melhoria – Contagem Inicial
- Projeto de Melhoria – Contagem Final

**Modalidades de Contagem:**
- Todo item da contagem já nasce com um subtipo IFPUG selecionado (ALI/AIE, EE/SE/CE) e recebe automaticamente um **FP SFP** — valor fixo por categoria (Função de Dados = 7,0 / Função de Transação = 4,6), independente da complexidade real.
- Opcionalmente, o analista pode "detalhar" qualquer item (via drill-down, seção 7.5.1) para calcular o **FP Standard** — o valor real do IFPUG, obtido a partir da complexidade (baixa/média/alta), calculada pelos DERs e FTRs efetivamente associados ao item.
- **Simples** (definida na Solicitação de Contagem): o detalhamento (FP Standard) é opcional, item a item — a contagem pode ser finalizada só com os valores de FP SFP.
- **Detalhada**: o detalhamento de **todos** os itens é obrigatório antes de finalizar a contagem — todo item precisa ter seu FP Standard calculado.

A tela de "Realizar Contagem" e o drill-down de "Detalhes da Contagem" (7.5.1) são os mesmos nos dois casos — a diferença entre as modalidades está apenas na obrigatoriedade do detalhamento, não em telas diferentes.

**Estrutura IFPUG do detalhamento (FP Standard):**
- **Funções de Dados** (ALI / AIE): nome, tipo, sistema que mantém e/ou referencia, RLRs, DERs, complexidade (baixa/média/alta), pontos de função
- **Funções de Transação** (EE / SE / CE): nome, tipo, FTRs, DERs, complexidade, pontos de função
- **Rastreabilidade**: cada função linka a Documento(s), Item(s) e Comentários de origem
- **Resumo**: totais por tipo de função e complexidade, total geral de pontos de função

**Atualização do Baseline da Aplicação:** ao concluir uma Contagem Final — de Desenvolvimento ou de Melhoria — o sistema oferece a ação **Atualizar Aplicação**, que recalcula o tamanho (PF) do Baseline (fórmulas detalhadas na seção 7.5).

---

## 4. Fluxo de Processo (Governança Cliente ↔ Fornecedor)

1. **Empresa A** (Gestor) solicita uma contagem, enviando o escopo.
2. **Empresa B** (Gestor) recebe a solicitação e aciona um Analista da B.
3. **Analista B** realiza a contagem (via wizard de tela ou upload de planilha). Ao concluir, gera um **Relatório da Contagem**, com comentários específicos por item ou comentários gerais aplicáveis a vários itens.
4. **Analista B** retorna a contagem completa para o Cliente revisar — o grupo revisor inclui o Analista revisor da A e, opcionalmente, um grupo centralizador que distribui aos analistas.
5. **Analista A** revisa a contagem, item a item:
   - **Aprova** (resposta simples, sem comentários), ou
   - **Contesta**, incluindo comentários específicos por item de divergência.
6. Se contestada, o Analista B corrige e reenvia — o ciclo pode se repetir **N vezes** (hoje ~3, mas configurável pelo Administrador).
7. Todo o histórico de rodadas, comentários e alterações item a item fica registrado para consulta, contestação futura e comparação (contagem original x contagem revisada).

**SLA:** prazo (em dias) configurável por etapa (resposta à solicitação, revisão, correção), variando conforme o tamanho da contagem. O sistema controla e alerta sobre atrasos.

**Notificações:** apenas in-app (sino/central de alertas consultável após login). Sem e-mail transacional no momento.

---

## 5. Dashboard — Indicadores

- Pontos de função por período
- Pontos de função por projeto
- Pontos de função por aplicação
- Pontos de função novos, alterados, removidos e de conversão, por aplicação e por projeto
- Crescimento do tamanho funcional entre contagem inicial e contagem final (em total de pontos de função e em percentual)
- Prazo médio de cada etapa, em dias trabalhados (SLA cumprido x estourado)
- Quantidade de contagens por status (aguardando, em contagem, em revisão, aprovada)
- Produtividade por analista
- Comparação de PF entre contagem original e contagem revisada (em pontos de função e em percentual)
- Top 10 funcionalidades com maior número de pontos de função alterados
- Pontos de função Entregues x Não Entregues, por Sprint e por Release (usando os metadados #Tag1/#Tag2 de cada item da contagem)

---

## 6. Funcionalidades Essenciais (MVP funcional)

- Upload de planilha de contagem de pontos de função (estrutura ALI/AIE/EE/SE/CE, baseada no protótipo — a validar)
- CRUD completo dos dados importados (criar, alterar, excluir, consultar, listar)
- Dashboard com os indicadores acima

---

## 7. Telas do Fluxo de Contagem e Governança (detalhamento)

Levantado a partir de mockups de referência do processo real de contagem.

### 7.1 Acessar a Aplicação (Login)
- Campos: Usuário, Senha. Link "Esqueceu a senha?".
- O protótipo de referência mostra um botão "Novo Usuário / Cadastrar" — **não será usado**: o cadastro de usuário é centralizado, feito exclusivamente pelo Administrador (ver seção 2).

### 7.2 Cadastrar Aplicação
- Código e Nome da Aplicação; Área Funcional ou Departamento; Código e Nome da Fronteira da Aplicação.
- Tabela de **Módulos** da aplicação: Nome do Módulo, Tipo de Desenvolvimento (Interno / COTS / Externo), Principais Tecnologias (ex: Ambiente de Desenvolvimento + Linguagem de Programação), Observações.
- Pré-requisito obrigatório quando o projeto é de Desenvolvimento Novo (cria a Aplicação antes de iniciar a contagem).
- Esses dados (Área Funcional, Fronteira, Ambiente de Desenvolvimento, Linguagem de Programação, Proprietário/Tipo de Desenvolvimento) aparecem depois, somente leitura, no cabeçalho das telas de Realizar/Revisar Contagem (7.5).

### 7.3 Cadastrar Documentos
- Vinculado a uma Aplicação: Código do Documento, Tipo de Documento.
- Lista de documentos: Nome, Data, Versão, Link de Acesso.
- Estrutura de rastreabilidade em 3 níveis — Seção / Sub-seção 1 / Sub-seção 2 / Sub-seção 3 — cada uma com Número, Nome e Observação. É a base que os itens da contagem referenciam (campo "Doc. Ref.").

### 7.4 Registrar Solicitação de Contagem
- Dados da solicitação: Nome da Aplicação, Fronteira da Aplicação, Nome da Área solicitante, Solicitante, e-mail, Número da Solicitação, Data da Solicitação, Data de Retorno Esperado, Contatos para Esclarecer Dúvidas (nome + e-mail, múltiplos).
- Decisão: "Documentação Suficiente para Iniciar a Contagem?" (Sim/Não).
- Início da Contagem, Número da contagem (versão), Status da Contagem (Não Iniciada / Em Andamento / Concluída / Cancelada).
- Modalidade da Contagem: Simples ou Detalhada.
- Tipo de Contagem: Desenvolvimento, Melhoria ou Aplicação.
- Revisores (lista de e-mails, múltiplos).
- Nome do Projeto, Fase do Projeto, Metodologia de Desenvolvimento (RUP completa/simplificada, Ágil, Híbrida).
- Propósito da Contagem, Escopo da Contagem, Observações.
- Botão **"Iniciar Contagem"** → abre a tela de Realizar Contagem (7.5).

### 7.5 Realizar Contagem
Existem 3 variantes de tela, conforme o Tipo de Contagem definido na solicitação: **Projeto de Desenvolvimento**, **Projeto de Melhoria** e **Aplicação**. Todas seguem a mesma estrutura de grade, organizada por **Módulo** (herdado do cadastro da Aplicação, seção 7.2).

**Cabeçalho** (somente leitura, herdado da Aplicação): Nome e Sigla da Aplicação, Área Funcional ou Departamento, Fronteira da Aplicação, Ambiente de Desenvolvimento, Linguagem de Programação, Proprietário — além do Número da contagem (versão) e "Selecionar outra versão da contagem".

**Colunas da grade:**

| Coluna | Descrição |
|---|---|
| Doc. Ref. | Ícone que abre a tela **Documento de Referência** (7.6), editável nesta tela |
| ID Função | Identificador da função (ex: CPF.001) |
| Descrição da Função de Dados e Transação | Texto livre |
| Função do Projeto | Nova / Alterada / Excluída / Conversão (as opções variam por tipo de contagem — Desenvolvimento tem Nova+Conversão; Melhoria tem todas; Aplicação/Baseline tem só Nova) |
| Tipo da Função | Subtipo IFPUG (dropdown): EE, SE, CE (Funções de Transação) ou ALI, AIE (Funções de Dados) |
| FP SFP / FP Standard | Ver seção 3 — FP Standard só aparece após o detalhamento (7.5.1) |
| Autor | Indicador por item: ✔ + ícone de edição (já tem comentário do Autor) ou ➕ (ainda sem comentário) — abre **Comentário (Autor)** (7.7) |
| #Tag1 / #Tag2 | Ex: Release, Sprint — metadados usados também no dashboard de PF Entregues x Não Entregues |
| Revisor | Mesmo padrão do indicador Autor, mas somente leitura nesta tela (mostra se o Revisor já comentou aquele item) |

Cada linha também tem uma opção de menu (⋯) ou duplo clique para abrir o drill-down **Detalhes da Contagem** (7.5.1) daquele item específico.

Uma tabela **"Resultado da Contagem Simples / Dados Padrão do IFPUG"** resume Quantidade e PF por Tipo de Função x Função do Projeto, com linha de Total.

**Ações (lado Autor/Fornecedor):** Incluir, Alterar, Excluir, Gerar Relatório (gera o Relatório da Contagem citado na seção 4), Atualizar Aplicação, e **Enviar Revisão** — dispara o envio ao grupo revisor (passo 4 do fluxo da seção 4).

**Fórmulas de Atualização do Baseline (botão "Atualizar Aplicação"):**
- Após um **Projeto de Desenvolvimento**: `ASFP = ADD` — o tamanho do baseline é a soma dos PF das funções marcadas como "Nova" (excluindo as de Conversão).
- Após um **Projeto de Melhoria**: `ASFPA = ASFPB + ADD − DEL` — novo baseline = baseline anterior + PF adicionados − PF excluídos (excluindo também aqui as funções de Conversão da soma).
- A tela de contagem tipo **Aplicação** (baseline direto) não tem botão "Atualizar Aplicação", pois ela já representa o próprio baseline.

Cada contagem tem um **Número de versão** (ex: `2024.02.01.001-v0.1`) com um seletor "Selecionar outra versão da contagem" — suporta o histórico completo de rodadas exigido na seção 4.

### 7.5.1 Detalhes da Contagem (drill-down IFPUG completo)
Aberta a partir de uma linha da grade de Realizar Contagem (menu ⋯ ou duplo clique), para calcular o **FP Standard** daquele item:

- **Cabeçalho**: repete Descrição, Função do Projeto, Tipo da Função (subtipo) e FP SFP (como referência); mostra o grupo **FP Standard** com contagem de DER, contagem de FTR/RET, Complexidade e PF Standard — todos calculados a partir das seções abaixo.
- **Arquivo Lógico**: campo de busca/seleção do(s) Arquivo(s) Lógico(s) (ALI/AIE) referenciado(s) pela função. Uma tabela lista Entidade de Dados e Dado Elementar/Tipo de Dado de cada arquivo, com checkboxes **Atualizar** e **Referenciar** por dado elementar (define se a função mantém ou apenas consulta aquele dado), opção "Marcar todos", e totais automáticos (Arquivos Lógicos, Entidades, Dados Elementares).
- **Adicionar DER não armazenados em arquivo lógico**: permite incluir Dados Elementares adicionais que não pertencem a nenhum Arquivo Lógico cadastrado (ex: dados de controle como "Ação", "Mensagem"), também com Atualizar/Referenciar.
- Botão **Salvar**: recalcula a Complexidade e o PF Standard do item, a partir dos totais de DER (dados elementares) e FTR (arquivos referenciados), seguindo a tabela padrão de complexidade do IFPUG.

### 7.5.2 Revisar Contagem (tela espelho, lado Cliente)
Mesma grade da seção 7.5 (mesmas colunas, mesmos dados), mas do ponto de vista do Revisor:

- **Doc. Ref.** abre a tela **Documento de Referência** (7.6) em modo somente leitura.
- **Autor**: somente leitura (mostra se aquele item já tem comentário do Autor).
- **Revisor**: editável — ✔ + ícone de visualização (já comentado) ou ➕ (pendente) — abre **Comentário (Revisar)** (7.7).
- **Ações (lado Revisor/Cliente):** Salvar, **Enviar Comentários** (retorna as divergências ao Autor — passo 5 "Contesta" do fluxo da seção 4), Gerar Relatório, e **Aprovar** (passo 5 "Aprova" do fluxo da seção 4, sem comentários).

### 7.6 Documento de Referência
- Vincula um item específico da contagem (uma linha da grade) a um ou mais documentos/seções já cadastrados em "Cadastrar Documentos" (7.3) — suporta múltiplas referências por item (ex: "IU 1.2.3, Figura 19, Tabela 10").
- Editável na tela Realizar Contagem (Autor); somente leitura na tela Revisar Contagem (Revisor).

### 7.7 Comentário (Autor) / Comentário (Revisar)
- Organizada por **Ciclo de Revisão** (1º, 2º, 3º...), com data de envio de cada ciclo.
- Cada comentário do Revisor referencia um campo específico do item (ex: Documento de Referência, Descrição FD/FT, Tipo da Função), com editor de texto rico (permite imagem, print de tela, arquivos, links).
- Logo abaixo, o Autor (Analista B) responde ao comentário.
- Indicador visual: **X vermelho** = pendente, **check verde** = resolvido.
- Cabeçalho mostra "Aprovada" com a data, quando todos os itens do ciclo estiverem resolvidos.
- Permite incluir novos comentários a qualquer momento dentro do ciclo ativo.

---

## 8. Base Visual e Diretrizes de Design

O arquivo `Proto_tipo_Animado.pptx` (72 telas, protótipo SGME) complementa a seção 7 com a estrutura visual de telas mais genéricas:

- Login e Menus por perfil
- Wizard Criar/Alterar/Excluir/Consultar Métrica: Identificação → Responsável → Sistema → Tipo de Contagem → Insumos → Funções de Dados → Funções de Transação → Resumo (referência para a modalidade **Detalhada** — a confirmar na seção 7.5)
- Telas de Funções de Dados e Funções de Transação (RLR/DER/FTR, complexidade, PF)
- Associar/Desassociar métrica a uma Solicitação de Serviço
- Relatórios (placeholder no protótipo, detalhado agora na seção 7.5 como "Gerar Relatório" por contagem)
- Parâmetros (tela genérica de CRUD de parâmetros do sistema)

**Diretriz visual:** manter exatamente o mesmo layout e disposição de informações/tabelas dos protótipos de referência, trocando o cinza por fundo azul-escuro, texto branco, com dourado discreto em detalhes de destaque (paleta do site metricX).

---

## 9. Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js (React) + Tailwind |
| Backend / Banco | Supabase (Postgres + Auth + Storage + Row Level Security para isolamento multi-tenant) |
| Hospedagem | Vercel (domínio gratuito da Vercel por enquanto) |
| Versionamento | GitHub |
| Desenvolvimento | Claude Code |
| Autenticação | Usuário/senha, cadastro centralizado pelo Administrador |
| Notificações | In-app apenas (sem e-mail transacional) |

Contas Supabase, Vercel e GitHub já criadas pelo usuário.

---

## 10. Faseamento

### Fase 1 — Fundação
- Autenticação (usuário/senha) e perfis (Administrador, Executivo, Gestor, Analista)
- Cadastro de Empresas e Usuários (estrutura básica, sem fluxo multi-tenant completo)
- Cadastrar Aplicação e Cadastrar Documentos
- Realizar Contagem — grade com FP SFP automático (Desenvolvimento, Melhoria, Aplicação)
- Upload de planilha de contagem
- CRUD completo de métricas (criar, alterar, excluir, consultar, listar)
- Tela genérica de Parâmetros configuráveis
- Dashboard básico (PF por período/projeto)

### Fase 2 — Governança Multi-Tenant
- Hierarquia completa: Portfólio → Programa → Projeto → Aplicação
- Relacionamento Cliente ↔ Fornecedor (N:N com as regras de exclusividade por projeto/programa)
- Registrar Solicitação de Contagem (fluxo completo, incluindo modalidade Simples/Detalhada)
- Detalhes da Contagem — drill-down IFPUG completo (FP Standard), com obrigatoriedade quando a solicitação for do tipo Detalhada
- Associar Documentos a Contagem (Documento de Referência)
- Comentário (Autor) / Comentário (Revisar), com N rodadas configuráveis
- Tela espelho "Revisar Contagem" com ações Enviar Comentários / Aprovar
- Comentários por item e histórico completo de versões
- SLA configurável por etapa + alertas de atraso
- Central de notificações in-app
- Dashboard completo (todos os indicadores, incluindo SLA e produtividade)

---

## 11. Próximos Passos

1. Definir o schema inicial do banco (Postgres/Supabase) para a Fase 1
2. Estruturar o projeto Next.js e conectar Supabase + Vercel + GitHub
3. Construir as telas de Cadastro e Realizar Contagem (Simples) da Fase 1
4. Validar layout de planilha de importação com o usuário
5. Construir dashboard básico
6. Iniciar Fase 2 após validação da Fase 1
