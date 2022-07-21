import { useCallback, useState, forwardRef, useImperativeHandle, useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import { Absolute, Icon } from 'taro-design/components'
import { Layout, getRect } from '../layout'
import './index.scss'

let classKey = 0

const DropDown = forwardRef(({
  children,
  renderContent,
  menuList,
  onSelect,
  rangeKey = 'text',
  select,
  className,
  ...props
}, ref) => {

  useImperativeHandle(ref, () => ({
    close: () => setShow(false)
  }))

  const currentClass = useMemo(() => `dorpdown-${classKey++}`, [])

  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({
    left: 0,
    top: 0,
    opacity: 0
  })

  const click = useCallback(() => {
    getRect('.' + currentClass).then(res => {
      setPosition({ left: res.left, top: res.top + res.height, opacity: 0 })
      setShow(true)
    })
  }, [currentClass])

  const close = useCallback(() => {
    setShow(false)
  }, [])

  const submit = useCallback((item, index) => {
    if (select === index) {
      return
    }
    setShow(false)
    setTimeout(() => {
      onSelect?.({ item, index })
    }, 150)
  }, [onSelect, select])

  const menuLayout = useCallback(layout => {
    (async () => {
      const { windowWidth: width, windowHeight: height } = global.systemInfo
      const newposition = { ...position, opacity: 1 }
      // 此处需要修改
      const { left: x, top: y, width: viewWidth, height: viewHeight } = await getRect('.' + currentClass)

      if (position.left + layout.width > width) {
        newposition.left = width - layout.width - (width - x - viewWidth)
      }
      if (position.top + layout.height > height) {
        newposition.top = height - layout.height - (height - y - viewHeight)
      }
      setPosition(newposition)
    })()
  }, [currentClass, position])

  return <>
    <View className={`${className} ${currentClass}`} {...props} onClick={click}>
      {children}
    </View>
    {show && <Absolute>
      <View className='dropdown__mask' onClick={close} />
      <Layout className='dropdown__main' onLayout={menuLayout} style={position}>
        {
          renderContent ||
          menuList?.map((item, index) => {
            if (item.type === 'line') {
              return <View className='dropdown__item--line' />
            }
            return <View className={`dropdown__item${select === index ? ' dropdown__item--select' : ''}`} key={item[rangeKey] || item} onClick={submit.bind(null, item, index)}>
              {!!item.icon && <Icon name={item.icon} size={36} />}
              <Text className='dropdown__item__text'>{item[rangeKey] || item}</Text>
              {select === index && <Icon name='duihao' size={48} color='#F23E39' />}
            </View>
          })
        }
      </Layout>
    </Absolute>}
  </>
})
export default DropDown
