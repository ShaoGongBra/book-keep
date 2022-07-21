// react-native-wechat-lib start
import * as WeChat from 'react-native-wechat-lib'
// react-native-wechat-lib end
// react-native-alipay start
import Alipay from '@0x5e/react-native-alipay'
// react-native-alipay end
import { toast } from '@/utils'

export const pay = async (type, option) => {
  switch (type) {
    // react-native-wechat-lib start
    case 'wechat_app': {
      // 微信app支付
      const wxInstall = await WeChat.isWXAppInstalled()
      if (!wxInstall) {
        toast('您的设备上未检测到微信客户端')
        throw '您的设备上未检测到微信客户端'
      }
      const payRes = await WeChat.pay(option)
      if (payRes.errCode == 0) {
        return
      } else {
        toast(payRes.errStr)
        throw payRes.errStr
      }
    }
    // react-native-wechat-lib end
    // react-native-alipay start
    case 'alipay_app': {
      // 支付宝支付
      try {
        // 打开沙箱
        // const orderStr = 'app_id=xxxx&method=alipay.trade.app.pay&charset=utf-8&timestamp=2014-07-24 03:07:50&version=1.0&notify_url=https%3A%2F%2Fapi.xxx.com%2Fnotify&biz_content=%7B%22subject%22%3A%22%E5%A4%A7%E4%B9%90%E9%80%8F%22%2C%22out_trade_no%22%3A%22xxxx%22%2C%22total_amount%22%3A%229.00%22%2C%22product_code%22%3A%22QUICK_MSECURITY_PAY%22%7D&sign_type=RSA2&sign=xxxx' // get from server, signed
        const response = await Alipay.pay(option)

        const { resultStatus, result, memo } = response
        if (9000 != resultStatus) {
          throw { message: memo }
        }
        const { code, msg } = JSON.parse(result).alipay_trade_app_pay_response
        if (10000 != code) {
          throw msg
        }
        return
      } catch (error) {
        toast(error.message || '发生错误')
        throw error.message || '发生错误'
      }
    }
    // react-native-alipay end
    default: {
      toast('不支持的支付方式')
      throw '不支持的支付方式'
    }
  }
}
