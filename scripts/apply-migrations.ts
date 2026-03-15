#!/usr/bin/env npx tsx
// ============================================================================
// SimpliLMS — Migration Runner
// ============================================================================
// Reads all .sql migration files from supabase/migrations/ (sorted by filename),
// skips the seed file (20240101000003_seed_default_tenant.sql), and either:
//
//   - Executes each migration via the Supabase REST API (using the service role key)
//   - Or prints instructions to run them manually in the Supabase SQL Editor
//
// Usage:
//   npx tsx scripts/apply-migrations.ts --url <SUPABASE_URL> --key <SERVICE_ROLE_KEY>
//   npx tsx scripts/apply-migrations.ts --url <SUPABASE_URL> --key <SERVICE_ROLE_KEY> --dry-run
//   npx tsx scripts/apply-migrations.ts --print-only
//
// Options:
//   --url <url>       Supabase project URL (e.g., https://xxx.supabase.co)
//   --key <key>       Supabase service role key
//   --dry-run         Show which migrations would run, without executing
//   --print-only      Print migration file contents for manual paste into SQL Editor
//   --include-seed    Include the seed file (skipped by default)
//
// ============================================================================

import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIGRATIONS_DIR = path.join(__dirname, "..", "supabase", "migrations");
const SEED_FILE = "20240101000003_seed_default_tenant.sql";

// ---------------------------------------------------------------------------
// Argument Parsing
// ---------------------------------------------------------------------------

interface CliArgs {
  url: string;
  key: string;
  dryRun: boolean;
  printOnly: boolean;
  includeSeed: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {
    url: "",
    key: "",
    dryRun: false,
    printOnly: false,
    includeSeed: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--url":
        result.url = args[++i] || "";
        break;
      case "--key":
        result.key = args[++i] || "";
        break;
      case "--dry-run":
        result.dryRun = true;
        break;
      case "--print-only":
        result.printOnly = true;
        break;
      case "--include-seed":
        result.includeSeed = true;
        break;
      case "--help":
      case "-h":
        printUsage();
        process.exit(0);
      default:
        console.error(`  Unknown argument: ${args[i]}`);
        printUsage();
        process.exit(1);
    }
  }

  return result;
}

function printUsage(): void {
  console.log(`
  Usage:
    npx tsx scripts/apply-migrations.ts --url <SUPABASE_URL> --key <SERVICE_ROLE_KEY>
    npx tsx scripts/apply-migrations.ts --print-only

  Options:
    --url <url>       Supabase project URL (e.g., https://xxx.supabase.co)
    --key <key>       Supabase service role key
    --dry-run         Show which migrations would run, without executing
    --print-only      Print migration contents for manual paste into SQL Editor
    --include-seed    Include the default tenant seed file (skipped by default)
    --help, -h        Show this help message
  `);
}

// ---------------------------------------------------------------------------
// Migration Discovery
// ---------------------------------------------------------------------------

interface MigrationFile {
  filename: string;
  filepath: string;
  isSeed: boolean;
}

