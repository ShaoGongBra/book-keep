import { CSSProperties } from 'react'
import { Component } from '@tarojs/taro'
import { CommonEventFunction } from '@tarojs/components/types/common'

type props = Partial<{

  /**
   * 数据
   * @example
   * [{text: '菜单1'},{text: '菜单2'},{text: '菜单3'}]
   */
  list: Array

  /** 当前选中值 */
  index: number

  /** 组件的内联样式, 可以动态设置的内联样式 */
  style?: CSSProperties

  /** 文字样式 */
  textStyle?: CSSProperties

  /** 横线样式 */
  lineStyle?: CSSProperties

  /**
   * 显示底部横线
   * @default true
   */
  showLine?: boolean

  /**
   * 支持左右滚动
   * @default false
   */
  scroll?: boolean

  /**
   * 切换事件
   * @example
   * <Tab list={[{text: '菜单1'},{text: '菜单2'},{text: '菜单3'}]} onSwitch={e => {
   *  console.log(e.index) // 当前点击的index
   *  console.log(e.text) // 当前点击导航栏的文字
   *  console.log(e) // 菜单项目内容
   * }} />
   *
   */
  onSwitch: CommonEventFunction

  /** 引用 */
  ref?: string | ((node: any) => any)
}>

/**
 * 通用Tab组件
 * @example
 * <Tab list={[{text: '菜单1'},{text: '菜单2'},{text: '菜单3'}]} onSwitch={e => {console.log(e)}} />
 */
export default class Tab extends Component<props>{

}
