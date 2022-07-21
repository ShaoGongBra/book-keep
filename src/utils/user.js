import Taro from '@tarojs/taro'
import { request, currentPage } from 'taro-tools'
import config from '@/config/request'
import getStore from '@/redux/store'
import { setUserInfo as reduxSetUserInfo, clearUserInfo } from '@/redux/actions/user_info'
import { getConfig } from './config'
import { nav, getQueryVariable, getHashQueryVariable } from './nav'
import { loading } from './design'

// react-native-wechat-lib start
let isWXAppInstalled, sendAuthRequest
if (process.env.TARO_ENV === 'rn') {
  const wechatLib = require('react-native-wechat-lib')
  isWXAppInstalled = wechatLib.isWXAppInstalled
  sendAuthRequest = wechatLib.sendAuthRequest
}
// react-native-wechat-lib end

/**
 * 初始化用户信息
 */
const initUserInfo = async () => {
  if (process.env.TARO_ENV === 'h5' && global.platform === 'wechat') {
    // 公众号端登录
    const hashData = getHashQueryVariable()
    const params = { ...getQueryVariable(), ...hashData.params }
    if (params.auth_token) {
      await Taro.setStorage({
        key: 'userInfo',
        data: JSON.stringify({
          token: params.auth_token
        })
      })
      // 删除用户的token参数，防止被分享出去
      delete params.auth_token
      let paramsString = "?"
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          paramsString += (paramsString == "?" ? "" : "&") + key + "=" + params[key]
        }
      }
      paramsString = paramsString == "?" ? "" : paramsString
      // window.location.href = window.location.origin + window.location.pathname + hashData.hash + paramsString
      window.location.replace(window.location.origin + window.location.pathname + hashData.hash + paramsString)
      throw { message: '重置路由' }
    }
  }
  if (process.env.TARO_ENV === 'weapp') {
    // 小程序端可登录状态判断
    // Taro.getSetting().then(({ authSetting }) => {
    //   global.scopeUserInfo = authSetting['scope.userInfo'] ? (setUserStatus(true, 'local'), 1) : 0
    // })

    // 监听用户登录后获取openid信息
    onUserStatus(async (status, type) => {
      if (status && (type === 'login' || type === 'register')) {
        const { code } = await Taro.login()
        code && request({
          url: 'member/Bind/index',
          data: {
            code
          }
        })
      }

    })
  }
  try {
    if (config.devOpen && !!config.devToken) {
      setUserStatus(true, 'dev')
      // 更新用户最新信息
      getOnlineUserInfo()
    } else {
      let userInfo = await Taro.getStorage({
        key: 'userInfo'
      })
      userInfo = JSON.parse(userInfo.data)
      if (userInfo.token) {
        global.userInfo = userInfo
        const { dispatch } = getStore()
        dispatch(reduxSetUserInfo(userInfo))
        // 更新用户最新信息
        getOnlineUserInfo()
        // 登录状态回调
        setUserStatus(true, 'local')
      } else {
        throw { message: '无效的用户信息' }
      }
    }
  } catch (error) {
    global.userInfo = {}
  }
}

/**
 * 设置本地用户信息
 * @param {object} data 用户信息
 */
const setUserInfo = data => {
  const { dispatch } = getStore()
  dispatch(reduxSetUserInfo(data))
  let userInfo = global.userInfo
  userInfo = { ...userInfo, ...data }
  Taro.setStorage({
    key: "userInfo",
    data: JSON.stringify(userInfo)
  })
  global.userInfo = userInfo
  return userInfo
}
/**
 * 获取在线用户信息
 */
const getOnlineUserInfo = async () => {
  const { member } = await getConfig(false, true)
  if (member.info !== undefined && member.info !== null) {
    return setUserInfo(member.info)
  }
  return request('member/Setting/info').then(res => setUserInfo(res.info))
}

/**
 * 更新用户信息
 * @param {object} data 用户信息
 */
const updateUserInfo = async data => {
  try {
    await request({
      url: 'member/Setting/update',
      method: 'POST',
      toast: true,
      data
    })
    return setUserInfo(data)
  } catch (error) {
    throw error
  }
}

/**
 * 判断用户是否处于登录状态
 * 开启调试模式 也会被判断成已登陆
 * 判断用户是否可以正常获得token 获取用户信息 在微信小程序上 这可能是未登录状态 但是可以请求api直接登陆
 * @param {boolean} openLogin 未登录是否打开登陆页面
 * @param {function} callback 登陆成功回调函数 openLogin设置为true才会回调
 */
const isLogin = (openLogin = false, callback = null) => {
  // const loginStatus = global.platform === 'weapp'
  //   ? (global.scopeUserInfo === 1 || !!global.userInfo.password)
  //   : !!global.userInfo.password
  const loginStatus = !!global.userInfo.token || (config.devOpen && !!config.devToken)
  !!openLogin && !loginStatus && login().then(() => callback && callback())
  return loginStatus
}

/**
 * 微信小程序登陆类
 * 避免调用登陆方法出现重复登陆的情况
 */
