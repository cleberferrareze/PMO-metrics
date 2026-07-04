-- itens_contagem.modulo_id não tinha ON DELETE definido, o que bloqueava a
-- exclusão em cascata de Aplicação -> Módulo quando havia itens de contagem
-- vinculados ao módulo. modulo_id é nullable (agrupamento opcional), então
-- SET NULL preserva o item da contagem e apenas remove o vínculo.

alter table public.itens_contagem
  drop constraint itens_contagem_modulo_id_fkey,
  add constraint itens_contagem_modulo_id_fkey
    foreign key (modulo_id) references public.modulos (id) on delete set null;
