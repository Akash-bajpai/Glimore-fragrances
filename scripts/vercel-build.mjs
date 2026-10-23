#!/usr/bin/env node
/*
 * Vercel build: `vercel-build` runs this instead of `build`.
 *
 *  1. prisma generate
 *  2. if a database is attached (DATABASE_URL set):
 *       - prisma migrate deploy   (over the DIRECT/unpooled URL when available)
 *       - seed catalog only if the DB has no products; create admin from env if set
 *     if no database is attached: log and skip (preview builds keep working)
 *  3. next build
 *
 * Never drops or resets data: `migrate deploy` only applies new migrations,
 * and the seed only upserts / creates.
 */
import { spawnSync } from "node:child_process";

function run(cmd, args, env = process.env) {
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { stdio: "inherit", env, shell: process.platform === "win32" });
  if (r.status !== 0) {
    console.error(`\n[vercel-build] "${cmd} ${args.join(" ")}" failed (exit ${r.status}).`);
    process.exit(r.status ?? 1);
  }
}

run("npx", ["prisma", "generate"]);

const pooledUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
// Neon's Vercel integration sets DATABASE_URL (pooled) and DATABASE_URL_UNPOOLED (direct).
// Migrations need a direct connection, so prefer the unpooled one.
const directUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DIRECT_URL ||
  pooledUrl;

if (!pooledUrl) {
  console.warn(
    "\n[vercel-build] DATABASE_URL is not set - skipping database migrations and seed.\n" +
      "[vercel-build] The site will build, but login/signup/orders need a database.\n" +
      "[vercel-build] Fix: Vercel -> Project -> Storage -> connect a Neon Postgres database, then redeploy."
  );
} else {
  const migrateEnv = { ...process.env, DATABASE_URL: directUrl };
  run("npx", ["prisma", "migrate", "deploy"], migrateEnv);
  run("npx", ["tsx", "prisma/seed.ts", "--if-empty"], migrateEnv);
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 16) {
    console.warn("[vercel-build] WARNING: AUTH_SECRET is missing or shorter than 16 characters - login/signup will fail until it is set.");
  }
}

run("npx", ["next", "build"]);
