import INITIAL_STATE from '@/config/theme'
import { SET_THEME } from '../constants/theme'

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_THEME:
      return {
        ...state,
        ...action.data
      }
    default:
      return state
  }
}
