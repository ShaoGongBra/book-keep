/**
 * login:是否需要登录
 * platform:支持的平台(weapp, h5, rn)不配置支持所有
 * subPackage:是否将其设置为分包
 */
const config = {
  // 跳转时打印跳转路径
  log: true,
  pages: {
    'main/index': {
      login: false,
      pages: {
        index: {}
      }
    }
  }
}

module.exports = config
