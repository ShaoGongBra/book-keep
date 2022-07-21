import Taro from '@tarojs/taro'
import { request } from 'taro-tools'
import { nav } from './nav'


/**
 * 获取系统配置配
 * 可以多次请求次方法，防止同时重复请求
 * 启动后只会请求一次获取配置 以后都读取缓存
 */
const Confg = {

  // 网络配置加载状态
  status: false,

  // 本地数据加载状态
  localStatus: false,

  // 获取配置的回调函数
  configFunc: [],

  // 获取到的配置
  data: {},

  // 数据类型 null未获取 local本地数据 online在线数据
  dataType: null,

  // 添加监听函数
  onConfig(func, reload, noCache) {
    this.configFunc.push({ func, reload, noCache })
  },

  // 获取到配置后的回调
  configCallback(status) {
    for (let i = 0, l = this.configFunc.length; i < l; i++) {
      const item = this.configFunc[i]
      if (this.dataType === 'online' || !item.noCache) {
        item.func(status)
        this.configFunc.splice(i, 1)
        i--
        l = this.configFunc.length
      }
    }
  },

  async getLocalConfig() {
    if (this.localStatus || this.dataType !== null) {
      return false
    }
    this.localStatus = true
    try {
      const { data } = await Taro.getStorage({
        key: 'config'
      })
      if (data === null) {
        throw { message: '无效的本地存储' }
      }
      this.data = JSON.parse(data)
      this.dataType = 'local'
      this.configCallback(true)
      this.localStatus = false
      return this.data
    } catch (error) {
      this.localStatus = false
      return false
    }
  },

  async getOnloneConfig() {
    if (this.status) return false
    this.status = true
    try {
      const res = await request({ url: 'index/Init/config' })
      this.data = res
      // 保存到本地
      Taro.setStorage({
        key: 'config',
        data: JSON.stringify(res)
      })
      this.dataType = 'online'
      this.status = false
      this.configCallback(true)
      // 站点维护中处理
      this.data.site.config.site_status !== '1' && nav('redirect:main/common/info', {
        title: this.data.site.config.site_error,
        icon: 'info',
        button_text: '站点维护中'
      })
      return res
    } catch (error) {
      console.warn('获取配置失败', error)
      this.status = false
      this.configCallback(false)
      return false
    }
  },

  /**
   * 加载系统配置
   * @param {boolean} reload 是否重新加载配置 不使用缓存
   * @param {boolean} noCache 等待线上配置第一次加载成功 不使用本地缓存
   */
  getConfig(reload = false, noCache = false) {
    // 直接返回缓存
    if (!reload && (this.dataType === 'online' || !noCache) && this.data && this.data.tabbar) {
      return Promise.resolve(this.data)
    }
    return new Promise((resolve, reject) => {
      this.onConfig(status => {
        status ? resolve(this.data) : reject(this.data)
      }, reload, noCache)
      this.getLocalConfig()
      this.getOnloneConfig()
    })
  },
}

/**
 * 异步获取配置
 */
const getConfig = Confg.getConfig.bind(Confg)
/**
 * 同步获取配置
 * @returns
 */
const getConfigSync = () => Confg.data
/**
 * 获取骨架屏
 * @param {string} url
 */
const getSkeleton = url => {
  return getConfig().then(res => {
    for (let i = 0; i < res.skeleton.length; i++) {
      const element = res.skeleton[i]
      if (element.bind === url) {
        return element.content.list
      }
    }
    return []
  })
}

export {
  getSkeleton,
  getConfig,
  getConfigSync
}
