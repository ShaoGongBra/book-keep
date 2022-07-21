import { Component } from 'react'
import { Provider } from 'react-redux'
import initStore from './redux/store'
import { startParams, initConfig } from './utils/init'
import { initUserInfo } from './utils/user'
import {
  codePushHigh,
  startHide,
  // react-native-wechat-lib start
  wechatInit
  // react-native-wechat-lib end
} from './utils/rn'

import './app.scss'

startHide()

const store = initStore()
class App extends Component {

  async UNSAFE_componentWillMount() {
    // react-native-wechat-lib start
    wechatInit()
    // react-native-wechat-lib end
    const params = startParams(this)
    // 初始化用户信息
    await initUserInfo()
    // 初始化配置信息
    initConfig(params)
  }

  componentDidMount() {
    // startHide()
  }

  componentWillUnmount() {

  }

  componentDidShow() {
    startParams(this)
  }

  // this.props.children 是将要会渲染的页面
  render() {
    return <Provider store={store}>
      {this.props.children}
    </Provider>
  }
}

export default codePushHigh(App)
