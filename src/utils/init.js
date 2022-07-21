import Taro from '@tarojs/taro'
import { initRequestConfig } from '@/config/request'
import store from '@/redux/store'
import { setTheme } from '@/redux/actions/theme'
import theme from '@/config/theme'
import { getPlatform } from './util'
import { getConfig } from './config'
import { isApp } from './app'
import { shareInit } from './share'
// module chat start
import { initChat } from './chat'
// module chat end
// module shop start
import { initCartTabbarNumber } from './cart'
import { orderInit } from './order'
import { shopInit } from './shop'
// module shop end
import { getQueryVariable, getHashQueryVariable, decodeParams } from './nav'
import { isLogin } from './user'
import { systemUploadApp } from './rn'

(() => {
  // 系统信息
  global.systemInfo = Taro.getSystemInfoSync()
  // if (process.env.TARO_ENV === 'h5') {
  //   window.addEventListener('load', () => {
  //     global.systemInfo.windowWidth = document.getElementById('app').offsetWidth
  //   })
  // }
  // 平台信息
  global.platform = getPlatform()
  // 用户信息
  global.userInfo = { data: {} }
  // 全局请求参数
  global.apiParams = {}
  // 后端启用的模块
  global.module = []
  // 全局样式
  global.theme = theme

  initRequestConfig()
})();



/**
 * 初始化配置
 * 导航配置
 * 主题配置
 */
export const initConfig = () => {
  getConfig().then(res => {
    // 微信公众号端是否立即登陆
    if (global.platform === 'wechat' && res.member.config.wechat_quick_login === '1' && !isLogin(true)) return

    const { dispatch } = store()
    // 当前页面标题
    // setNavigationBarTitle(tabbar[select].title || tabbar[select].text)
    // 主题
    dispatch(setTheme(res.theme))
    // 设置模块到全局
    global.module = res.app
    // module chat start
    // 聊天系统初始化
    isApp('chats') && initChat()
    // module chat end
    // module shop start
    // 购物车数量初始化
    initCartTabbarNumber()
    // 订单数据
    orderInit()
    // 店铺信息
    shopInit(res.store)
    // module shop end
    // 分享系统初始化
    isApp('share') && shareInit()

    systemUploadApp(res.nativeapp)
  }).catch((err) => {
    console.log('配置加载失败 将在稍后重试', err)
    setTimeout(() => initConfig(), 3000)
  })
}

/**
 * 加载启动参数
 * api-参数名 的启动参数将会在后续的请求中将此参数一致加入请求数据中
 */
export const startParams = app => {
  return {}
  let params = {}
  if (process.env.TARO_ENV === 'h5') {
    params = { ...params, ...getQueryVariable(), ...getHashQueryVariable().params }
  } else if (process.env.TARO_ENV === 'rn') {
    // rn端获取启动参数
  } else {
    params = app.$router.params.query
  }
  params = decodeParams(params)
  // console.log('api启动参数', params)
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      // 处理全局请求参数
      if (key.substr(0, 4) === 'api-') {
        const newKey = key.substr(4)
        global.apiParams[newKey] = params[key]
      }
    }
  }
  return params
}
