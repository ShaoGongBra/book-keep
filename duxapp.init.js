module.exports = async function init(info, {
  inquirer,
  path,
  file,
  project,
  coding,
  rn,
  util,
  android
}) {
  // 删除当前的远程地址 避免同步到远程
  await coding.clearRemote(info.name)

  const platforms = ['小程序', 'H5', 'ReactNative']
  const rnPackages = ['微信', '支付宝']
  const modules = ['商城', '快速购买', '积分商城', '分销', '文章', 'DIY', '聊天', '钱包', '会员卡', '素材库']
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'platform',
      message: '请选择要支持的端',
      default: platforms,
      choices: platforms,
      validate(val) {
        if (val.length === 0) {
          return '请至少选择一个平台'
        }
        return true
      }
    },
    {
      type: 'checkbox',
      name: 'rnPackage',
      message: '请选择ReactNative端需要的功能',
      default: rnPackages,
      choices: rnPackages,
      when(val) {
        return val.platform.includes('ReactNative')
      }
    },
    {
      type: 'checkbox',
      name: 'module',
      message: '请选择你需要的额外模块',
      default: ['商城', '快速购买', '积分商城', '分销', '文章', 'DIY', '聊天', '钱包'],
      choices: modules,
      pageSize: 10,
      validate(val) {
        if (!val.includes('商城') && val.some(item => ['快速购买', '积分商城', '分销'].includes(item))) {
          return '要选择分销、快速购买、积分商城，必须先选中商城'
        }
        return true
      }
    },
  ])
  console.log('[2/3]模板处理中...')
  // 对项目进行操作
  const getDel = (a = [], b = []) => b.filter(v => !a.includes(v))
  const action = {
    platform: {
      小程序() {
        file.editFile('package.json', data => {
          const json = JSON.parse(data)
          const scripts = ['build:weapp', 'build:swan', 'build:alipay', 'build:tt', 'build:qq', 'build:jd', 'build:quickapp', 'dev:weapp', 'dev:swan', 'dev:alipay', 'dev:tt', 'dev:qq', 'dev:jd', 'dev:quickapp']
          scripts.forEach(key => {
            delete json.scripts[key]
          })
          delete json.devDependencies['@tarojs/mini-runner']
          return JSON.stringify(json, null, 2) + '\r'
        })
        return [
          ['platform weapp'],
          [
            'project.config.json',
            'project.tt.json'
          ]
        ]
      },
      H5() {
        file.editFile('package.json', data => {
          const json = JSON.parse(data)
          const scripts = ['build:h5', 'dev:h5']
          scripts.forEach(key => {
            delete json.scripts[key]
          })
          const dependencies = ['wechat-jssdk']
          dependencies.forEach(key => {
            delete json.dependencies[key]
          })
          return JSON.stringify(json, null, 2) + '\r'
        })
        return [
          ['platform h5'],
          []
        ]
      },
      ReactNative() {
        file.editFile('package.json', data => {
          const json = JSON.parse(data)
          const scripts = [
            'build:rn', 'build:rn-android', 'build:rn-ios', 'dev:rn',
            'start', 'codepush:init', 'codepush:key', 'android', 'debug:android', 'build:android',
            'pgyer:android', 'install:android', 'codepush:android', 'codepush:android-test',
            'ios', 'build:ios', 'export:ios', 'pgyer:ios', 'upload-ios', 'codepush:ios', 'codepush:ios-test',
            'codepush', 'codepush-test'
          ]
          const dependencies = [
            '@tarojs/taro-rn', '@0x5e/react-native-alipay', '@react-native-async-storage/async-storage', '@react-native-community/cameraroll',
            '@react-native-community/clipboard', '@react-native-community/geolocation', '@react-native-masked-view/masked-view',
            '@react-native-community/netinfo', '@react-native-community/push-notification-ios', '@react-native-community/slider', '@react-native-picker/picker',
            'expo', 'expo-av', 'expo-barcode-scanner', 'expo-brightness', 'expo-camera', 'expo-file-system', 'expo-image-picker',
            'expo-keep-awake', 'expo-location', 'expo-modules-core', 'expo-permissions', 'expo-sensors',
            'react-native', 'react-native-autoheight-webview', 'react-native-bootsplash', 'react-native-code-push', 'react-native-device-info', 'react-native-dux-push',
            'react-native-fast-image', 'react-native-fs', 'react-native-gesture-handler', 'react-native-image-resizer', 'react-native-pager-view',
            'react-native-safe-area-context', 'react-native-screens', 'react-native-share', 'react-native-svg',
            'react-native-syan-image-picker', 'react-native-wechat-lib', 'rn-fetch-blob'
          ]
          const devDependencies = [
            '@tarojs/rn-runner', 'pod-install'
          ]
          scripts.forEach(key => {
            delete json.scripts[key]
          })
          dependencies.forEach(key => {
            delete json.dependencies[key]
          })
          devDependencies.forEach(key => {
            delete json.devDependencies[key]
          })
          delete json.resolutions
          return JSON.stringify(json, null, 2) + '\r'
        })
        // 删除rn文件夹
        file.delete('android')
        file.delete('ios')
        return [
          ['platform rn'],
          [
            'utils/map/index.rn.js',
            'utils/pay/index.rn.js',
            'utils/rn/index.rn.js',
            'config/app.js',
            'ExportOptions.plist',
            'logo.png'
          ]
        ]
      }
    },
    rnPackage(list) {
      const delDependencie = {
        微信: ['react-native-wechat-lib'],
        支付宝: ['@0x5e/react-native-alipay']
      }
      file.editFile('package.json', data => {
        const json = JSON.parse(data)
        list.forEach(item => {
          delDependencie[item].forEach(key => {
            delete json.dependencies[key]
          })
        })
        return JSON.stringify(json, null, 2) + '\r'
      })

      let currentPath = ''
      if (answers.platform.includes('ReactNative')) {
        const currentName = file.readFile('android/app/src/main/AndroidManifest.xml').match(/package="([a-z.]{1,})"/)[1]
        currentPath = currentName.split('.').join('/')
      }
      return [
        [
          ['react-native-wechat-lib', '微信'],
          ['react-native-alipay', '支付宝']
        ].filter(item => list.includes(item[1])).map(item => item[0]),
        [
          ...currentPath && list.includes('微信') ? ['android/app/src/main/java/' + currentPath + '/wxapi'] : []
        ]
      ]
    },
    module(list) {
      return [
        [
          ['module shop', '商城'],
          ['module quick', '快速购买'],
          ['module integral', '积分商城'],
          ['module sale', '分销'],
          ['module article', '文章'],
          ['module diy', 'DIY'],
          ['module chat', '聊天'],
          ['module wallet', '钱包'],
          ['module member', '会员卡'],
          ['module materiali', '素材库']
        ].filter(item => list.includes(item[1])).map(item => item[0]),
        [
          [[
            'main/goods',
            'main/shop',
            'main/cart',
            'main/coupon',
            'main/quick',
            'main/order',
            'main/bank_card',
            'main/address',
            'main/after_service',
            'main/user/follow.jsx',
            'main/user/follow.scss',
            'main/user/hostory.jsx',
            'main/user/hostory.scss',
            'components/order',
            'components/goods',
            'main/list/common/shop.jsx',
            'main/list/common/shop.scss',
            'main/list/common/package.jsx',
            'main/list/common/package.scss',
            'main/list/common/goods.jsx',
            'main/list/common/goods.scss',
            'main/list/common/integral_goods.jsx',
            'main/list/common/integral_goods.scss',
            'main/list/common/live.jsx',
            'main/list/common/live.scss',
            'main/list/common/favorable.jsx',
            'main/list/common/favorable.scss',
            'utils/cart.js',
            'utils/order.js',
            'utils/shop.js'
          ], '商城'],
          [['main/quick'], '快速购买'],
          [['main/integral'], '积分商城'],
          [['main/sale'], '分销'],
          ['module article', '文章'],
          [['main/article', 'main/list/common/article.jsx', 'main/list/common/article.jsx'], '文章'],
          [['main/diy', 'components/diy'], 'DIY'],
          [[
            'main/message',
            'utils/chat.js',
            'redux/reducers/message.js',
            'redux/constants/message.js',
            'redux/actions/message.js'
          ], '聊天'],
          [['main/wallet'], '钱包'],
          [['main/member'], '会员卡'],
          [['main/materiali'], '素材库']
        ].filter(item => list.includes(item[1])).map(item => item[0]).flat()
      ]
    }
  }
  const reslult = [
    getDel(answers.platform, platforms).map(key => action.platform[key]()).flat(),
    action.rnPackage(getDel(answers.rnPackage || [], rnPackages)),
    action.module(getDel(answers.module, modules)),
  ]

  const markList = reslult.map(item => item[0] || []).flat()
  const fileList = reslult.map(item => item[1] || []).flat()

  fileList.forEach(item => {
    file.delete(path.join('src', item))
  })
  const markEdit = content => {
    const lines = content.split('\n')
    const marks = []
    let mark = []
    lines.forEach((item, index) => {
      const isMark = markList.some(v => {
        return ~item.indexOf(v + (mark.length ? ' end' : ' start'))
      })
      if (isMark) {
        mark.push(index)
        if (mark.length === 2) {
          marks.unshift(mark)
          mark = []
        }
      }
    })
    marks.forEach(([start, end]) => {
      lines.splice(start, end - start + 1)
    })
    return lines.join('\n')
  }
  file.fileList('src', '.js,.jsx,.scss', filePath => {
    file.editFile(filePath, markEdit)
  })

  // 处理 ReactNative 端 CodePush 等
  if (answers.platform.includes('ReactNative')) {
    if (answers.platform.includes('ReactNative')) {
      rn.packageName(info.name, info.description)
      rn.appName(info.displayName)
      await rn.appID()
      try {
        await android.keystore()
      } catch (error) {
        console.log('安卓端证书生成失败', error)
      }
    }
    try {
      await rn.codepushInit('android')
      await rn.codepushInit('ios')
    } catch (error) {

    }
    try {
      const keys = {
        android: await rn.codepushDeploymentKey('android'),
        ios: await rn.codepushDeploymentKey('ios'),
      }
      file.editFile('src/config/app.js', content => {
        return content
          .replace(/codePushAndroidKey: \'[\d-_A-Za-z]{37}\'/, `codePushAndroidKey: '${keys.android.Production}'`)
          .replace(/codePushAndroidTestKey: \'[\d-_A-Za-z]{37}\'/, `codePushAndroidTestKey: '${keys.android.Test}'`)
          .replace(/codePushIosKey: \'[\d-_A-Za-z]{37}\'/, `codePushIosKey: '${keys.ios.Production}'`)
          .replace(/codePushIosTestKey: \'[\d-_A-Za-z]{37}\'/, `codePushIosTestKey: '${keys.ios.Test}'`)
      })
    } catch (error) {
      console.log('codepush 初始化失败')
    }
  }

  // 清理资源
  project.clearStatic()

  // 将代码同步到coding
  if (await coding.projectByName(info.name)) {
    console.log('coding 已经存在相同名称项目 不会在coding创建项目')
  } else {
    await coding.init(info.name, info.displayName, info.description)
  }
  // 删除初始化文件
  file.delete('duxapp.init.js')
  console.log('[3/3]安装依赖(时间较长，你可以取消进程手动安装)...')
  await util.asyncExec(`cd ${info.name} && yarn`)
  console.log(`项目初始化成功 请打开 ${info.name} 目录，开始编码`)
  return answers
}
