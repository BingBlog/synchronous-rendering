/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  
  // 处理SSE预检请求
  router.options('/api/sse', async ctx => {
    ctx.status = 204;
    ctx.set({
      'Access-Control-Allow-Origin': 'https://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    });
  });

  // 处理HTTP Stream预检请求
  router.options('/api/stream', async ctx => {
    ctx.status = 204;
    ctx.set({
      'Access-Control-Allow-Origin': 'https://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    });
  });

  router.get('/', controller.home.index);
  router.get('/api/sse', controller.home.stream);
  router.get('/api/stream', controller.home.httpStream);
}; 