import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'

import './index.scss'

export default ({ index, onSwitch, list, scroll = false, showLine = true, textStyle = {}, lineStyle = {}, style = {} }) => {

  const [select, setSelect] = useState(0)

  useEffect(() => {
    setSelect(index)
  }, [index])

  const change = useCallback(i => {
    setSelect(i)
    const item = list[i]
    item.index = i
    onSwitch && onSwitch(item)
  }, [list, onSwitch])

  const { theme } = global

  return (
    <View className='tab-root' style={style}>
      {scroll ?
        <ScrollView scrollX>
          <View className='tab__scroll'>
            {list.map((item, i) => <View
              key={item.text}
              className={[
                'tab__scroll__item',
                i == 0 && 'tab__scroll__item--first',
                i == list.length - 1 && 'tab__scroll__item--last'
              ].join(' ')}
              onClick={() => change(i)}
            >
              <Text
                className='tab__scroll__item__text'
                style={{ color: i == select ? theme.tabHoverTextColor : theme.tabTextColor, ...textStyle }}
              >{item.text}</Text>
              {showLine && <View
                className='tab__scroll__item__line'
                style={{ backgroundColor: i == select ? theme.tabHoverLineColor : 'transparent', ...lineStyle }}
              />}
            </View>)}
          </View>
        </ScrollView> :
        <View className='tab'>
          {list.map((item, i) => <View
            key={item.text}
            className='tab__item'
            onClick={() => change(i)}
          >
            <Text
              className='tab__item__text'
              style={{ color: i == select ? theme.tabHoverTextColor : theme.tabTextColor }}
            >{item.text}</Text>
            {showLine && <View
              className='tab__item__line'
              style={{ backgroundColor: i == select ? theme.tabHoverLineColor : 'transparent', ...lineStyle }}
            />}
          </View>)}
        </View>
      }
    </View>
  )
}
