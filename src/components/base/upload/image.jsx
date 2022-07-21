import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { Icon } from '@/components'
import { toast, upload } from '@/utils'
import './image.scss'

export default class UploadImage extends Component {

  add() {
    const { value = [], max = 9 } = this.props
    if (value.length >= max) {
      toast('最多上传' + max + '张')
      return
    }
    upload('image', {
      count: max - value.length,
      sizeType: ['compressed']
    }).then(res => {
      value.push(...res)
      this.props.onChange && this.props.onChange(value)
    })
  }

  del(index) {
    const { value = [] } = this.props
    value.splice(index, 1)
    this.props.onChange && this.props.onChange(value)
  }

  render() {
    const { value = [], disable } = this.props
    return (
      <View className='upload-image'>
        {!disable && <View activeOpacity={1} className='upload-image__add' onClick={this.add.bind(this)}>
          <Icon name='tupian' size={60} color='#aaa' />
          <Text className='upload-image__add__text'>添加图片</Text>
        </View>}
        {
          value.map((item, index) => <View key={item} className='upload-image__item'>
            <Image className='upload-image__item__image' src={item} />
            {!disable && <Icon style={{ position: 'absolute', top: Taro.pxTransform(-10), right: Taro.pxTransform(-10) }} name='guanbi' size={40} color='#aaa' onClick={this.del.bind(this, index)} />}
          </View>)
        }
      </View>
    )
  }
}
