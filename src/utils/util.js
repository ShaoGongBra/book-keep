import Taro from '@tarojs/taro'
import { useEffect, useRef } from 'react'
import { request, toast } from 'taro-tools'
import { loading } from './design'
import { crequestMultiplePermission } from './rn'


// platform rn start
let Platform, Share, RNFS
if (process.env.TARO_ENV === 'rn') {
  Platform = require('react-native').Platform
  Share = require('react-native-share').default
  RNFS = require('react-native-fs')
}
// platform rn end

/**
* 获取Platform类型，主要用于支付请求的时候获取不同的支付类型
* @returns {string} app APP端 | weapp 微信小程序 | wechat 微信公众号 | wap h5端
*/
export const getPlatform = () => {
  switch (process.env.TARO_ENV) {
    case 'rn':
      return 'app'
    case 'h5':
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.match(/MicroMessenger/i) == 'micromessenger') {
        return 'wechat'
      } else {
        return 'wap'
      }
    default:
      return process.env.TARO_ENV
  }
}

/**
 * 记录日志到后台
 * @param {string|object} content 日志内容
 * @param {string} page 日志路径
 */
export const debug = (content, page = '') => {
  if (!content) return
  request({
    url: 'system/Debug/push',
    method: 'POST',
    data: { content: typeof content == 'object' ? JSON.stringify(content) : content, page }
  })
}

/**
 * 手机号码加*
 */
export const mobileStar = mobile => {
  var mobile = mobile.toString()
  var start = mobile.length == 11 ? 3 : 2
  return mobile.replace(mobile.substring(start, mobile.length - 3), '****')
}


/**
 * 将图片或视频保存到相册
 * @param {*} url 或者多个url组成的数组
 */
export const saveToPhoto = async url => {
  if (process.env.TARO_ENV === 'h5') {
    throw {
      message: '暂不支持h5保存到相册'
    }
  }
  if (typeof url === 'string') {
    url = [url]
  }
  let stop
  try {
    if (process.env.TARO_ENV === 'weapp') {
      try {
        if (process.env.TARO_ENV === 'weapp') {
          await Taro.authorize({ scope: 'scope.writePhotosAlbum' })
        }
      } catch (error) {
        await Taro.showModal({
          title: '授权提示',
          content: '请手动打开设置开启保存到相册权限后重试',
          showCancel: false
        })
        throw '未授权'
      }
    }
    stop = loading('图片加载中')
    const promisArr = []
    for (let i = 0; i < url.length; i++) {
      promisArr.push(Taro.downloadFile({ url: url[i] }))
    }
    const localList = await Promise.all(promisArr)
    loading('正在保存')
    for (let i = 0; i < localList.length; i++) {
      await Taro.saveImageToPhotosAlbum({ filePath: localList[i].tempFilePath })
    }
    stop()
    // toast('保存成功')
    Taro.showToast({
      title: '保存成功',
    })
  } catch (err) {
    stop()
    toast(err.errMsg || err)
    throw {
      message: err.errMsg || err
    }
  }
}

/**
 * save fileUrl to local
 * @param {*} url
 */
export const saveToFile = async url => {
  switch (process.env.TARO_ENV) {
    // platform rn start
    case 'rn': {
      try {
        await crequestMultiplePermission()
        toast('文件加载中 请稍后')
        const { tempFilePath } = await Taro.downloadFile({ url })
        if (Platform.OS === 'android') {
          const tempFilePathArr = tempFilePath.split('/')
          await RNFS.moveFile(tempFilePath, RNFS.DownloadDirectoryPath + '/' + tempFilePathArr[tempFilePathArr.length - 1])
          toast('文件已保存至Download目录下')
        } else {
          await Share.open({
            url: tempFilePath,
            saveToFiles: true
          })
          toast('保存成功')
        }
      } catch (error) {
        console.warn('保存失败', error)
      }
      break
    }
    // platform rn end
    default: {
      break
    }
  }
}

/**
 * 将base64格式的图片保存到相册
 * @param {string} data
 */
export const base64ImageToPhoto = async (data, ext = 'jpg') => {
  if (process.env.TARO_ENV === 'rn') {
    const filePath = RNFS.CachesDirectoryPath + '/temp.' + ext
    await RNFS.writeFile(filePath, data, 'base64')
    await Taro.saveImageToPhotosAlbum({ filePath })
    Taro.showToast({
      title: '已保存到相册',
    })
  }
}

/**
 * 节流函数
 * @param {*} func
 * @param {*} wait
 * @returns
 */
export const debounce = (func, wait) => {
  let timeout = null
  let oldReject
  return (...arg) => {
    return new Promise((resolve, reject) => {
      if (timeout) {
        clearTimeout(timeout)
        oldReject('节流过滤')
      }
      oldReject = reject
      timeout = setTimeout(() => func?.(...arg)?.then(resolve)?.catch(reject), wait)
    })
  }
}

/**
 * 判断页面是否卸载的hook
 * @returns
 */
export const useMounted = () => {
  const mountedRef = useRef(false)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])
  return () => mountedRef.current
}
