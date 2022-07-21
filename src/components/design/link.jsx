import { View } from '@tarojs/components'
import { useCallback } from 'react'
import { nav } from '@/utils'

export default function Link({
  url,
  className,
  style,
  onClick,
  children
}) {

  const click = useCallback(() => (nav(url), onClick?.()), [url, onClick])

  return <View onClick={click} style={style} className={className}>
    {children}
  </View>
}
