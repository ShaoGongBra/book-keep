import { Component } from 'react'
import { HtmlView } from 'taro-html-view'
import { View, Text } from '@tarojs/components'
import { PullView, ScrollView } from 'taro-design/components'
import { request } from 'taro-tools'
import './pop.scss'

export default class RichTextComp extends Component {

  state = {
    show: false,
    title: '',
    content: ''
  }

  /**
   * 显示底部弹窗的文本内容
   * @param {*} title
   * @param {*} content
   * @param {*} type
   * @param {*} key
   */
  show(title, content = '', type = 'text', key = 'data') {
    this.setState({
      title,
      show: true
    })
    if (type === 'text') {
      this.setState({
        content
      })
    } else if (type === 'url') {
      request(content).then(res => {
        this.setState({
          content: res[key]
        })
      })
    }
  }

  render() {
    const { show, title, content = '' } = this.state
    return show && <PullView ref={ref => this.pullRef = ref} onClose={() => this.setState({ show: false })}>
      <View className='richtext-pop'>
        {!!title && <View className='richtext-pop__title'>
          <Text className='richtext-pop__title__text'>{title}</Text>
        </View>}
        <ScrollView>
          <HtmlView html={content} />
        </ScrollView>
      </View>
    </PullView>
  }
}
