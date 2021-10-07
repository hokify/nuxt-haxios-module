const { resolve } = require('path')

module.exports = {
  rootDir: resolve(__dirname, '../..'),
  buildDir: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  render: {
    resourceHints: false
  },
  build: {
    extend (config, ctx) {
      const { isClient } = ctx
      if (isClient) {
        config.module.rules.push({
          test: /node_modules\/https-proxy-agent\//,
          use: 'null-loader'
        })
      }
    }
  },
  modules: [
    { handler: require('../../') }
  ],
  buildModules: ['@nuxt/typescript-build'],
  serverMiddleware: {
    '/api/echo': '~/api/echo',
    '/api/cookie': '~/api/cookie'
  },
  axios: {
    prefix: '/api',
    proxy: true,
    credentials: true,
    debug: true,
    retry: true
  },
  plugins: ['~/plugins/axios']
}
