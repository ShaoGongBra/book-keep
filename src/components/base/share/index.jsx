import { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Text, Swiper, SwiperItem, Image, Button } from '@tarojs/components'
import { Icon, PullView, Loading, Absolute } from 'taro-design/components'
import { toast, saveToPhoto, request, isApp, decodeParams, currentPage } from '@/utils'
import { getShareConfig } from '@/utils/share'
import localConfig from '@/config'
import './index.scss'

// react-native-wechat-lib start
let WeChat
if (process.env.TARO_ENV === 'rn') {
  WeChat = require('react-native-wechat-lib')
}
// react-native-wechat-lib end

export default class Share extends Component {

  state = {
    show: false,
    images: [],
    imageOpen: false,
    menus: []
  }

  async componentDidMount() {
    if (!isApp('share')) {
      return
    }
    let { params = {} } = this.$instance
    this.params = decodeParams(params)
    // 获取分享相关配置
    const { config, sharePages } = await getShareConfig()
    this.page = currentPage()
    this.config = config
    this.sharePages = sharePages
    // 判断当前也页面是否配置分享
    this.isShare = this.sharePages.some(page => page.url === this.page)
    if (this.isShare) {
      // 获取当前页面分享参数
      let data = {
        status: true
      }
      if (process.env.TARO_ENV === 'weapp') {
        data = { ...data, ...await this.getPageParams() }
      }
      this.props.onShare && this.props.onShare(data)
    } else {
      this.props.onShare && this.props.onShare({ status: false })
    }
  }

  $instance = getCurrentInstance().router

  config = {}
  sharePages = []

  menus = {
    imageSava: {
      name: '保存图片',
      icon: 'tupian',
      color: '#fc0',
      type: 'image',
      platform: ['weapp', 'app', 'wechat', 'wap'],
      onClick() {
        if (['wechat', 'wap'].includes(global.platform)) {
          toast('请长按图片保存到相册')
        } else {
          saveToPhoto(this.state.images)
        }
      }
    },
    // react-native-wechat-lib start
    imageWechat: {
      name: '微信好友',
      icon: 'weixin',
      color: '#08be14',
      platform: ['app'],
      type: 'image',
      onClick() {
        if (process.env.TARO_ENV === 'rn') {
          WeChat.shareImage({
            imageUrl: this.state.images[0],
            scene: 0,
          })
        }
      }
    },
    imageTimeLine: {
      name: '朋友圈',
      icon: 'pengyouquan',
      color: '#b2c785',
      type: 'image',
      platform: ['app'],
      onClick() {
        if (process.env.TARO_ENV === 'rn') {
          WeChat.shareImage({
            imageUrl: this.state.images[0],
            scene: 1,
          })
        }
      }
    },
    imageCollect: {
      name: '微信收藏',
      icon: 'weixin',
      color: '#119aff',
      type: 'image',
      platform: ['app'],
      onClick() {
        if (process.env.TARO_ENV === 'rn') {
          WeChat.shareImage({
            imageUrl: this.state.images[0],
            scene: 2,
          })
        }
      }
    },
    // react-native-wechat-lib end
    urlCopy: {
      name: '复制链接',
      icon: 'fenzu',
      color: '#e64310',
      type: 'url',
      platform: ['weapp', 'wap', 'wechat', 'app'],
      onClick() {
        Taro.setClipboardData({ data: this.getH5Url() })
        toast('复制成功')
      }
    },
    urlH5Wechat: {
      name: '好友链接',
      icon: 'weixin',
      color: '#08be14',
      type: 'url',
      platform: ['wechat'],
      onClick() {
        this.setState({
          showTips: true
        })
      }
    },
    urlH5TimeLine: {
      name: '朋友圈链接',
      icon: 'pengyouquan',
      color: '#b2c785',
      type: 'url',
      platform: ['wechat'],
      onClick() {
        this.setState({
          showTips: true
        })
      }
    },
    // react-native-wechat-lib start
    urlAppShare: {
      name: '好友链接',
      icon: 'weixin',
      color: '#08be14',
      type: 'url',
      platform: ['app'],
      async onClick() {
        if (process.env.TARO_ENV === 'rn') {
          WeChat.shareWebpage({
            ...await this.shareWebpage(),
            scene: 0,
          })
        }
      }
    },
    urlAppTimeLine: {
      name: '朋友圈链接',
      icon: 'pengyouquan',
      color: '#b2c785',
      type: 'url',
      platform: ['app'],
      async onClick() {
        if (process.env.TARO_ENV === 'rn') {
          WeChat.shareWebpage({
            ...await this.shareWebpage(),
            scene: 1,
          })
        }
      }
    },
    urlAppCollect: {
      name: '收藏链接',
      icon: 'weixin',
      color: '#119aff',
      type: 'url',
      platform: ['app'],
      async onClick() {
        if (process.env.TARO_ENV === 'rn') {
          WeChat.shareWebpage({
            ...await this.shareWebpage(),
            scene: 2,
          })
        }
      }
    },
    // react-native-wechat-lib end
    weappPage: {
      name: '页面分享',
      icon: 'weixin',
      color: '#08be14',
      type: 'weappPage',
      platform: ['weapp']
    },
    // react-native-wechat-lib start
    appShareWeapp: {
      name: '小程序分享',
      icon: 'weixin',
      color: '#08be14',
      type: 'appShareWeapp',
      platform: ['app'],
      async onClick() {
        if (process.env.TARO_ENV === 'rn') {
          WeChat.shareMiniProgram({
            ...await this.shareMiniProgram(),
            scene: 0,
          })
        }
      }
    },
    // react-native-wechat-lib end
  }

