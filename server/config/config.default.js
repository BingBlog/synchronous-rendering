module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1234567890';

  // 关闭 CSRF
  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: ['http://localhost:3000'],
  };

  // 配置 CORS
  config.cors = {
    origin: 'http://localhost:3000',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    credentials: true,
    exposeHeaders: ['content-type'],
  };

  // 配置日志
  config.logger = {
    level: 'INFO',
    consoleLevel: 'INFO',
  };

  return config;
}; 