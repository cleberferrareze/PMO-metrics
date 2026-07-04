// Cria a primeira Empresa e o primeiro usuário Administrador.
// Uso único (bootstrap) — usa a service role key para contornar o RLS,
// já que o cadastro normal de usuário é feito só pelo Administrador dentro do app.
//
// Uso:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/bootstrap-admin.mjs \
//     --empresa "Nome da Empresa" --tipo cliente \
//     --nome "Nome do Admin" --email admin@empresa.com --senha "SenhaForte123"

import { createClient } from "@supabase/supabase-js";

function readArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const empresaNome = readArg("empresa");
const empresaTipo = readArg("tipo") ?? "cliente";
const adminNome = readArg("nome");
const adminEmail = readArg("email");
const adminSenha = readArg("senha");

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.");
  process.exit(1);
}

if (!empresaNome || !adminNome || !adminEmail || !adminSenha) {
  console.error(
    "Uso: node scripts/bootstrap-admin.mjs --empresa <nome> --tipo <cliente|fornecedor> --nome <nome do admin> --email <email> --senha <senha>",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const { data: empresa, error: empresaError } = await supabase
  .from("empresas")
  .insert({ nome: empresaNome, tipo: empresaTipo })
  .select("id")
  .single();

if (empresaError) {
  console.error("Erro ao criar empresa:", empresaError.message);
  process.exit(1);
}

const { data: usuario, error: usuarioError } = await supabase.auth.admin.createUser({
  email: adminEmail,
  password: adminSenha,
  email_confirm: true,
  user_metadata: {
    empresa_id: empresa.id,
    nome: adminNome,
    perfil: "administrador",
  },
});

if (usuarioError) {
  console.error("Erro ao criar usuário administrador:", usuarioError.message);
  process.exit(1);
}

console.log("Empresa criada:", empresa.id);
console.log("Administrador criado:", usuario.user.id, adminEmail);
