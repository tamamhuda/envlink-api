module.exports = {
  apps: [
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
      instances: 10, // number of worker processes
      exec_mode: 'fork', // important!
      env: {
        WORKER: 'true',
        WORKER_NAME: 'url-metadata',
      },
      watch: false,
    },
  ],
};
