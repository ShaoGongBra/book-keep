import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Icon, Text } from '@/components'
import { getContrastYIQ, getPathPosition, nav } from '@/utils'

import './index.scss'

export default class TopHeader extends Component {

  state = {
    statusBarHeight: 0,
    headerHeihgt: 44,
    isBack: false,
    isBackHome: false,
    jiaonangWidth: 0,
  }

  componentDidMount() {
    let jiaonangWidth = 0
    // 获取胶囊信息
    if (process.env.TARO_ENV === 'weapp') {
      const { width } = Taro.getMenuButtonBoundingClientRect()
      jiaonangWidth = width + 10
    }
    // const jiaonangWidth = 200
    const { statusBarHeight = 0 } = global.systemInfo
    const { pages, paths } = getPathPosition('main/index/index')
    this.setState({
      statusBarHeight,
      isBack: pages.length > 1,
      isBackHome: paths[0] === undefined,
      jiaonangWidth
    })
  }

  textColor = ''

  render() {
    const { theme } = global
    const { statusBarHeight, headerHeihgt, isBack, isBackHome, jiaonangWidth, } = this.state
    const {
      title, // 标题
      leftTitle, //左标题
      showLine = theme.headerShowLine, // 隐藏分割线
      absolute = false, // 是否使用绝对定位，不占位置
      show = true, // 是否显示配合absolute使用，直接使用则会直接出现
      style = {},
      renderMain = false, // 是否替换头部中间部分
      renderHeader, // 是否替换头部整个头部
      renderRight,// 右侧组件
      showStatus,// 使用了absolute的情况下时候显示status状态栏
      titleCenter, // 强制让title显示在中间
      onBackClick
    } = this.props
    const bgColor = style.backgroundColor || theme.headerColor
    const textColor = getContrastYIQ(bgColor)
    const rn = process.env.TARO_ENV === 'rn'
    const h5 = process.env.TARO_ENV === 'h5'
    const weapp = !rn && !h5
    // 是否显示header
    const showHeader = rn || process.env.TARO_ENV === 'weapp' || (global.platform === 'wechat' && theme.headerShowWechat)
      || (global.platform === 'wap' && theme.headerShowWap)
      || !!renderMain || !!renderHeader
    // 动态设置导航栏文字颜色

    if (this.textColor !== textColor) {
      this.textColor = textColor
      // rn端报错
      setTimeout(() => {
        // Taro.setNavigationBarColor({
        //   frontColor: textColor === 'white' ? '#ffffff' : '#000000',
        //   backgroundColor: 'transparent',
        //   animation: {
        //     duration: 400,
        //     timingFunc: 'easeIn'
        //   }
        // })
      }, 100)
    }

    const showHeight = headerHeihgt + (showStatus ? 0 : rn ? statusBarHeight : h5 ? 0 : statusBarHeight)

    return showHeader ? <>
      {showStatus && <View
        style={{
          height: rn
            ? statusBarHeight
            : h5
              ? 0
              : `${statusBarHeight}px`,
          backgroundColor: theme.headerColor
        }}
      />}
      <View className={`header${showLine ? ' header--show-line' : ''}${absolute ? ' header--absolute' : ''}`}>
        {(!absolute || rn) && <View
          style={{
            height: rn
              ? showHeight
              : `${showHeight}px`
          }}
        />}
        <View style={{ backgroundColor: theme.headerColor, ...style }} className={`header__main${show ? ' header__main--show' : ''}`}>
          {
            rn
              ? <View style={{ height: statusBarHeight }} />
              : <View style={{ height: `${statusBarHeight}px` }} />
          }
          {
            renderHeader ||
            <View
              className='header__nav'
              style={{
                height: rn ? headerHeihgt : h5 ? Taro.pxTransform(88) : `${headerHeihgt}px`
              }}
            >
              {(isBack || isBackHome) && <View
                className='header__nav__left'
                style={weapp ? { width: Taro.pxTransform(80) } : {}}
                onClick={() => {
                  if (onBackClick?.()) {
                    return
                  }
                  isBack ? nav('back:') : isBackHome ? nav('back:home') : ''
                }}
              >
                {isBack && <Icon name='zuo2' size={42} color={textColor} style={{ marginLeft: Taro.pxTransform(20) }} />}
                {!isBack && isBackHome && <Icon name='zhuye' size={42} color={textColor} style={{ marginLeft: Taro.pxTransform(20) }} />}
                <Text className='header__nav__left__title' style={{ color: textColor }}>{leftTitle}</Text>
              </View>}
              <View className='header__nav__main'>
                {
                  renderMain || <Text className='header__nav__title' numberOfLines={1} style={{ color: textColor, textAlign: weapp && !titleCenter ? 'left' : 'center' }}>{title}</Text>
                }
              </View>
              {(isBack || isBackHome) && <View className='header__nav__right'
                style={weapp
                  ? {
                    marginRight: jiaonangWidth + 'px'
                  } : {}}
              >
                {renderRight}
              </View>}
            </View>
          }
        </View>
      </View>
    </>
      : null
  }
}
