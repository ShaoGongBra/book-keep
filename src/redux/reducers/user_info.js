import { SET_USER_INFO, CLEAR_USER_INFO } from '../constants/user_info'

const INSTALL_DATA = {
  loginStatus: false
}

export default (state = INSTALL_DATA, action) => {
  switch (action.type) {
    case SET_USER_INFO:
      state = {
        ...state,
        ...action.data
      }
      return { ...state }
    case CLEAR_USER_INFO:
      state = {}
      return { ...state }
    default:
      return state
  }
}
