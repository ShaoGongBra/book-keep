import { useCallback, useState, useEffect, useMemo, useRef } from 'react'
import Taro, { useDidHide, useDidShow } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { TopView, Icon } from '@/components'
import { nav, setNavigationBarTitle, isLogin, login } from '@/utils'
import Protocol from '../protocol'
import './index.scss'

let Platform, BackHandler

if (process.env.TARO_ENV === 'rn') {
  const RN = require('react-native')
  Platform = RN.Platform
  BackHandler = RN.BackHandler
}

const components = {}

const TabbarItem = ({
  item,
  hover,
  index,
  onClick,
  length
}) => {
  const showIcon = useMemo(() => (hover && !!item.iconHover) || (!hover && !!item.icon), [hover, item])
  const showImage = useMemo(() => ((hover && !item.iconHover && !!item.imageHover) || (!hover && !item.icon && !!item.image)), [hover, item])
  const showText = useMemo(() => (hover && !!item.textHover) || (!hover && !!item.text), [hover, item])

  const itemClick = useCallback(() => {
    onClick(index)
  }, [index, onClick])

  return <View className='tabbar-menu__item' onClick={itemClick}>
    {showIcon && <Icon
      name={hover ? (!!item.iconHover ? item.icon : item.iconHover) : item.icon}
      style={{
        fontSize: Taro.pxTransform(showText ? 50 : 128),
        color: hover ? (item.iconColorHover || item.iconColor) : item.iconColor
      }}
    />}
    {
      showImage && <Image className={showText ? 'tabbar-menu__item__image' : 'tabbar-menu__item__image--max'} src={hover ? (item.imageHover === undefined ? item.image : item.imageHover) : item.image} />
    }
    {
      showText &&
      <Text
        className='tabbar-menu__item__name'
        style={{
          color: hover ? (item.textColorHover || item.textColor) : item.textColor
        }}
      >{hover ? (item.textHover || item.text) : item.text}</Text>
    }
    {item.point && item.number < 1 && <View style={{ marginRight: Taro.pxTransform(750 / length / 2) }} className='tabbar-menu__item__point' />}
    {item.number > 0 && <View style={{ marginRight: Taro.pxTransform(750 / length / 2) }} className='tabbar-menu__item__number'>
      <Text className='tabbar-menu__item__number__text'>{item.number > 99 ? '99+' : item.number}</Text>
    </View>}
  </View>
}

const usePageShow = () => {
  const [show, setShow] = useState(false)
  useDidShow(() => setShow(true))
  useDidHide(() => setShow(false))
  return show
}

const Tabbar = ({
  list: originalList = [],
  config = {},
  pages = {},
  defaultSelect = -1,
  tabbarKey,
  style,
  renderHeader,
  onlyShowHeader,
  onClick,
  onSwich,
  onProtocol
}) => {

  const [list, setList] = useState([])

  const [select, setSelect] = useState(defaultSelect | 0)

  const [load, setLoad] = useState([])

  const pageShow = usePageShow()

  useEffect(() => {
    tabbar.switch(select, tabbarKey)
  }, [select, tabbarKey])

  useEffect(() => {
    let selectInit = 0
    let selectFlag = false
    const tabbar = originalList.filter(item => {
      return ['link', 'component', 'click'].includes(item.type)
        && (item.type === 'link' || item.type === 'click' || components[item.control] || pages[item.control])
    })
    setList(tabbar)
    for (let i = 0, l = tabbar.length; i < l; i++) {
      // 找到第一个不是链接的组件
      const item = tabbar[i]
      if (item.type === 'link' && !selectFlag && i === selectInit) {
        selectInit++
      } else if (item.type !== 'link', i === selectInit) {
        selectFlag = true
      }
    }
    setSelect(res => {
      if (res !== -1 && tabbar[res]?.type === 'component') {
        return res
      }
      return selectInit
    })
  }, [originalList, pages])

  useEffect(() => {
    setNavigationBarTitle(list[select]?.title || list[select]?.text || '')
  }, [list, select])

  // 让tabbar触发更改
  const itemClick = useCallback(index => tabbar.change(index, tabbarKey), [tabbarKey])

  const changeTabbar = useCallback(async index => {
    const _index = Math.min(list.length - 1, Math.max(0, index))
    if (select === _index) {
      return
    }
    const item = list[_index]
    if (item.type === 'link') {
      nav(item.url)
      return
    } else if (item.type === 'click') {
      onClick?.(index)
      return
    }
    if (item.login && !isLogin()) {
      await login()
    }
    setSelect(_index)
    onSwich?.(_index)
  }, [list, select, onClick, onSwich])

  useEffect(() => {
    if (tabbarKey) {
      const res = tabbar.onSetNumber((key, num) => {
        const isIndex = typeof key === 'number'
        setList(old => {
          const item = isIndex ? old[key] : old.find(v => v.control === key)
          if (num === 0) {
            item.point === false
            item.number = 0
          } else if (num < 0) {
            item.point === true
          } else {
            item.number = num
          }
          return [...old]
        })
      }, tabbarKey)
      return () => res.remove()
    }
  }, [tabbarKey])

  useEffect(() => {
    if (tabbarKey) {
      // 控制tabbar切换
      const res = tabbar.onChange((key => {
        if (typeof key === 'number') {
          changeTabbar(key)
        } else {
          changeTabbar(list.findIndex(item => item.control === key))
        }
      }), tabbarKey)
      return () => res.remove()
    }
  }, [list, changeTabbar, tabbarKey])

  useEffect(() => {
    if (process.env.TARO_ENV === 'rn' && Platform.OS === 'android' && pageShow && tabbarKey === 'index') {
      const res = BackHandler.addEventListener('hardwareBackPress', () => {
        if (select > 0) {
          changeTabbar(0)
        } else {
          BackHandler.exitApp()
        }
        return true
      })
      return () => res.remove()
    }
  }, [tabbarKey, select, pageShow, changeTabbar])

  useEffect(() => {
    ~select && setLoad(res => res.includes(select) ? res : [...res, select])
  }, [select, pages])

  return <TopView isSafe>
    {renderHeader}
    <View className={`tabbar-page${onlyShowHeader ? ' tabbar-page--hidden' : ''}`} style={style}>
      {
        list.map((item, index) => {
          const component = components[item.control] || pages[item.control]
          const Item = component && load.includes(index) ? component : null
          return <View key={'tabbar' + index} className={['tabbar-page__item', select === index && 'tabbar-page__item--hover'].join(' ')}>
            {!!Item && <Item {...item.controlData} tabbarIndex={index} />}
          </View>
        })
      }
    </View>
    {!onlyShowHeader && <View className='tabbar-menu'>
      {
        list.map((item, index) => <TabbarItem
          key={'tabbar' + index}
          item={{ ...config, ...item }}
          hover={index === select}
          length={list.length}
          index={index}
          onClick={itemClick}
        />)
      }
    </View>}
    {tabbarKey === 'index' && <Protocol mask firstShow onSubmit={onProtocol} />}
  </TopView>
}

