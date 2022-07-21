import { combineReducers } from 'redux'
import theme from './theme'
import userInfo from './user_info'
// module chat start
import message from './message'
// module chat end

export default combineReducers({
  theme,
  userInfo,
  // module chat start
  message,
  // module chat end
})
