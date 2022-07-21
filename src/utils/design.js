import { currentPage } from 'taro-tools'
import { TopView } from 'taro-design/components'
import { defineComponent } from 'taro-design/render'
import Link from '@/components/design/link'
import { nav } from './nav'

defineComponent('link', Link)

const getSize = size => {
  const { windowWidth } = global.systemInfo
  return 750 / windowWidth * size
}

const loadingPages = {}

/**
 * 在页面上显示一个loading 当页面被关闭是loading也会随着关闭
 * @param {string} text loading文字
 * @returns
 */
export const loading = (text = '请稍后') => {
  const { windowWidth, windowHeight } = global.systemInfo
  const node = {
    nodeName: 'view',
    key: 'root',
    style: {
      width: 200,
      height: 200,
      position: 'absolute',
      left: getSize(windowWidth) / 2 - 100,
      top: getSize(windowHeight) / 2 - 100,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    child: [
      {
        nodeName: 'loading',
        key: 'loading',
        size: 56,
        color: 'blank'
      },
      {
        nodeName: 'text',
        key: 'text',
        text,
        style: {
          color: '#fff',
          fontSize: 26,
          marginTop: 20
        }
      }
    ]
  }
  const page = currentPage()
  let key = loadingPages[page]
  if (!key) {
    key = loadingPages[page] = TopView.addDiy(node)
  } else {
    TopView.updateDiy(key, node)
  }
  return () => {
    delete loadingPages[page]
    TopView.removeDiy(key)
  }
}

const messagePages = {}

/**
 * 在页面顶部显示一个提示消息，三秒后或者页面跳转时将会自动关闭
 * @param {string} title 提示标题
 * @param {string} content 提示详情
 * @param {string} url 点击跳转链接
 * @returns
 */
export const message = (title = '请稍后', content, url) => {

  const { statusBarHeight = 0 } = global.systemInfo

  const clear = () => {
    clearTimeout(data.timer)
    data.navOn?.remove?.()
    data.navOn = null
    delete messagePages[page]
    TopView.removeDiy(data.key)
  }

  const node = {
    nodeName: 'link',
    key: 'link-root',
    url,
    onClick: clear,
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      backgroundColor: '#f23e39',
      padding: 20,
      paddingTop: getSize(statusBarHeight) + 20,
      zIndex: 100
    },
    child: [
      {
        nodeName: 'text',
        text: title,
        key: 'text1',
        style: {
          color: '#fff',
          fontSize: 36
        }
      },
      {
        nodeName: 'text',
        text: content,
        key: 'text2',
        style: {
          color: '#fff',
          fontSize: 28,
          marginTop: 20
        }
      }
    ]
  }
  const page = currentPage()
  if (!messagePages[page]) {
    messagePages[page] = {
      key: '',
      timer: null
    }
  }
  const data = messagePages[page]
  if (!data.key) {
    data.key = messagePages[page] = TopView.addDiy(node)
  } else {
    TopView.updateDiy(data.key, node)
  }
  if (data.timer) {
    clearTimeout(data.timer)
    data.navOn?.remove?.()
  }
  if (!data.navOn) {
    data.navOn = nav.on(({ type }) => {
      if (type === 'navigateTo') {
        clear()
      }
    })
  }
  data.timer = setTimeout(() => {
    clear()
  }, 3000)
}