  /**
   * 获取分享h5参数
   */
  async shareWebpage() {
    const params = await this.getPageParams()
    return {
      ...params,
      title: params.title,
      description: params.desc,
      thumbImageUrl: params.image,
      webpageUrl: this.getH5Url()
    }
  }

  /**
   * 获取分享小程序的参数
   */
  async shareMiniProgram() {
    const params = await this.getPageParams()
    return {
      ...params,
      description: params.desc,
      thumbImageUrl: params.image,
      path: this.getPageUrl(),
      userName: this.config.original_id,
      webpageUrl: this.getH5Url()
    }
  }

  /**
   * 获取当前页面分享参数
   */
  getPageParams() {
    if (this.pageShareParams) {
      return Promise.resolve(this.pageShareParams)
    }
    return request({
      url: 'share/Share/getPageParams',
      method: 'POST',
      data: {
        page: this.page,
        params: this.params
      }
    }).then(res => {
      this.pageShareParams = res
      this.pageShareParams.path = this.getPageUrl()
      return res
    })
  }

  // 获取不带域名的链接和参数
  getPageUrl() {
    const params = { ...this.params, ...(this.pageShareParams ? this.pageShareParams.params : {}) }
    return this.page + '?' + (Object.keys(params).map(item => item + '=' + params[item]).join('&'))
  }

  // 获取当前页面h5端的url
  getH5Url() {
    return (this.config.urlAppShareUrl || localConfig.domain) + '/#/' + this.getPageUrl()
  }

  // 将菜单序列话成新的对象
  getMenuCate() {
    const obj = {}
    for (const key in this.menus) {
      if (this.menus.hasOwnProperty(key)) {
        const element = this.menus[key]
        obj[element.type] = obj[element.type] || {}
        obj[element.type][key] = {
          name: element.name,
          icon: element.icon,
          color: element.color,
          platform: element.platform,
          key
        }
      }
    }
    return obj
  }

  getTypeMenus(menus, menusAll) {
    for (const key in menusAll) {
      if (menusAll.hasOwnProperty(key)) {
        const element = menusAll[key]
        if (element.platform.includes(global.platform)) {
          menus.push({
            name: element.name,
            icon: element.icon,
            color: element.color,
            key
          })
        }
      }
    }
  }

