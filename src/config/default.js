// @remove-file-on-eject
/* eslint key-spacing:0 spaced-comment:0 */
import path from 'path'
import _debug from 'debug'
import { argv } from 'yargs'
import ip from 'ip'
import clientConfig from './default.client'

const localip = ip.address()
const debug   = _debug('app:esc:config')
debug('Creating configuration for ESC.')

// ========================================================
// Default Configuration
// ========================================================
const config = {
  hasOwn: {
    server: false,
    nginx : false
  },

  env: process.env.NODE_ENV || 'development',

  // ----------------------------------
  // Project Structure
  // ----------------------------------
  path_base : path.resolve(__dirname, '..'),
  dir_src   : 'src',
  dir_dist  : 'dist',
  dir_public: 'dist/public',
  dir_server: 'server',
  dir_test  : 'tests',

  // ----------------------------------
  // Entry points
  // ----------------------------------
  entry_client: 'client.js',
  entry_server: 'server.js',

  // ----------------------------------
  // App mount point config
  // ----------------------------------
  app_mount_point: {
    id   : 'root',
    style: { height: '100%' }
  },

  // ----------------------------------
  // Server Configuration
  // ----------------------------------
  server_host: process.env.HOST || localip,
  server_port: process.env.PORT || 3000,

  universal: {
    output     : 'server.js',
    client_info: 'client_info.json',
  },

  use_compiled_server: false,

  // ----------------------------------
  // Compiler Configuration
  // ----------------------------------
  compiler_css_inline     : true,
  compiler_devtool        : 'source-map',
  compiler_hash_type      : 'hash',
  compiler_fail_on_warning: false,
  compiler_quiet          : false,
  compiler_public_path    : '/',
  compiler_stats          : {
    chunks      : false,
    chunkModules: false,
    colors      : true
  },
  compiler_vendor         : [
    'babel-polyfill',
    'react',
    'react-redux',
    'react-router',
    'redux'
  ],

  // ----------------------------------
  // Test Configuration
  // ----------------------------------
  coverage_reporters: [
    { type: 'text-summary' },
    { type: 'lcov', dir: 'coverage' }
  ],

  // ----------------------------------
  // Server Middleware Configuration
  // ----------------------------------
  server_middlewares: [],

  // ----------------------------------
  // Merge Client Configuration
  // ----------------------------------
  ...clientConfig,

  // ----------------------------------
  // Option for the user to add custom GLOBALS
  // ----------------------------------
  custom_globals: {}
}

// ------------------------------------
// Environment
// ------------------------------------
// N.B.: globals added here must _also_ be added to .eslintrc
config.globals = {
  'process.env' : {
    'NODE_ENV': JSON.stringify(config.env)
  },
  'NODE_ENV'    : config.env,
  '__DEV__'     : config.env === 'development',
  '__PROD__'    : config.env === 'production',
  '__TEST__'    : config.env === 'test',
  '__DEBUG__'   : config.env === 'development' && !argv.no_debug,
  '__COVERAGE__': !argv.watch && config.env === 'test',
  '__BASENAME__': JSON.stringify(process.env.BASENAME || '')
}

export default config