let weappLoginThis
class WeappLogin {

  constructor() {
    weappLoginThis = this
  }

  // 是否正在登陆
  status = false

  // 登陆成功或者失败回调
  loginCallback(status) {
    for (let i = 0, l = weappLoginThis.loginFunc.length; i < l; i++) {
      weappLoginThis.loginFunc[i](status)
    }
    weappLoginThis.loginFunc = []
  }

  // 调用登陆的回调函数合集
  loginFunc = []

  // 登陆成功监听
  onLogin(func) {
    weappLoginThis.loginFunc.push(func)
  }

  getUserProfile() {
    // eslint-disable-next-line no-undef
    if (!wx.getUserProfile) {
      return Taro.getUserInfo({
        withCredentials: true,
        lang: "zh_CN"
      })
    }
    console.log('getUserProfile')
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-undef
      wx.getUserProfile({
        lang: "zh_CN",
        desc: '获取用户信息用于完善会员资料',
        success(res) {
          resolve(res)
        },
        fail(error) {
          reject(error)
        }
      })
    })
  }

  /**
   * 微信小程序登录方法
   * 需要在授权用户信息后方可请求
   */
  weappLogin = async info => {
    if (weappLoginThis.status) {
      return new Promise((resolve, reject) => {
        weappLoginThis.onLogin(status => {
          !!status ? resolve() : reject({ code: 500, message: '登陆失败' })
        })
      })
    }
    weappLoginThis.status = true
    const stop = loading('正在登录')
    try {


      // eslint-disable-next-line no-undef
      if (!info && !wx.getUserProfile) {
        const setting = await Taro.getSetting()
        if (!setting.authSetting['scope.userInfo']) {
          throw { message: '用户未授权，无法获取用户信息' }
        }
      }

      global.scopeUserInfo = 1
      const login = await Taro.login()
      const wxUserInfo = info || await weappLoginThis.getUserProfile()
      const userInfo = await request({
        url: 'wechatapp/Miniapp/login',
        method: 'POST',
        toast: true,
        data: {
          code: login.code,
          nickname: wxUserInfo.userInfo.nickName || '',
          avatar: wxUserInfo.userInfo.avatarUrl || '',
          sex: wxUserInfo.userInfo.gender || 0,
          encryptedData: wxUserInfo.encryptedData || '',
          iv: wxUserInfo.iv || '',
          signature: wxUserInfo.signature || '',
          rawData: wxUserInfo.rawData || ''
        }
      })
      stop()
      weappLoginThis.status = false
      if (userInfo.status !== 'bind') {
        weappLoginThis.loginCallback(true)
        return setUserInfo({ ...userInfo.data, token: userInfo.token })
      } else {
        const { member } = await getConfig()
        if (member.config.wechat_get_bind_tel === '1') {
          // 微信小程序获取用户手机号
          await nav('main/auth/wx_phone', {
            post: userInfo.data
          })
        } else {
          // 手动填写用户手机号
          await nav('main/common/auto_account', {
            type: 'bind_tel',
            post: userInfo.data
          })
        }

        throw {
          message: '需要绑定手机号'
        }
      }
    } catch (error) {
      stop()
      weappLoginThis.loginCallback(false)
      weappLoginThis.status = false
      throw { message: error.message || error.errMsg || error }
    }
  }

}

const { weappLogin } = new WeappLogin()

const wxappLogin = async () => {
  // react-native-wechat-lib start
  if (process.env.TARO_ENV === 'rn') {
    try {
      if (!await isWXAppInstalled()) {
        throw { message: '未安装微信客户端', code: 500 }
      }
      const res = await sendAuthRequest('snsapi_userinfo')
      if (parseInt(res.errCode) !== 0) {
        throw { code: parseInt(res.errCode), message: res.errMsg }
      }
      const userinfo = await request({
        url: 'wechatapp/App/appLogin',
        data: { code: res.code }
      })
      if (userinfo.status !== 'bind') {
        return await setUserInfo({ uid: userinfo.uid, token: userinfo.token, ...userinfo.data })
      } else {
        // 手动填写用户手机号
        await nav('main/common/auto_account', {
          type: 'bind_tel',
          post: userinfo.data
        })

        throw {
          message: '需要绑定手机号'
        }
      }
    } catch (error) {
      throw {
        code: 500,
        message: error.message !== undefined ? error.message : error.errMsg !== undefined ? error.errMsg : error
      }
    }


  } else {
    return Promise.reject({ message: '平台错误 不支持微信APP登陆', code: 500 })
  }
  // react-native-wechat-lib end
}

/**
 * 系统登陆方法
 * 是一个支持Promise的登陆方法
 */
let thisLogin
class Login {

  constructor() {
    thisLogin = this
  }

  // 是否正在登陆
  status = false

  // 登陆成功或者失败回调
  async loginCallback(status, url, type = 'login') {
    // status && console.log('登陆成功', getRequestHeader())
    url && await nav(url)
    for (let i = 0, l = this.loginFunc.length; i < l; i++) {
      this.loginFunc[i](status)
    }
    this.loginFunc = []

    // 登录状态回调
    status && thisLogin.setUserStatus(true, type)
  }

