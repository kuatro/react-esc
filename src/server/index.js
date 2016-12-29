/**
 * Created by tycho on 19/12/2016.
 */
import Koa from 'koa'
import serve from 'koa-static'
import defaultConfig from '../../config'
import webpack from 'webpack'
import generateWebpackConfigClient from '../../build/webpack.config.client'
import Universal from './middleware/universal'
import webpackDevMiddleware from './middleware/webpack-dev'
import webpackHMRMiddleware from './middleware/webpack-hmr'
import fs from 'fs-extra'
import _debug from 'debug'

const debug = _debug('app:server')

export default async(givenConfig) => {
  const config              = defaultConfig(givenConfig)
  const webpackConfigClient = generateWebpackConfigClient(config)

  const app = new Koa()
  let clientInfo

  if (config.env === 'development') {
    const compiler = webpack(webpackConfigClient)

    // Enable webpack-dev and webpack-hot middleware
    const { publicPath } = webpackConfigClient.output

    // Catch the hash of the build in order to use it in the universal middleware
    compiler.plugin('done', stats => {
      // Create client info from the fresh build
      clientInfo = {
        assetsByChunkName: {
          app: `app.${stats.hash}.js`,
          vendor: `vendor.${stats.hash}.js`
        }
      }
    })

    app.use(webpackDevMiddleware(compiler, publicPath, config))
    app.use(webpackHMRMiddleware(compiler))

    // Serve static assets from ~/src/static since Webpack is unaware of
    // these files. This middleware doesn't need to be enabled outside
    // of development since this directory will be copied into ~/dist
    // when the application is compiled.
    app.use(serve(config.utils_paths.src('static')))
  } else {
    // Get assets from client_info.json
    fs.readJSON(config.utils_paths.dist(config.universal.client_info), (err, data) => {
      if (err) {
        clientInfo = {}
        debug('Failed to read client_data!')
        return
      }
      clientInfo = data
    })

    // Serving ~/dist by default. Ideally these files should be served by
    // the web server and not the app server when universal is turned off,
    // but this helps to demo the server in production.
    app.use(serve(config.utils_paths.public()))
  }

  let um = await new Universal.middleware(config)
  app.use(um(() => clientInfo))

  return app
}