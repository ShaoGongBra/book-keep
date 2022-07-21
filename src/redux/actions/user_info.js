import { SET_USER_INFO, CLEAR_USER_INFO } from '../constants/user_info'

export const setUserInfo = data => {
  return {
    type: SET_USER_INFO,
    data
  }
}

export const clearUserInfo = () => {
  return {
    type: CLEAR_USER_INFO
  }
}