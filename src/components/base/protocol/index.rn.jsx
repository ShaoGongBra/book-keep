import { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { nav, toast } from '@/utils'

// 用户协议弹窗
export default class Protocol extends Component {

  constructor(props) {
    super(props);
    const { hideBtn, firstShow = false, onSubmit } = props
    this.state = {
      show: false,
      text: [
        {
          text: '请你务必审慎约阅读、充分理解“服务协议”和“隐私政策的各项条款”，包括但不限于为了向你提供内容分享等服务，我们需要向你的设备收集设备信息、操作日志个人信息。\n你可以阅读',
        },
        {
          text: '《服务协议》和《隐私政策》',
          url: 'main/common/richtext?url=member/Register/privacyPolicy?title=用户协议和隐私政策'
        },
        {
          text: '了解详细信息。' + (hideBtn ? '' : '如你同意，请点击同意开始接受我们的服务。')
        }
      ]
    }
    firstShow && AsyncStorage.getItem('ProtocolStatus').then(status => {
      !!status && onSubmit?.()
      this.setState({
        show: !status
      })
    })
  }

  show() {
    this.setState({ show: true })
  }

  setProtocolStatus() {
    this.setState({
      show: false
    })
    const { firstShow = false, onSubmit } = this.props
    onSubmit?.()
    firstShow && AsyncStorage.setItem('ProtocolStatus', '1')
  }

  render() {
    const { text, show } = this.state
    const { hideBtn, mask } = this.props
    return (
      show && <TouchableOpacity style={styles.serviceRoot} activeOpacity={1} onPress={() => !mask && this.setState({ show: false })}>
        <TouchableOpacity style={styles.service} activeOpacity={1} onPress={() => { }}>
          <Text style={{ color: '#333', marginBottom: 20, textAlign: 'center', marginTop: 10 }}>服务协议和隐私政策</Text>
          <Text style={{ color: '#555', fontSize: 14, lineHeight: 24 }}>
            {
              text.map((item, index) => <Text key={index} onPress={() => nav(item.url)} style={{ color: item.url ? '#60bff8' : '#555' }}>{item.text}</Text>)
            }
          </Text>
          {!hideBtn && <View style={styles.btns}>
            <Text style={styles.btn} onPress={() => toast('不同意 请手动退出app')}>不同意</Text>
            <Text style={[styles.btn, { color: '#60bff8' }]} onPress={() => this.setProtocolStatus()}>同意并继续</Text>
          </View>}
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  serviceRoot: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  service: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 5
  },
  btns: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20
  },
  btn: {
    flex: 1,
    textAlign: 'center'
  }
})
