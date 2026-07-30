/** PM2 ecosystem for 墨韵 on host `pas` */
module.exports = {
  apps: [
    {
      name: "moyun",
      cwd: "/var/www/moyun",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
      max_memory_restart: "512M",
      time: true,
    },
  ],
};
