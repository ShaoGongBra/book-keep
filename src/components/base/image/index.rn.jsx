import { Component } from 'react'
import FastImage from 'react-native-fast-image'
import { StyleSheet } from 'react-native'
import { SvgCssUri, WithLocalSvg } from 'react-native-svg'
import { noop, omit } from '@tarojs/components-rn/dist/utils'
import ClickableSimplified from '@tarojs/components-rn/dist/components/ClickableSimplified'

// export default ({
//   src
// }) => {
//   return <Image
//     source={{ src }}
//   />
// }

/**
 * ✔ src
 * ✔ mode: Partial support
 * ✘ lazy-load
 * ✔ onError(binderror)
 * ✔ onLoad(bindload)
 * ✘ onClick
 * ✔ DEFAULT_SIZE
 *
 * @warn Pass require(LOCAL IMAGE) to SRC, otherwise a string-type parameter.
 * @warn The width/height would be undefined in onLoad.
 * @warn Avoid using HTTP source image.
 * @warn Image.resolveAssetSource 会造成重复请求
 * @warn 宽高为 0 的时候，不触发 onLoad，跟小程序不同
 */


const resizeModeMap = {
  scaleToFill: 'stretch',
  aspectFit: 'contain',
  aspectFill: 'cover',
  center: 'center',
  // And widthFix
  // Not supported value...
}

export class _Image extends Component {
  static defaultProps = {
    src: '',
    mode: 'scaleToFill'
  }

  state = {
    ratio: 0,
    layoutWidth: 0
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.src !== this.props.src) {
      this.hasLayout = false
    }
    return true
  }

  hasLayout = false

  onError = () => {
    const { onError = noop } = this.props
    onError({
      detail: { errMsg: 'something wrong' }
    })
  }

  onLoad = ({ nativeEvent: { width, height } }) => {
    this.setState({
      ratio: height / width
    })
    const { onLoad } = this.props
    if (!onLoad) return
    onLoad({
      detail: { width, height }
    })
  }

  onLayout = (event) => {
    const { mode, style } = this.props
    const { width: layoutWidth } = event.nativeEvent.layout
    const flattenStyle = StyleSheet.flatten(style) || {}
    if (mode === 'widthFix' && typeof flattenStyle.width === 'string') {
      if (this.hasLayout) return
      this.setState({
        layoutWidth
      })
    }
    if (this.state.ratio) {
      this.hasLayout = true
    }
  }

  render() {
    const { style, src, mode = 'scaleToFill', svg = false } = this.props

    const flattenStyle = StyleSheet.flatten(style) || {}

    const defaultWidth = flattenStyle.width || 300
    const defaultHeight = flattenStyle.height || 225

    // remote svg image support, svg 图片暂不支持 mode
    const remoteSvgReg = /(https?:\/\/.*\.(?:svg|svgx))/i
    if (typeof src === 'string' && remoteSvgReg.test(src)) {
      return (
        <SvgCssUri
          uri={src}
          width={defaultWidth}
          height={defaultHeight}
        />
      )
    }

    // local svg image support, svg 图片暂不支持 mode
    if (svg) {
      return (
        <WithLocalSvg
          asset={src}
          width={defaultWidth}
          height={defaultHeight}
        />
      )
    }

    // The parameter passed to require mpxTransformust be a string literal
    const source = typeof src === 'string' ? { uri: src } : src

    const isWidthFix = mode === 'widthFix'
    const rMode = (resizeModeMap[mode] || (isWidthFix ? undefined : 'stretch'))

    const imageHeight = (() => {
      if (isWidthFix) {
        if (typeof flattenStyle.width === 'string') {
          return this.state.layoutWidth * this.state.ratio
        } else if (typeof flattenStyle.width === 'number') {
          return flattenStyle.width * this.state.ratio
        } else {
          return 300 * this.state.ratio
        }
      } else {
        return defaultHeight
      }
    })()
    const restImageProps = omit(this.props, ['source', 'src', 'resizeMode', 'onLoad', 'onError', 'onLayout', 'style'])

    return (
      <FastImage
        source={source}
        resizeMode={rMode}
        onError={this.onError}
        onLoad={this.onLoad}
        onLayout={this.onLayout}
        style={[
          {
            width: 300
          },
          style,
          {
            height: imageHeight
          }
        ]}
        {...restImageProps}
      />
    )
  }
}

export default ClickableSimplified(_Image)
