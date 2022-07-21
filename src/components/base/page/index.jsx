import { TopView, ScrollView } from 'taro-design/components'
import Header from '../header'

export default ({
  children,
  title,
  topView,
  header,
  scrollView
}) => {
  return <TopView {...topView}>
    <Header title={title} {...header} />
    <ScrollView {...scrollView}>
      {children}
    </ScrollView>
  </TopView>
}
