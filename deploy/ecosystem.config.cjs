// PM2 settings for the website on the VPS. Lives at /var/www/brightlink/ecosystem.config.cjs.
// The running code is /var/www/brightlink/current (a link to the latest release).
module.exports = {
  apps: [
    {
      name: 'brightlink',
      cwd: '/var/www/brightlink/current',
      script: 'server.js',
      exec_mode: 'fork', // one process is plenty for this site and uses the least memory
      instances: 1,
      // --env-file reads the secrets (needs Node 20.6+). The heap limit keeps memory predictable.
      node_args: ['--env-file=/var/www/brightlink/.env', '--max-old-space-size=384'],
      max_memory_restart: '600M', // safety net: restart if it ever grows past this
      env: {
        NODE_ENV: 'production',
        PORT: '3021', // Oak Elite Home uses 3020; change if 3021 is also taken
        HOSTNAME: '127.0.0.1', // only Caddy can reach it
        NEXT_TELEMETRY_DISABLED: '1',
      },
      time: true,
    },
  ],
};
