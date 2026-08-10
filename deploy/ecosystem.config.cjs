/** PM2 ecosystem for 墨韵 on pas-hy / pas-hk */
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
        // 搜索站长验证（方案 C）；控制台拿到 content 后取消注释并填入
        // GOOGLE_SITE_VERIFICATION: "",
        // BAIDU_SITE_VERIFICATION: "",
        // BING_SITE_VERIFICATION: "",
      },
      max_memory_restart: "512M",
      time: true,
    },
  ],
};
