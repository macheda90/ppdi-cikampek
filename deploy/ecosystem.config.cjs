module.exports = {
  apps: [{
    name: 'ppdi-cikampek',
    script: '.next/standalone/server.js',
    cwd: '/var/www/ppdi-cikampek',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0',
      DATABASE_URL: 'file:./db/custom.db',
    },
    error_file: '/var/log/ppdi/error.log',
    out_file: '/var/log/ppdi/out.log',
    log_file: '/var/log/ppdi/combined.log',
    time: true,
  }],
}
