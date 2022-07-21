/* eslint-disable import/no-commonjs */
const path = require('path')
const { getPlugins } = require('./utils')

const config = {
  projectName: 'duxapp',
  date: '2022-1-1',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: `dist/${process.env.TARO_ENV}`,
  plugins: getPlugins(),
  defineConstants: {
  },
  framework: 'preact',
  copy: {
    patterns: [
    ],
    options: {
    }
  },
  framework: 'react',
  alias: {
    '@/components': path.resolve(__dirname, '..', 'src/components'),
    '@/config': path.resolve(__dirname, '..', 'src/config'),
    '@/redux': path.resolve(__dirname, '..', 'src/redux'),
    '@/static': path.resolve(__dirname, '..', 'src/static'),
    '@/utils': path.resolve(__dirname, '..', 'src/utils')
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {

        }
      },
      url: {
        enable: true,
        config: {
          limit: 1024 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    webpackChain(chain) {
      chain.resolve.plugin('MultiPlatformPlugin')
        .tap(args => {
          args[2]["include"] = ['taro-design']
          return args
        })
    },
    miniCssExtractPluginOption: {
      //忽略css文件引入顺序
      ignoreOrder: true
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    esnextModules: [
      'taro-design'
    ],
    webpackChain(chain) {
      chain.resolve.plugin('MultiPlatformPlugin')
        .tap(args => {
          args[2]["include"] = ['taro-design']
          return args
        })
    },
    output: {
      filename: 'js/[name].[hash:8].js',
      chunkFilename: 'js/[name].[chunkhash:8].js'
    },
    miniCssExtractPluginOption: {
      filename: 'css/[name].[hash:8].css',
      chunkFilename: 'css/[id].[chunkhash:8].css'
    },
  },
  rn: {
    appName: 'duxapp',
    output: {
      ios: './ios/main.jsbundle',
      iosAssetsDest: './ios',
      // iosSourcemapOutput: './ios/main.map',
      // iosSourceMapUrl: '',
      // iosSourcemapSourcesRoot: '',
      android: './android/app/src/main/assets/index.android.bundle',
      androidAssetsDest: './android/app/src/main/res',
      // androidSourceMapUrl: '',
      // androidSourcemapOutput: './android/app/src/main/assets/index.android.map',
      // androidSourcemapSourcesRoot: '',
    },
    postcss: {
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
      }
    },
    resolve: {
      include: ['taro-design']
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
