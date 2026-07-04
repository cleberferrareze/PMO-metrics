export type EmpresaTipo = "cliente" | "fornecedor";
export type PerfilUsuario = "administrador" | "executivo" | "gestor" | "analista";
export type TipoDesenvolvimento = "interno" | "cots" | "externo";
export type ContagemTipo = "desenvolvimento" | "melhoria" | "aplicacao";
export type ContagemModalidade = "simples" | "detalhada";
export type ContagemStatus = "nao_iniciada" | "em_andamento" | "concluida" | "cancelada";
export type FuncaoProjeto = "nova" | "alterada" | "excluida" | "conversao";
export type SubtipoIfpug = "ALI" | "AIE" | "EE" | "SE" | "CE";

export interface Empresa {
  id: string;
  nome: string;
  tipo: EmpresaTipo;
  created_at: string;
}

export interface Usuario {
  id: string;
  empresa_id: string;
  nome: string;
  perfil: PerfilUsuario;
  ativo: boolean;
}

export interface Aplicacao {
  id: string;
  empresa_id: string;
  codigo: string;
  nome: string;
  area_funcional: string | null;
  fronteira_codigo: string | null;
  fronteira_nome: string | null;
  created_at: string;
  updated_at: string;
}

export interface Modulo {
  id: string;
  aplicacao_id: string;
  nome: string;
  tipo_desenvolvimento: TipoDesenvolvimento;
  ambiente_desenvolvimento: string | null;
  linguagem_programacao: string | null;
  observacoes: string | null;
}

export interface Documento {
  id: string;
  aplicacao_id: string;
  codigo: string;
  tipo_documento: string;
  nome: string;
  data_documento: string | null;
  versao: string | null;
  link_acesso: string | null;
}

export interface DocumentoSecao {
  id: string;
  documento_id: string;
  parent_id: string | null;
  nivel: 1 | 2 | 3 | 4;
  numero: string | null;
  nome: string;
  observacao: string | null;
}

export interface Contagem {
  id: string;
  aplicacao_id: string;
  tipo: ContagemTipo;
  modalidade: ContagemModalidade;
  numero_versao: string;
  status: ContagemStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemContagem {
  id: string;
  contagem_id: string;
  modulo_id: string | null;
  id_funcao: string;
  descricao: string | null;
  funcao_projeto: FuncaoProjeto;
  subtipo_ifpug: SubtipoIfpug;
  fp_sfp: number;
  fp_standard: number | null;
}

export const FUNCAO_PROJETO_LABEL: Record<FuncaoProjeto, string> = {
  nova: "Nova",
  alterada: "Alterada",
  excluida: "Excluída",
  conversao: "Conversão",
};

export const SUBTIPO_IFPUG_LABEL: Record<SubtipoIfpug, string> = {
  ALI: "ALI — Arquivo Lógico Interno",
  AIE: "AIE — Arquivo de Interface Externa",
  EE: "EE — Entrada Externa",
  SE: "SE — Saída Externa",
  CE: "CE — Consulta Externa",
};

// Função do Projeto permitida por Tipo de Contagem (seção 7.5 da especificação)
export const FUNCAO_PROJETO_POR_TIPO: Record<ContagemTipo, FuncaoProjeto[]> = {
  desenvolvimento: ["nova", "conversao"],
  melhoria: ["nova", "alterada", "excluida", "conversao"],
  aplicacao: ["nova"],
};

export const TIPO_DESENVOLVIMENTO_LABEL: Record<TipoDesenvolvimento, string> = {
  interno: "Interno",
  cots: "COTS",
  externo: "Externo",
};

export const PERFIL_LABEL: Record<PerfilUsuario, string> = {
  administrador: "Administrador",
  executivo: "Executivo",
  gestor: "Gestor",
  analista: "Analista",
};

export const CONTAGEM_TIPO_LABEL: Record<ContagemTipo, string> = {
  desenvolvimento: "Projeto de Desenvolvimento",
  melhoria: "Projeto de Melhoria",
  aplicacao: "Aplicação (Baseline)",
};

export const NIVEL_SECAO_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: "Seção",
  2: "Sub-seção 1",
  3: "Sub-seção 2",
  4: "Sub-seção 3",
};

export const CONTAGEM_STATUS_LABEL: Record<ContagemStatus, string> = {
  nao_iniciada: "Não Iniciada",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};
