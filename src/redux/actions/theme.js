import {
  SET_THEME
} from '../constants/theme'

export const setTheme = data => {
  global.theme = { ...global.theme, ...data }
  return {
    type: SET_THEME,
    data
  }
}