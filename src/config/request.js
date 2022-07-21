
import { setRequestConfig, requestMiddle, request, toast, asyncTimeOut } from 'taro-tools'
import Taro from '@tarojs/taro'
import hmacSHA1 from 'crypto-js/hmac-sha1'
import Base64 from 'crypto-js/enc-base64'
import { login } from '@/utils/user'
import { nav } from '@/utils'

/**
 * 请求配置
 */
const config = {
  origin: 'https://shop.tonglao.com.cn',
  path: 'a', // 域名二级目录
  secret: 'f34f01e53f0d21d9245c3f2771d1b183', // 站点token
  appid: '1651593048279300',
  devOpen: false,
  devToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvamYuY2xpZW50Lmp1amlhbmcubWUiLCJhdWQiOiJodHRwczpcL1wvamYuY2xpZW50Lmp1amlhbmcubWUiLCJpYXQiOjE2NDUxNTM1MjksIm5iZiI6MTY0NTE1MzUyOSwiZGF0YSI6NX0.G28XchnZAkyYRBFVZFhT7qNroFH-fl6U5ml3deM3b2I'
  // devToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9tc2pmLmNvbSIsImF1ZCI6Imh0dHA6XC9cL21zamYuY29tIiwiaWF0IjoxNjQzMTY2OTgzLCJuYmYiOjE2NDMxNjY5ODMsImRhdGEiOjJ9.RxuNaH7gva8ybWK2aCteuL-NTsducNSQ8QE_oDjJPy4'
}

export default config

export const initRequestConfig = () => {
  setRequestConfig({
    request: {
      origin: config.origin,
      path: config.path,
      header: () => {
        let { token: userToken = '' } = global.userInfo
        const token = Base64.stringify(hmacSHA1(config.appid + config.secret, config.secret))
        // 开启调试
        config.devOpen && (userToken = config.devToken)
        return {
          Authorization: `Dux ${config.appid}:${token}:${userToken}`,
          'X-Dux-Platform': global.platform,
          'X-Ajax': '1'
        }
      }
    },
    result: {
      code: 'statusCode',
      data: ['data', 'result'],
      message: res => {
        if (res.statusCode === 200) {
          return res.data.message
        }
        return res.data
      }
    },
    upload: {
      api: 'member/Upload/index',
      resultField: ['data', 'result', 0, 'url']
    }
  })
  requestMiddle.result(async (res, params) => {
    if (res.statusCode === 401) {
      await login()
      return request(params)
    } else if (res.statusCode === 501) {
      // 302跳转
      const msgParams = res.data.split('|')
      if (msgParams[2]) {
        const { confirm } = await Taro.showModal({
          title: '提示',
          content: msgParams[0],
        })
        confirm && await nav(msgParams[1])
      } else if (msgParams[0]) {
        toast(msgParams[0])
        await asyncTimeOut(800)
        await nav(msgParams[1])
      } else {
        await nav(msgParams[1])
      }
      throw { code: 302, message: msgParams[0] }
    } else if (res.statusCode === 200) {
      return res.data.result
    }
    throw {
      code: res.statusCode,
      message: res.data
    }
  })
}
