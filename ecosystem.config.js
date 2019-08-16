module.exports = {
  apps: [{
    name: 'API',
    script: './bin/www',


    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    args: 'one two',
    instances: 2,
    autorestart: true,
    watch: false,
    max_memory_restart: '400M',
    env: {
      NODE_ENV: 'development',
      PORT: 3000

    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }],

  deploy: {
    production: {
      user: 'mkcodergr',
      host: process.env.DEPLOY_HOSTS && process.env.DEPLOY_HOSTS.split(",") || "10.0.0.10",
      ref: 'origin/master',
      repo: 'git@github.com:kounelios13/users-api.git',
      path: '/home/mkcodergr/apps/users-api',
      "pre-deploy-local": "cd $HOME/apps/users-api && mkdir -p source",
      'post-deploy': 'cd $HOME/apps/users-api && echo dir is:$(pwd) && $(npm config get prefix)/bin/pm2 reload $HOME/apps/users-api/ecosystem.config.js --env production --update-env'
    },
    development: {
      user: 'mkcodergr',
      host: '192.168.1.10',
      ref: 'origin/development',
      repo: 'git@github.com:kounelios13/users-api.git',
      path: '/home/mkcodergr/apps/users-api',
      "pre-deploy-local": "cd $HOME/apps/users-api && mkdir -p source",
      'post-deploy': 'cd $HOME/apps/users-api && echo dir is:$(pwd) && $(npm config get prefix)/bin/pm2 reload $HOME/apps/users-api/ecosystem.config.js  --update-env '
    }
  }
};