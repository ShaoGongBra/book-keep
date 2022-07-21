
const config = {
  /**
   * 蒲公英上传测试包key
   * 请到蒲公英获取下面两个参数并配置
   */
  pgyer: {
    apiKey: '14752410a0adf2c4c91887d96d1ec34e',
    userKey: '2034e37bf1886b98e67dd30450fcfc1d'
  },
  /**
   * ios上传相关配置
   */
  ios: {
    // 项目目录 默认为 duxapp
    dirName: 'duxapp',
    // 应用商店上传账号
    account: 'yanglixia3337@dingtalk.com',
    // 不是账号密码，是在账户中心生成的密码
    password: 'efyt-ogrf-szgx-hieg',
    // 创建证书等操作
    issuerId: 'c516ef5e-5918-4620-9ae0-f61096c794c9',
    keyId: 'RSV8TAD26A',
    keyPath: 'AuthKey_RSV8TAD26A.p8',
    // 导出配置文件
    exportOptionsPlist: 'ExportOptions.plist'
  },
  /**
   * coding创建项目控制
   */
  coding: {
    token: '48c6ecd6e67db5332d611b12865f5e48edb4cb77',
    /**
     * 需要添加到当前项目的成员
     * 用手机号或邮箱
     */
    members: ['2055194659@qq.com', 'chenchao19901028@qq.com', '908634674@qq.com', '414912067@qq.com', '2300183447@qq.com', '2073620106@qq.com']
  },
  /**
   * 热更新上传控制
   * 安卓和ios独立控制 设置common为公共参数
   * {
   *  token：账户设置中心生成的token
   *  account：上传的账号
   *  version：当前代码需要的原生app版本
   *  name：appcenter上的应用名称 不填写默认为package.json的 name + '-' + (ios或者android)
   * }
   */
  codePush: {
    common: {
      token: '09a115a7a099eafe25f32fcf5281ac257aa25aff',
      account: 'xj908634674-live.com',
      version: '^1.0.0'
    },
    android: {},
    ios: {}
  }
}

module.exports = config