Tabbar.definePages = data => {
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      components[key] = data[key]
    }
  }
}

export const tabbar = {
  callbacks: {},
  set(key, tabbarKey, ...arg) {
    this.callbacks[key]?.[tabbarKey]?.map(callback => callback(...arg))
  },
  on(key, tabbarKey, callback) {
    if (!this.callbacks[key]) {
      this.callbacks[key] = {}
    }
    const list = this.callbacks[key][tabbarKey] = this.callbacks[key][tabbarKey] || []
    list.push(callback)
    return {
      remove: () => {
        list.splice(list.indexOf(callback), 1)
      }
    }
  },

  switchSelects: {},
  /**
   * 导航发生切换时将会调用此方法，请勿在其他地方调用
   * @param {number} index
   * @param {string} tabbarKey
   */
  switch(index, tabbarKey) {
    this.switchSelects[tabbarKey] = index
    this.set('switch', tabbarKey, index)
  },
  onSwich(callback, tabbarKey) {
    return this.on('switch', tabbarKey, callback)
  },
  /**
   * 切换tabbar
   * @param {number|string} key 设置数字表示index 从0开始 设置组件标识将查找组件
   * @param {string} tabbarKey tabbar标识
   */
  change(key, tabbarKey = 'index') {
    this.set('change', tabbarKey, key)
  },
  onChange(callback, tabbarKey) {
    return this.on('change', tabbarKey, callback)
  },
  /**
   * 设置导航上的数量或者红点
   * @param {number|string} key 设置数字表示index 从0开始 设置组件标识将查找组件
   * @param {number} num 小于0设置红点 等于0清空 大于0设置数字
   * @param {string} tabbarKey tabbar标识
   */
  numbers: {},
  setNumber(key, num, tabbarKey = 'index') {
    if (!this.numbers[tabbarKey]) {
      this.numbers[tabbarKey] = {}
    }
    this.numbers[tabbarKey][key] = num
    this.set('number', tabbarKey, key, num)
  },
  onSetNumber(callback, tabbarKey) {
    return this.on('number', tabbarKey, callback)
  }
}

export const useTabbarNumber = (key, tabbarKey = 'index') => {

  const [number, setNumber] = useState(tabbar.numbers[tabbarKey]?.[key] || 0)

  useEffect(() => {
    const res = tabbar.onSetNumber((setKey, num) => {
      if (setKey === key) {
        setNumber(num)
      }
    }, tabbarKey)
    return () => res.remove()
  }, [key, tabbarKey])

  return number
}

export const useTabbarShow = (callback, index, tabbarKey = 'index') => {
  const cb = useRef()
  // 调用的次数
  const count = useRef(0)

  cb.current = callback

  useDidShow(() => {
    index === tabbar.switchSelects[tabbarKey] && cb.current('page', count.current++)
  })

  useEffect(() => {
    const res = tabbar.onSwich(_index => {
      if (_index === index) {
        cb.current('switch', count.current++)
      }
    }, tabbarKey)
    cb.current('init', count.current++)
    return () => res.remove()
  }, [index, tabbarKey])
}

export const useTabbarHide = (callback, index, tabbarKey = 'index') => {
  const cb = useRef()
  // 调用的次数
  const count = useRef(0)

  cb.current = callback

  const before = useRef(tabbar.switchSelects[tabbarKey])

  useDidHide(() => {
    index === tabbar.switchSelects[tabbarKey] && cb.current('page', count.current++)
  })

  useEffect(() => {
    const res = tabbar.onSwich(_index => {
      if (before.current === index && _index !== index) {
        cb.current('switch', count.current++)
      }
      before.current = _index
    }, tabbarKey)
    return () => res.remove()
  }, [index, tabbarKey])
}

export default Tabbar
