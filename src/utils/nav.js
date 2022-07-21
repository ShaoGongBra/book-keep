import Taro from '@tarojs/taro'
import { asyncTimeOut, request, currentPage } from 'taro-tools'
import { tabbar } from '@/components'
import router, { config } from './router'
import { isLogin, login } from './user'
import { bdDecrypt } from './gps'
import { loading } from './design'
import Map from './map'

let Linking
if (process.env.TARO_ENV === 'rn') {
  Linking = require('react-native').Linking
}

const getParams = (url, data) => {
  const len = url.indexOf('?')
  if (len === -1) {
    return { ...data }
  }
  let par = {}
  url.substr(len + 1).split('&').map(item => item.split('=')).map(item => par[item[0]] = item[1])
  return {
    ...data,
    ...par
  }
}

/**
 * 拼接路由参数
 * @param {string} url
 * @param {object} data
 */
const getOption = (url, data) => {
  let opt = {
    type: 'navigateTo',
    url: '',
    path: ''
  }
  //查找协议
  let len = url.indexOf(':')
  if (len > -1) {
    let type = url.substr(0, len)
    url = url.substr(len + 1)
    switch (type) {
      case 'redirect':
        opt.type = 'redirectTo'
        break
      case 'switch':
        // 跳转到tabbar页面
        tabbar.change(url, 'index')
        // 跳转到首页
        nav('back:home')
        return false
      case 'relaunch':
        opt.type = 'reLaunch'
        return opt
      case 'back':
        opt.delta = url || 1
        opt.type = 'navigateBack'
        if (opt.delta === 'home') {
          // 返回到主页
          const { length } = Taro.getCurrentPages()
          opt.delta = length - 1
          const current = currentPage()
          const index = Object.keys(router)[0]
          if (opt.delta === 0 && current !== index) {
            opt.type = 'redirectTo'
            url = index
            break
          }
        }
        opt.delta = Number(opt.delta)
        if (opt.delta < 1) {
          return false
        }
        return opt
      case 'mini':
        opt.type = 'navigateToMiniProgram'
        break
      case 'tel':
        if (process.env.TARO_ENV === 'rn') {
          Linking.openURL(`tel:${url}`)
        } else {
          Taro.makePhoneCall({
            phoneNumber: url
          })
        }
        return false
      case 'http':
        nav('/main/webview/index', {
          url: encodeURIComponent(type + ':' + url)
        })
        return false
      case 'https':
        nav('/main/webview/index', {
          url: encodeURIComponent(type + ':' + url)
        })
        return false
      case 'plugin-private':
        // 打开小程序插件
        if (process.env.TARO_ENV !== 'weapp') {
          console.warn('仅限小程序使用打开插件功能')
          return false
        }
        opt.url = type + ':' + url
        return opt
      case 'map':
        // 地图操作
        const { latitude, longitude, address = '', name = '' } = getParams(url, data)
        if (latitude && longitude) {
          switch (process.env.TARO_ENV) {
            case 'weapp':
              const weappPos = bdDecrypt(latitude, longitude)
              Taro.openLocation({
                latitude: weappPos.lat,
                longitude: weappPos.lon,
                address,
                name
              })
              break
            case 'h5':
              nav('main/webview/index', {
                url: encodeURIComponent(`http://api.map.baidu.com/geocoder?location=${latitude},${longitude}&output=html&src=com.moupu.shop`)
              })
              break
            case 'rn':
              Map.openMap({
                latitude,
                longitude,
                address,
                name
              })
              break
            default:
              break
          }
        } else {
          console.warn('经纬度不能为空！')
        }
        return false
      default:
        break
    }
  }
  // 查找参数
  len = url.indexOf('?')
  // 路径
  opt.path = url.split('?')[0].substr(url.startsWith('/') ? 1 : 0)
  // 参数长度
  let optionlen = len > -1 ? url.substr(len + 1).length : 0
  // 插入参数
  let newoption = []
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      newoption.push(key + '=' + encodeURIComponent(typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]))
    }
  }
  if (newoption.length) {
    url += (optionlen > 0 ? '&' : '?') + newoption.join('&')
  }
  // 补全链接前面的 '/'
  if (['navigateTo', 'redirectTo'].indexOf(opt.type) !== -1 && url.substr(0, 1) !== '/') {
    url = '/' + url
  }
  opt.url = url
  return opt
}

