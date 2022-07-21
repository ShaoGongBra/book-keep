import { useCallback, useEffect, useRef, useState } from 'react'
import { Tabbar } from '@/components'
import { useRouter } from '@tarojs/taro'
import { duxPushInit, getConfig } from '@/utils'
// module chat start
import Message from '../message/index_component'
// module chat end
// module shop start
import Category from '../goods/category_component'
import Cart from '../cart/index_component'
// module shop end
// module quick start
import Quick from '../quick/index_component'
// module quick end
// module diy start
import Diy from '../diy/index_component'
// module diy end

import './index.scss'

const pages = {
  // module chat start
  message: Message,
  // module chat end
  // module shop start
  category: Category,
  cart: Cart,
  // module shop end
  // module quick start
  quick: Quick,
  // module quick end
  // module diy start
  diy: Diy
  // module diy end
}

Tabbar.definePages(pages)

export default () => {
  const { params } = useRouter()

  const jpush = useRef(undefined)

  const [list, setList] = useState([])

  useEffect(() => {
    getConfig().then(res => {
      setList(res.tabbar)
    })
    return () => jpush.current?.()
  }, [])

  const protocol = useCallback(() => {
    jpush.current = duxPushInit()
  }, [])

  return <>
    <Tabbar
      tabbarKey='index'
      pages={pages}
      list={list}
      defaultSelect={params.tabbar}
      style={{ backgroundColor: '#F1F6FF' }}
      onProtocol={protocol}
    />
  </>

}
