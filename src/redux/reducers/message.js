import { dateToLong } from '@/utils'
import { setChatTabbarNumber } from '@/utils/chat'
import { SET_LIST, SET_MESSAGE, START_MESSAGE_HOSTORY, SET_MESSAGE_HOSTORY, SET_MESSAGE_STATUTS, SET_CHAT_ACTIVE, CHAT_TOU, SET_MESSAGE_USER_INFO } from '../constants/message'

const INITIAL_STATE = {
  list: [],
  chatActive: '', // 当前激活的聊天窗口
  chat: {},
  status: 'on',
}

// 每个消息的结构
export const msgItem = {
  list: [],// 消息列表
  userInfo: {},
  hostory: 0, // 0未获取 1获取中 2还可以获取 3没有历史消息
  hostoryLoadStatus: [0, 2], // 哪些状态是可以加载历史记录的
  hostoryTime: null, // 获取历史消息的时间
  hostoryPage: 30, // 历史消息分页
  hostoryLimit: 0, // 历史消息当前limit
}

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_LIST:
      // 设置消息列表
      const { list = [] } = action
      state.list = list
      setChatTabbarNumber(state.list)
      return { ...state }
    case SET_MESSAGE:
      // 插入消息
      insertMsg(state, action)
      setChatTabbarNumber(state.list)
      return { ...state }
    case START_MESSAGE_HOSTORY:
      // 开始获取历史消息
      initMsg(state.chat, action.chatId)
      // 加载中
      state.chat[action.chatId].hostory = 1
      return { ...state }
    case SET_MESSAGE_HOSTORY:
      // 插入历史消息
      action.pos = 'up'
      insertMsg(state, action)
      const msg = state.chat[action.chatId]
      msg.hostory = action.list.length === msgItem.hostoryPage ? 2 : 3
      msg.hostoryTime = msg.hostoryTime || dateToLong()
      msg.hostoryLimit += action.list.length
      return { ...state }
    case SET_MESSAGE_STATUTS:
      // 消息发送状态
      msgStatus(state.chat, action)
      return { ...state }
    case SET_CHAT_ACTIVE:
      // 设置活动聊天
      setChatActive(state, action)
      setChatTabbarNumber(state.list)
      return { ...state }
    case CHAT_TOU:
      // 退出聊天
      state.list = []
      state.chatActive = ''
      state.chat = {}
      state.status = 'off'
      return { ...state }
    case SET_MESSAGE_USER_INFO:
      initMsg(state.chat, action.chatId)
      const msgUser = state.chat[action.chatId]
      msgUser.userInfo = action.info
      return { ...state }
    default:
      return state
  }
}

// 初始化单个聊天的详情
const initMsg = (chat, chatId) => {
  chat[chatId] === undefined && (chat[chatId] = { ...msgItem })
}

// 插入消息
const insertMsg = (state, action) => {
  const { chat } = state
  const { chatId, pos = 'down' } = action
  initMsg(chat, chatId)
  switch (pos) {
    case 'up':
      chat[chatId].list = [...chat[chatId].list, ...action.list]
      return chat
    case 'down':
      chat[chatId].list = [...action.list, ...chat[chatId].list]
      newMsg(state, action)
      return chat
    case 'replace':
      chat[chatId].list = [...action.list]
      return chat
    default:
      return chat
  }
}

// 处理新消息
const newMsg = ({ list: chatList, chatActive, chat }, action) => {
  const { chatId, list } = action
  const msg = list[0]
  const toId = chatId.substr(chatId.indexOf('_') + 1)
  let index = chatList.findIndex(item => item.toId === toId)
  const isSelf = toId === msg.to
  if (index === -1) {
    // 新会话插入会话列表
    chatList.unshift({
      chatsId: msg.chatsId,
      unreadCount: 0,
      nickname: isSelf ? msg.toData.nickname : msg.fromData.nickname,
      avatar: isSelf ? msg.toData.avatar : msg.fromData.avatar,
      toId,
      updateTime: 0,
      description: '',
      type: 'user'
    })
    index = 0
  }

  const item = chatList[index]
  if (chatActive !== item.toId) {
    // 更新消息未读数
    item.unreadCount++
    // 更新历史消息获取时间
    const chatItem = chat[chatId]
    chatItem.hostoryTime = chatItem.hostoryTime || msg.time - 1
  }
  item.description = msg.payload
  item.updateTime = dateToLong()
  if (index === 0) return
  // 将消息排到第一个
  chatList.splice(0, 0, chatList.splice(index, 1)[0])
}

// 消息发送状态
const msgStatus = (chat, action) => {
  const { chatId, guid, msgId = '', status = 0 } = action
  initMsg(chat, chatId)
  for (let i = 0, l = chat[chatId].list.length; i < l; i++) {
    const item = chat[chatId].list[i]
    if (item.guid === guid) {
      delete item.guid
      item.msgId = msgId
      // 标记状态
      item.sendStatus = status

      // 清除发送失败的定时器
      item.sendStatusTimer && (clearTimeout(item.sendStatusTimer), delete item.sendStatusTimer)
      break
    }
  }
}

// 设置当前聊天信息
const setChatActive = (state, action) => {
  state.chatActive = action.chatId
  if (action.chatId) {
    // 进入聊天
    const index = state.list.findIndex(item => item.toId === action.chatId)
    if (index !== -1) {
      const item = state.list[index]
      item.unreadCount = 0
    }

  } else {
    // 离开聊天

  }
}