/**
 * 统一路由方法
 * @param {string} url 路由
 * @param {object} data 参数
 */
const nav = async (url, data = {}) => {
  if (!url || typeof url !== 'string') throw '无效的url'

  const opt = getOption(url, data)
  if (!opt) return
  const pageRouter = router[opt.path]
  if (opt.type !== 'navigateBack' && !pageRouter) {
    throw opt.path + ' 页面未注册 请在router.js中注册页面'
  }

  try {
    if (!isLogin() && pageRouter?.login) {
      // 执行登陆 登陆成功后继续跳转
      await login()
      // 让路由在停顿一会之后再继续执行
      await asyncTimeOut(100)
    }
    // 跳转验证
    if (pageRouter?.authUrl) {
      await request({
        url: pageRouter.authUrl,
        toast: true,
        loading
      }).catch(() => {
        pageRouter?.authPath && nav(pageRouter.authPath)
        throw { message: '没有访问权限' }
      })
    }
    config.log && console.log(url)
    nav.callbacks.forEach(cb => cb(opt))

    await Taro[opt.type]({
      ...(opt.type === 'navigateBack' ? { delta: opt.delta } : { url: opt.url })
    })
  } catch (error) {
    throw { message: '路由跳转失败', error }
  }
}

nav.callbacks = []

nav.on = cb => {
  nav.callbacks.push(cb)
  return {
    remove: () => {
      nav.callbacks.splice(nav.callbacks.indexOf(cb), 1)
    }
  }
}

/**
 * 将nav跳转之后的参数解析成对象
 * @param {object} obj
 * @return {object}
 */
const decodeParams = obj => {
  let params = { ...obj }
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      // 微信小程序临时小程序码的参数
      if (key === 'scene') {
        decodeURIComponent(params[key]).split('&').map(item => item.split('=')).map(item => {
          params[item[0]] = item[1] === undefined ? '' : item[1]
        })
        delete params.scene
        return decodeParams(params)
      }
      params[key] = decodeURIComponent(params[key])
      const firstStr = params[key].substr(0, 1)
      const lastStr = params[key].substr(params[key].length - 1)
      if ((firstStr == "{" && lastStr == "}") || (firstStr == "[" && lastStr == "]")) {
        try {
          params[key] = JSON.parse(params[key])
          // if (firstStr == "{") {
          //   params[key] = decodeParams(params[key])
          // }
        } catch (error) {

        }
      }
    }
  }
  return { ...getQueryVariable(), ...params }
}

/**
 * 获取h5端的参数返回一个对象
 */
const getQueryVariable = () => {
  if (process.env.TARO_ENV === 'h5') {
    var query = window.location.search.substring(1);
    if (!query) return {}
    var vars = query.split("&");
    let queryObj = {}
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      queryObj[pair[0]] = pair[1]
    }
    return queryObj;
  } else {
    return {}
  }
}

/**
 * 获取h5端的Hash参数和Hash值 返回一个对象
 */
const getHashQueryVariable = () => {
  if (process.env.TARO_ENV === 'h5' && window.location.hash) {
    let len = window.location.hash.indexOf('?')
    let maxlen = window.location.hash.length
    let hash = window.location.hash.substr(0, len === -1 ? maxlen : len)
    let query = len !== -1 ? window.location.hash.substr(len + 1) : ""
    if (!query) return { hash, params: {} }
    var vars = query.split("&");
    let params = {}
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      params[pair[0]] = pair[1]
    }
    return {
      hash,
      params
    }
  } else {
    return { hash: '', params: {} }
  }
}

/**
 * 判断指定路由在路径中位置，返回pages和查找结果paths
 * @param {String} path
 */
const getPathPosition = path => {
  const pages = Taro.getCurrentPages()
  const paths = []
  for (let i = 0; i < pages.length; i++) {
    let route = pages[i].route.split('?')[0]
    if (route[0] === '/') {
      route = route.substr(1)
    }
    if (route === path) {
      paths.push(route)
    }
  }
  return {
    pages,
    paths,
  }
}

export {
  nav,
  decodeParams,
  getQueryVariable,
  getHashQueryVariable,
  getPathPosition
}
