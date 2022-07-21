import { Text } from '@tarojs/components'
import classNames from 'classnames'
import { styles } from 'taro-design/render'
import './index.scss'

export default ({ children, className, style, numberOfLines, ...props }) => {
  return <Text
    {...(numberOfLines ? { numberOfLines: Number(numberOfLines) } : {})}
    className={classNames(className, process.env.TARO_ENV === 'rn' ? '' : numberOfLines == 1 ? 'number-of-lines' : numberOfLines > 1 ? 'number-of-lines--more' : '')}
    style={styles(
      style,
      (process.env.TARO_ENV !== 'rn' && numberOfLines > 1 ? {
        '-webkit-line-clamp': '' + numberOfLines
      } : {})
    )}
    {...props}
  >{children}</Text>
}
