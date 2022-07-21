import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { connect } from 'react-redux'
import { Icon, Button } from '@/components'
import { login } from '@/utils'
import './index.scss'

class AtuhLogin extends Component {

  render() {
    const { title = '使用此功能需要登陆', icon = 'fuhao-zhuangtai-tishi', userInfo } = this.props
    return !userInfo.loginStatus ?
      <View className='auth-login'>
        <Icon name={icon} color='#333' size={90} />
        <Text className='auth-login__title'>{title}</Text>
        <Button size='l' text='去登陆' onClick={() => login().catch(() => { })} style={{ marginTop: Taro.pxTransform(40) }} />
      </View> :
      this.props.children
  }
}

export default connect(({ userInfo }) => ({
  userInfo
}))(AtuhLogin)