function discoverMigrations(includeSeed: boolean): MigrationFile[] {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`  Error: Migrations directory not found: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  return files
    .map((filename) => ({
      filename,
      filepath: path.join(MIGRATIONS_DIR, filename),
      isSeed: filename === SEED_FILE,
    }))
    .filter((m) => includeSeed || !m.isSeed);
}

// ---------------------------------------------------------------------------
// Execution via Supabase REST API
// ---------------------------------------------------------------------------

async function executeMigration(
  url: string,
  key: string,
  sql: string,
  filename: string
): Promise<{ success: boolean; error?: string }> {
  // Use the Supabase REST API to execute SQL via the pg_meta endpoint
  // This endpoint is available at /rest/v1/rpc or we can use the SQL endpoint
  const endpoint = `${url}/rest/v1/rpc/`;

  // The most reliable way to execute raw SQL on Supabase is via the
  // Management API or the pg REST proxy. Since we have the service role key,
  // we use the PostgREST RPC endpoint. However, executing arbitrary SQL
  // requires either the pg_net extension or the Supabase Management API.
  //
  // The safest approach for tenant provisioning is to use the Supabase
  // SQL query endpoint available at the project's database URL.
  // We'll use the Supabase /pg/ endpoint (available on newer projects).

  // Approach: Use fetch with the Supabase SQL execution endpoint
  // POST to {url}/rest/v1/rpc with a wrapper function, OR
  // use the direct Postgres connection via the REST API.
  //
  // Since Supabase does not expose a generic "execute raw SQL" REST endpoint
  // to service role keys (only the Dashboard SQL Editor does this), we use
  // a workaround: execute via a temporary RPC function or use the
  // Supabase Management API.
  //
  // For maximum compatibility, we POST the SQL to the Supabase Edge Function
  // or use the project's database connection string directly.
  //
  // PRACTICAL SOLUTION: We use the Supabase Management API endpoint:
  //   POST https://api.supabase.com/v1/projects/{ref}/database/query
  // But this requires a Supabase access token, not a service role key.
  //
  // RECOMMENDED APPROACH: Print instructions for the Supabase SQL Editor
  // and attempt execution via the PostgREST RPC if available.

  try {
    // Try to execute via PostgREST by wrapping in a DO block via RPC
    // This won't work for DDL statements through PostgREST, so we
    // fall back to printing instructions.

    // Attempt: Use the raw SQL execution endpoint (available on some Supabase projects)
    const response = await fetch(`${url}/rest/v1/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ query: sql }),
    });

    if (response.ok) {
      return { success: true };
    }

    // If the generic endpoint doesn't work, this is expected.
    // PostgREST does not support arbitrary SQL execution.
    return {
      success: false,
      error: `PostgREST returned ${response.status}. DDL statements must be run via the Supabase SQL Editor.`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("");
  console.log("================================================================================");
  console.log("  SimpliLMS — Migration Runner");
  console.log("================================================================================");
  console.log("");

  const args = parseArgs();
  const migrations = discoverMigrations(args.includeSeed);

  if (migrations.length === 0) {
    console.log("  No migration files found.");
    process.exit(0);
  }

  console.log(`  Found ${migrations.length} migration file(s):`);
  console.log("");

  for (const m of migrations) {
    const seedTag = m.isSeed ? " (seed)" : "";
    console.log(`    ${m.filename}${seedTag}`);
  }
  console.log("");

  // --print-only mode: just print the SQL content for manual execution
  if (args.printOnly) {
    console.log("  Mode: PRINT ONLY");
    console.log("  Copy and paste each section below into the Supabase SQL Editor.");
    console.log("  Run them in order, one at a time.");
    console.log("");

    for (const m of migrations) {
      const content = fs.readFileSync(m.filepath, "utf-8");
      console.log("================================================================================");
      console.log(`  FILE: ${m.filename}`);
      console.log("================================================================================");
      console.log("");
      console.log(content);
      console.log("");
    }

    console.log("================================================================================");
    console.log("  All migrations printed. Paste each one into the SQL Editor and run.");
    console.log("================================================================================");
    console.log("");
    return;
  }

  // Validate required args for execution mode
  if (!args.url) {
    console.error("  Error: --url is required (or use --print-only).");
    console.error("  Run with --help for usage information.");
    process.exit(1);
  }

  if (!args.key) {
    console.error("  Error: --key is required (or use --print-only).");
    console.error("  Run with --help for usage information.");
    process.exit(1);
  }

  // --dry-run mode: show what would execute
  if (args.dryRun) {
    console.log("  Mode: DRY RUN (no changes will be made)");
    console.log("");
    console.log(`  Target: ${args.url}`);
    console.log("");

    for (const m of migrations) {
      const content = fs.readFileSync(m.filepath, "utf-8");
      const lines = content.split("\n").length;
      const bytes = Buffer.byteLength(content, "utf-8");
      console.log(`    WOULD EXECUTE: ${m.filename} (${lines} lines, ${bytes} bytes)`);
    }

    console.log("");
    console.log("  Dry run complete. No changes were made.");
    console.log("");
    return;
  }

  // Execution mode: attempt to run migrations
  console.log("  Mode: EXECUTE");
  console.log(`  Target: ${args.url}`);
  console.log("");

  let successCount = 0;
  let failCount = 0;
  const failedMigrations: string[] = [];

  for (const m of migrations) {
    const content = fs.readFileSync(m.filepath, "utf-8");
    process.stdout.write(`  Executing ${m.filename}... `);

    const result = await executeMigration(args.url, args.key, content, m.filename);

    if (result.success) {
      console.log("OK");
      successCount++;
    } else {
      console.log("FAILED");
      console.log(`    Reason: ${result.error}`);
      failCount++;
      failedMigrations.push(m.filename);
    }
  }

  console.log("");
  console.log("  Results:");
  console.log(`    Succeeded: ${successCount}`);
  console.log(`    Failed:    ${failCount}`);
  console.log("");

  if (failCount > 0) {
    console.log("================================================================================");
    console.log("  MANUAL STEPS REQUIRED");
    console.log("================================================================================");
    console.log("");
    console.log("  The following migrations could not be executed via the REST API.");
    console.log("  This is expected -- Supabase PostgREST does not support DDL statements.");
    console.log("");
    console.log("  Please run these manually in the Supabase SQL Editor:");
    console.log(`  ${args.url.replace(".supabase.co", "")}/project/default/sql/new`);
    console.log("");

    for (const filename of failedMigrations) {
      console.log(`    1. Open: supabase/migrations/${filename}`);
      console.log("       Copy the entire contents and paste into the SQL Editor.");
      console.log("       Click \"Run\" to execute.");
      console.log("");
    }

    console.log("  Run them in the order listed above.");
    console.log("");
    console.log("  Alternatively, re-run this script with --print-only to get all SQL");
    console.log("  content printed to the terminal for easy copy-paste:");
    console.log("");
    console.log("    npx tsx scripts/apply-migrations.ts --print-only");
    console.log("");
  } else {
    console.log("  All migrations executed successfully.");
    console.log("");
  }
}

main();