  /**
   * 组件调用展示分享面板函数 可以传入图片数组 分享图片
   * @param {object} option 参数
   */
  async share(option = {}) {
    if (!isApp('share')) {
      return
    }
    const menusAll = this.getMenuCate()
    const menus = []
    // 图片分享
    if (option.image) {
      if (option.image.urls) {
        this.setState({
          images: typeof option.image.urls === 'string' ? [option.image.urls] : option.image.urls,
          imageOpen: true
        })
        this.getTypeMenus(menus, menusAll.image)
      } else if (option.image.urlsAsync && typeof option.image.urlsAsync === 'function') {
        this.setState({
          imageOpen: true
        })
        option.image.urlsAsync().then(images => this.setState({ images }))
        this.getTypeMenus(menus, menusAll.image)
      }
    } else {
      this.setState({
        imageOpen: false
      })
    }

    const { config } = await getShareConfig()
    // 链接分享
    if (config.urlAppShare === '1' || global.platform !== 'app') {
      this.getTypeMenus(menus, menusAll.url)
      // 判断是否需要复制链接
      const copy = global.platform === 'app' || (config.weappUrlCopy === '1' && global.platform !== 'weapp') || (config.wechatUrlCopy === '1' && global.platform !== 'wechat')
      if (!copy) {
        // 删除复制链接选项
        menus.some((item, index) => {
          if (item.key === 'urlCopy') {
            menus.splice(index, 1)
            return true
          }
        })
      }
    }
    // 小程序页面分享
    if (global.platform === 'weapp') {
      this.getTypeMenus(menus, menusAll.weappPage)
    }
    // app小程序分享
    if (config.urlAppWeapp === '1') {
      this.getTypeMenus(menus, menusAll.appShareWeapp)
    }
    if (menus.length === 0) {
      return
    }
    this.setState({
      show: true,
      menus
    })
  }

  menuClick(key) {
    this.menus[key].onClick && this.menus[key].onClick.apply(this)
    this.pullView.close()
  }

  closeTips(e) {
    e.stopPropagation && e.stopPropagation()
    this.setState({
      showTips: false
    })
  }

  render() {
    const { show, images, imageOpen, menus, showTips } = this.state
    return <>
      {show && <PullView ref={ref => this.pullView = ref} onClose={() => this.setState({ show: false })}>
        <View className='share'>
          {imageOpen && <View className='share__image'>
            {
              images.length === 0
                ? <Loading />
                : <Swiper className='share__image__swiper' indicatorDots indicatorActiveColor='#000' indicatorColor='#fff'>
                  {
                    images.map(item => <SwiperItem className='share__image__swiper__item' key={item}>
                      <Image mode='aspectFit' src={item} className='share__image__swiper__image' />
                    </SwiperItem>)
                  }
                </Swiper>
            }
            <View className='share__image__swiper__close' onClick={() => this.pullView.close()}>
              <Icon name='guanbi' size={48} color='#fff' />
            </View>
          </View>}
          <View className='share__select'>
            {
              menus.map(item => <Button
                key={item.key}
                className='share__select__btn'
                openType={item.key === 'weappPage' ? 'share' : ''}
                onClick={this.menuClick.bind(this, item.key)}
              >
                <View className='share__select__btn__icon' style={{ backgroundColor: item.color }}>
                  <Icon name={item.icon} color='#FFF' size={60} />
                </View>
                <Text className='share__select__btn__text'>{item.name}</Text>
              </Button>)
            }
          </View>
        </View>
      </PullView>}
      {process.env.TARO_ENV === 'h5' && showTips &&
        <Absolute>
          <View className='share__tip' onClick={this.closeTips.bind(this)}>
            <Image className='share__tip__image' src={require('@/static/images/share-tips.png')} />
          </View>
        </Absolute>
      }
    </>
  }
}
