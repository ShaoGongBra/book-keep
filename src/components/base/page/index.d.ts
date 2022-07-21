import { Component } from 'react'
import TopView from 'taro-design/components/overlay/top_view'
import ScrollView from 'taro-design/components/base/scroll_view'
import Header from './header'

type props = Partial<{
  /** 头部标题 */
  title: string,
  /** Header组件属性 */
  header: Header,
  /** TopView组件属性 */
  topView: TopView,
  /** ScrollView组件属性 */
  scrollView: ScrollView
}>

/**
 * 公共头部组件
 * @example
 * <Header title='页面标题' />
 * @info style.backgroundColor 属性仅支持 rgba rgb 16进制颜色
 */
export default class Page extends Component<props>{

}
