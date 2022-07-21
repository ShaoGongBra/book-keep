import router from './config/router'

// eslint-disable-next-line no-undef
const config = defineAppConfig({
  window: {
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
    // 自定义头部
    navigationStyle: 'custom',
    // 禁用页面滚动
    disableScroll: true,
  },
  plugins: {
    // 直播插件 如果需要取消注释
    // 'live-player-plugin': {
    //   version: "1.2.2", // 填写该直播组件最新版本号，微信开发者工具调试时可获取最新版本号
    //   provider: "wx2b03c6e691cd7370" // 必须填该直播组件appid，该示例值即为直播组件appid
    // }
  },
  permission: {
    // 获取定位权限描述
    "scope.userLocation": {
      desc: "你的位置信息将用于小程序位置接口的效果展示"
    }
  },
  // 开启动画
  animation: {
    duration: 300
  },
  // h5要在哪个节点渲染
  appId: 'app'
})

const pageFilter = item => {
  // 判断平台
  if (item.platform && !item.platform?.includes(process.env.TARO_ENV)) {
    return false
  }
  return true
}

// platform rn start
if (process.env.TARO_ENV === 'rn') {
  const isHermes = () => !!global.HermesInternal;
  config.rn = {
    screenOptions: {
      gestureEnabled: true,
      cardStyle: { elevation: 0 },
      cardStyleInterpolator: isHermes() ? (
        require('react-native').Platform.OS === 'android' ?
          require('@react-navigation/stack').CardStyleInterpolators.forFadeFromBottomAndroid
          : require('@react-navigation/stack').CardStyleInterpolators.forHorizontalIOS
      ) : null
    }
  }
}
// platform rn end

config.subPackages = []
config.pages = Object
  .keys(router.pages)
  .map(key => {
    const { pages: subPages, subPackage, ...arg } = router.pages[key]
    if (subPages && subPackage) {
      const keys = Object.keys(subPages).filter(item => pageFilter({ ...arg, ...subPages[item], page: `${key}/${item}` }))
      if (keys.length) {
        config.subPackages.push({
          root: `${key}/`,
          pages: keys
        })
      }
      // 分包
      return []
    } else if (subPages) {
      // 未分包的分组
      return Object.keys(subPages).filter(item => pageFilter({ ...arg, ...subPages[item], page: `${key}/${item}` })).map(item => `${key}/${item}`)
    } else {
      // 普通页面
      return [key].filter(() => pageFilter({ ...arg, page: key }))
    }
  })
  .flat()
  // 去重
  .reduceRight((prev, current) => {
    !prev.includes(current) && prev.unshift(current)
    return prev
  }, [])


export default config
