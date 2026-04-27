const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/img': {
        target: 'http://localhost:8888',
        changeOrigin: true
      },
      '/song/': {
        target: 'http://localhost:8888',
        changeOrigin: true
      },
      '/mv': {
        target: 'http://localhost:8888',
        changeOrigin: true
      },
      '/movie': {
        target: 'http://localhost:8888',
        changeOrigin: true
      }
    }
  },
  chainWebpack: config => {
    config.plugin('define').tap(definitions => {
      Object.assign(definitions[0]['process.env'], {
        NODE_HOST: '"http://localhost:8888"',
      });
      return definitions;
    });
  }
})
