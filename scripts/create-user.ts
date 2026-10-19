/*
 * Creates a CMS login, or sets a new password for an existing one.
 *
 *   npm run user:create
 *
 * Asks for email, name and password in the terminal. There is no sign-up page on the website,
 * so this script is the only way to add a user. Running it again with the same email
 * changes that user's password and re-activates the account.
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { hashPassword, passwordProblem } from '../src/lib/auth/password';

try {
  process.loadEnvFile('.env');
} catch {
  // No .env file: rely on variables already set in the shell.
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Answers piped in (e.g. `printf "a@b.rw\nName\npw\npw\n" | npm run user:create`) are read up front;
// typed answers are asked one by one, with the password hidden.
let piped: string[] | undefined;
async function pipedLine(question: string): Promise<string> {
  if (!piped) {
    let text = '';
    for await (const chunk of stdin) text += chunk;
    piped = text.split(/\r?\n/);
  }
  stdout.write(`${question}\n`);
  return piped.shift() ?? '';
}

async function ask(question: string): Promise<string> {
  if (!stdin.isTTY) return pipedLine(question);
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer;
}

/** Reads a line without echoing it (for passwords). */
async function askHidden(question: string): Promise<string> {
  if (!stdin.isTTY) return pipedLine(question);
  stdout.write(question);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');
  return new Promise((resolve) => {
    let value = '';
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off('data', onData);
          stdout.write('\n');
          resolve(value);
          return;
        }
        if (char === '\u0003') process.exit(130); // Ctrl+C
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else value += char;
      }
    };
    stdin.on('data', onData);
  });
}

async function main() {
  const email = (await ask('Email: ')).trim().toLowerCase();
  if (!EMAIL.test(email)) throw new Error('That is not a valid email address.');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    const nameAnswer = (await ask(existing ? `Name [${existing.name}]: ` : 'Name: ')).trim();
    const name = nameAnswer || existing?.name || '';
    if (!name) throw new Error('A name is required.');

    const password = await askHidden('Password: ');
    const problem = passwordProblem(password);
    if (problem) throw new Error(problem);
    if ((await askHidden('Repeat password: ')) !== password) throw new Error('The passwords do not match.');

    const passwordHash = await hashPassword(password);
    await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash, active: true },
      create: { email, name, passwordHash },
    });
    if (existing) {
      await prisma.session.deleteMany({ where: { userId: existing.id } }); // log out everywhere
      console.log(`Updated ${email}: new password set, all their sessions ended.`);
    } else {
      console.log(`Created ${email}. Log in at /admin/login.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
