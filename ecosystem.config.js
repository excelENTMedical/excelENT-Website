module.exports = {
  apps: [
    {
      name: 'excelent-site',
      script: 'npm',
      args: 'start',
      cwd: '/opt/bitnami/excelent-site',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      // Time-based social notifications: 60s poll for review-window + 24h
      // approval-reminder emails. Mirrors the manually-started social-scheduler.
      name: 'social-notifications',
      script: 'node',
      args: '--import tsx scripts/social-notifications.mts',
      cwd: '/opt/bitnami/excelent-site',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
