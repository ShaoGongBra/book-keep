import { View } from '@tarojs/components'
import { useCallback } from 'react'

const Layout = ({ children, onLayout, ...props }) => {

  const layout = useCallback(e => {
    onLayout?.({
      ...e.nativeEvent.layout,
      left: e.nativeEvent.layout.x,
      top: e.nativeEvent.layout.y
    })
  }, [onLayout])

  return <View onLayout={layout} {...props}>
    {children}
  </View>
}

export {
  Layout
}
