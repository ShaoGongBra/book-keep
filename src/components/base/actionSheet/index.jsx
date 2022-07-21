import { useCallback, useState, forwardRef, useImperativeHandle, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import { PullView, ScrollView } from 'taro-design/components'
import './index.scss'

export const ActionSheet = forwardRef(({ }, ref) => {

  const pullView = useRef([])

  const callback = useRef([])

  const [show, setShow] = useState(false)
  const [list, setList] = useState([])

  useImperativeHandle(ref, () => ({
    show: arr => {
      setList(arr)
      setShow(true)
      return new Promise((resolve, reject) => {
        callback.current = [resolve, reject]
      })
    }
  }))

  const itemClick = useCallback((item, index) => {
    pullView.current.close()
    callback.current[0]?.({
      item,
      index
    })
  }, [])

  const close = useCallback(() => {
    setShow(false)
    callback.current[1]?.()
  }, [])

  return show ?
    <PullView ref={pullView} onClose={close}>
      <View className='action-sheet'>
        <View className='action-sheet__title'>请选择</View>
        <ScrollView>
          {
            list.map((item, index) => <View key={item}
              className='action-sheet__item'
              onClick={itemClick.bind(null, item, index)}
            >
              <Text className='action-sheet__item__text'>{item}</Text>
            </View>)
          }
        </ScrollView>
      </View>
    </PullView>
    : null
})
