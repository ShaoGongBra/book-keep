import { Text, View } from '@tarojs/components'
import { Loading } from 'taro-design/components'
import './loading.scss'

export default ({ loading = true, text = '', flip }) => {

  return <View className={['list-loading', flip && 'list-loading--flip'].join(' ')}>
    {loading && <Loading size={46} />}
    <Text className='list-loading__text'>{text}</Text>
  </View>
}
