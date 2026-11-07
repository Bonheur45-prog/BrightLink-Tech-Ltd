/**
 * Runs once when the server starts. On the Node.js server it starts the newsletter check
 * (src/instrumentation-node.ts). The check is written this way so the edge build leaves it out.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation-node');
  }
}
