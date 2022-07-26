import Taro from '@tarojs/taro'
import { toast } from '@/utils'
/**
 * 调用支付
 * @param {*} type 支付类型
 * @param {*} option 支付参数
 */
export const pay = async (type, option) => {
  if (type !== 'wechat_miniapp') {
    throw '不支持的支付方式:' + type
  }
  const weappPayInfo = await Taro.requestPayment({
    timeStamp: option.timeStamp,         //时间戳，自1970年以来的秒数
    nonceStr: option.nonceStr, //随机串
    package: option.package,
    signType: option.signType,         //微信签名方式：
    paySign: option.paySign, //微信签名
  })
  if (weappPayInfo.errMsg !== "requestPayment:ok") {
    toast(weappPayInfo.errMsg)
    throw weappPayInfo.errMsg
  }
}
