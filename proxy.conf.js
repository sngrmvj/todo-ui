const PROXY_CONFIG = [
    {
    context: ["/topics"],
    target: "http://localhost:8082",
    secure: false,
    logLevel: "error",
    changeOrigin: true,
   }
  ];
  module.exports = PROXY_CONFIG;