  // 调用登陆的回调函数合集
  loginFunc = []

  // 登陆成功监听
  onLogin(func) {
    this.loginFunc.push(func)
  }

  /**
   * 微信h5端是否正在跳转登录，防止重复跳转创建多个相同用户
   */
  wechatLoingStatus = false

  // 调用登陆方法 并在登陆成功或者失败后获得回调
  async login() {
    // 微信小程序的自动登陆
    // if (global.platform === 'weapp' && isLogin()) {
    //   return weappLogin()
    // }
    // 微信公众号自动登陆
    if (global.platform === 'wechat') {
      if (thisLogin.wechatLoingStatus) {
        throw { code: 500, message: '微信正在登录中' }
      }
      thisLogin.wechatLoingStatus = true
      const onlineConfig = await getConfig()
      let { loginUrl } = onlineConfig.wechat
      // 全局请求参数传到登录页面
      const { apiParams } = global
      for (const key in apiParams) {
        if (apiParams.hasOwnProperty(key)) {
          loginUrl += `${loginUrl.indexOf('?') === -1 ? '?' : '&'}${key}=${apiParams[key]}`
        }
      }
      // 传入重定向页面，跳转到对应地址
      const params = { ...getQueryVariable(), ...getHashQueryVariable().params }
      const url = []
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          url.push(`${key}=${params[key]}`)
        }
      }
      loginUrl += (loginUrl.indexOf('?') === -1 ? '?router=' : '&router=') + encodeURIComponent(`${currentPage()}?${url.join('&')}`)
      window.location.replace(loginUrl)
      throw { code: 302, message: '即将跳转到登陆地址' }
    }

    // 其他登陆先跳转登陆页面登陆成功后执行回调
    if (!thisLogin.status) {
      thisLogin.status = true
      Taro.navigateTo({
        url: '/main/auth/login'
      })
      // 全局登录
      global.login = (...arg) => {
        thisLogin.status = false
        thisLogin.loginCallback(...arg)
        global.login = null
      }
    }
    return new Promise((resolve, reject) => {
      thisLogin.onLogin(status => {
        !!status ? resolve() : reject({ code: 500, message: '登陆失败' })
      })
    })
  }

  /**
   * 退出登录处理
   */
  loginOut() {
    const { dispatch } = getStore()
    const userInfo = {}
    dispatch(clearUserInfo())
    Taro.setStorage({
      key: "userInfo",
      data: JSON.stringify(userInfo)
    })
    global.userInfo = userInfo
    thisLogin.setUserStatus(false)
    nav('back:home')
  }

  // 用户状态变化的回调函数列表
  userStatusFunc = []
  // 当前的登录状态
  userStatus = false
  // 登录类型 local 本地数据登录 login登录 register 注册 weapp 微信小程序登录 appwechat app微信登录
  loginType = 'local'
  /**
   * 监听用户登录状态事件
   * @param {Function} func
   */
  onUserStatus(func) {
    if (typeof func !== 'function') return
    // 查找是否存在相同函数，相同函数删除原函数，新增新函数
    for (let i = 0, l = thisLogin.userStatusFunc.length; i < l; i++) {
      if (thisLogin.userStatusFunc[i] === func) {
        thisLogin.userStatusFunc.splice(i, 1)
        break
      }
    }
    // 如若已经登录立即执行
    thisLogin.userStatus && func(true, thisLogin.loginType)
    // 将函数保存起来后面回调
    thisLogin.userStatusFunc.push(func)
  }

  /**
   * 取消监听登录状态回调
   * @param {Function} func
   */
  offUserStatus(func) {
    if (typeof func !== 'function') {
      thisLogin.userStatusFunc = []
    } else {
      for (let i = 0, l = thisLogin.userStatusFunc.length; i < l; i++) {
        if (thisLogin.userStatusFunc[i] === func) {
          thisLogin.userStatusFunc.splice(i, 1)
          // console.log('取消用户监听', thisLogin.userStatusFunc)
          break
        }
      }
    }
  }

  /**
   * 登录状态变化回调
   */
  setUserStatus(status, type = 'local') {
    // 设置redux 用户状态 让页面进行更新
    const { dispatch } = getStore()
    dispatch(reduxSetUserInfo({ loginStatus: status }))
    // 防止重复执行
    if (status === thisLogin.userStatus) return
    thisLogin.loginType = type
    thisLogin.userStatus = status
    for (let i = 0, l = thisLogin.userStatusFunc.length; i < l; i++) {
      thisLogin.userStatusFunc[i](status, thisLogin.loginType)
    }
  }
}

const { login, loginOut, onUserStatus, offUserStatus, setUserStatus } = new Login()

export {
  isLogin,
  login,
  loginOut,
  weappLogin,
  wxappLogin,
  initUserInfo,
  setUserInfo,
  updateUserInfo,
  getOnlineUserInfo,
  onUserStatus,
  offUserStatus,
  setUserStatus
}
