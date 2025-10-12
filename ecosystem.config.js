export const apps = [
  {
    name: 'api',
    script: 'dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'local',
      PORT: 3000,
    },
  },
  {
    name: 'url-metadata-worker',
    script: 'dist/main.js',
    instances: 10,
    exec_mode: 'fork',
    env: {
      WORKER: 'true',
      WORKER_NAME: 'url-metadata',
    },
    watch: false,
  },
  {
    name: 'url-analytic-worker',
    script: 'dist/main.js',
    instances: 5,
    exec_mode: 'fork',
    env: {
      WORKER: 'true',
      WORKER_NAME: 'url-analytic',
    },
    watch: false,
  },
];
