// platform h5 start
import WechatJSSDK from 'wechat-jssdk/dist/client.umd'
// platform h5 end
import { request } from 'taro-tools'
import { getHashQueryVariable } from './nav'

/**
 * 分享初始化参数 主要用户微信h5端
 */
const shareInitData = {
  shareParams: null,
  wechatObj: null,
  timer: null,
  oldHref: '',
  callback: [],
  getPageParams(init) {
    const hash = (window.location.href.split('#')[1] || '/main/index/index').replace('/', '')
    const url = hash.substr(0, hash.indexOf('?') === -1 ? hash.length : hash.indexOf('?'))
    let page = null
    for (let i = 0, l = this.shareParams.sharePages.length; i < l; i++) {
      const element = this.shareParams.sharePages[i]
      if (element.url === url) {
        page = element
        break
      }
    }
    if (init && page && this.shareParams.currentParams.url === url) {
      return Promise.resolve(this.shareParams.currentParams)
    } else if (!page) {
      return Promise.resolve(this.shareParams.indexParams)
    } else {
      return request({
        url: 'share/Share/getPageParams',
        method: 'POST',
        data: {
          page: url,
          params: getHashQueryVariable().params
        }
      })
    }
  },
  onHrefChange(init) {
    if (!this.shareParams) {
      return
    }
    this.getPageParams(init).then(page => {
      let link = window.location.href
      if (page.url && typeof page.url === 'string') {
        if (page.url.indexOf('http') === 0) {
          link = page.url
        } else {
          const { location } = window
          link = location.origin + location.pathname + location.search + '#/' + page.url
        }
      }
      if (page.params instanceof Object) {
        Object.keys(page.params).forEach(key => {
          link += (~link.indexOf('?') ? '&' : '?') + key + '=' + page.params[key]
        })
      }
      this.wechatObj.callWechatApi('updateAppMessageShareData', {
        title: page.title, // 分享标题
        link, // 分享链接
        imgUrl: page.image, // 分享图标
        desc: page.description, // 分享描述
      })
      this.wechatObj.callWechatApi('updateTimelineShareData', {
        title: page.title, // 分享标题
        link, // 分享链接
        imgUrl: page.image, // 分享图标
      })
    })
  }
}

export const shareInit = () => {
  if (process.env.TARO_ENV === 'h5' && global.platform === 'wechat') {
    // platform h5 start
    // 微信h5处理jssdk分享
    !shareInitData.shareParams && request({
      url: 'share/Share/getWechatShareParams',
      data: {
        href: window.location.href
      },
      method: 'POST'
    }).then(res => {
      shareInitData.shareParams = res
      shareInitData.wechatObj = new WechatJSSDK(res.wechatConfig)
      shareInitData.wechatObj.initialize().then(() => {
        shareInitData.onHrefChange(true)
      })
      // 参数回调
      shareInitData.shareParams = res
      shareInitData.callback.forEach(item => item[0](res))
      shareInitData.callback = []
    })
    if (!shareInitData.timer) {
      shareInitData.timer = setInterval(() => {
        if (window.location.href !== shareInitData.oldHref) {
          shareInitData.oldHref = window.location.href
          shareInitData.onHrefChange()
        }
      }, 300)
    }
    // platform h5 end
  } else {
    request({
      url: 'share/Share/getShareParams'
    }).then(res => {
      // 参数回调
      shareInitData.shareParams = res
      shareInitData.callback.forEach(item => item[0](res))
      shareInitData.callback = []
    }).catch(err => {
      shareInitData.callback.forEach(item => item[1](err))
      shareInitData.callback = []
    })
  }
}

/**
 * 异步获取分享配置信息
 */
export const getShareConfig = () => {
  if (shareInitData.shareParams) {
    return Promise.resolve(shareInitData.shareParams)
  }
  return new Promise((resolve, reject) => {
    shareInitData.callback.push([resolve, reject])
  })
}
