import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { showPending, markAsApplied, createMigrationFile } from "./migrations";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const SEPARATOR = "─".repeat(60);

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--create") || args.includes("-c")) {
    const idx = args.indexOf("--create") !== -1 ? args.indexOf("--create") + 1 : args.indexOf("-c") + 1;
    const name = args[idx];
    if (!name) {
      console.error("Uso: npm run migrate -- --create <nome_da_migration>");
      process.exit(1);
    }
    const path = createMigrationFile(name);
    console.log(`Migration criada: ${path}`);
    return;
  }

  if (args.includes("--mark")) {
    const idx = args.indexOf("--mark") + 1;
    const filename = args[idx];
    if (!filename) {
      console.error("Uso: npm run migrate -- --mark <arquivo.sql>");
      process.exit(1);
    }
    await markAsApplied(filename);
    console.log(`Migration "${filename}" marcada como aplicada.`);
    return;
  }

  const result = await showPending();

  if (result.needsBootstrap) {
    console.log("🔧 Migrações pendentes\n");
    console.log(
      "⚠ A tabela _migrations ainda não existe no banco.\n" +
        "Para criar, execute o SQL abaixo no Supabase Dashboard:\n" +
        "  https://supabase.com/dashboard/project/uglhjopqcoduncgumuzs/sql/new\n"
    );

    const bootstrapPath = resolve(__dirname, "../../sql/000_bootstrap.sql");
    if (existsSync(bootstrapPath)) {
      console.log(SEPARATOR + "\n");
      console.log(readFileSync(bootstrapPath, "utf-8").trim());
    }

    console.log("\n" + SEPARATOR);
    console.log("\nApós executar o bootstrap, rode novamente: npm run migrate");

    if (result.pending.length > 0) {
      console.log(`\n${result.pending.length} migração(ões) pendente(s) aguardando bootstrap.`);
    }
    return;
  }

  console.log("🔧 Migrações pendentes\n");

  if (result.pending.length === 0) {
    console.log("✓ Nenhuma migration pendente.");
    if (result.applied.length > 0) {
      console.log(`\n${result.applied.length} migração(ões) já aplicada(s):`);
      for (const f of result.applied) console.log(`  • ${f}`);
    }
    return;
  }

  console.log(`${result.pending.length} migração(ões) pendente(s) de aplicação manual.\n`);
  console.log(
    "Para aplicar, execute cada arquivo no SQL Editor do Supabase Dashboard:\n" +
      "  https://supabase.com/dashboard/project/uglhjopqcoduncgumuzs/sql/new\n"
  );

  for (const mig of result.pending) {
    console.log(`\n${SEPARATOR}`);
    console.log(`📄 ${mig.name}`);
    console.log(SEPARATOR);
    console.log(mig.sql.trim());
  }

  console.log(`\n${SEPARATOR}`);
  console.log("\nApós aplicar manualmente, marque como aplicada:");
  console.log("  npm run migrate -- --mark <arquivo.sql>");

  if (result.applied.length > 0) {
    console.log(`\n${result.applied.length} migração(ões) já aplicada(s):`);
    for (const f of result.applied) console.log(`  • ${f}`);
  }
}

main().catch((err) => {
  console.error("\n❌ Erro:", err.message);
  process.exit(1);
});
