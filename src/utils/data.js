import Taro from '@tarojs/taro'

export class ListManage {

  constructor({
    // 当前列表的主键
    keyField = 'id',
    // 是否将当前列表选中项保存到本地，如果是空字符串则不保存 选中项保存到本地用的key
    savaSelectKey,
    // 默认选中项目项目的索引
    savaSelectDefaultIndex
  } = {
      keyField: 'id'
    }
  ) {
    this.key = keyField
    this.savaSelectKey = savaSelectKey
    this.savaSelectDefaultIndex = savaSelectDefaultIndex
  }

  key

  savaSelectKey
  savaSelectDefaultIndex

  selectId = 0

  selectInfo = {}

  list = []

  selectCallbacks = []

  listCallbacks = []

  itemCallback = {}

  on = (callback, list) => {
    list.push(callback)
  }

  off = (callback, list) => {
    if (callback) {
      const index = list.indexOf(callback)
      ~index && list.splice(index, 1)
    } else {
      list.splice(0)
    }
  }

  // 监听选中项改变事件
  onSelect = callback => {
    this.on(callback, this.selectCallbacks)
  }

  // 取消监听
  offSelect = callback => {
    this.off(callback, this.selectCallbacks)
  }

  // 监听列表改变
  onList = callback => {
    this.on(callback, this.listCallbacks)
  }

  // 取消监听
  offList = callback => {
    this.off(callback, this.listCallbacks)
  }

  // 监听某一项改变
  onItem = (callback, id) => {
    if (!this.itemCallback[id]) {
      this.itemCallback[id] = []
    }
    this.on(callback, this.itemCallback[id])
  }

  // 取消监听
  offItem = (callback, id) => {
    this.off(callback, this.itemCallback[id])
  }

  // 编辑或者添加一项或者多项
  edit = (...datas) => {
    datas.forEach(data => {
      const index = this.list.findIndex(item => item[this.key] === +data[this.key])
      if (~index) {
        this.list[index] = typeof data === 'object'
          ? { ...this.list[index], ...data }
          : data
        // 编辑了选中项则让选中项更新
        if (+data[this.key] === this.selectId) {
          this.execSelectCallback()
        }
      } else {
        this.list.push(data)
      }
      this.execItemCallback(data[this.key])
    })
    datas.length && this.execListCallback()
  }

  // 替换整个列表
  replace = (list = []) => {
    this.list = list
    // 存在选中项则判断是不是删除 并且让这一项更新
    if (this.selectId) {
      if (!list.some(item => item[this.key] === this.selectId)) {
        this.selectId = 0
      }
      this.execSelectCallback()
    }
    this.execListCallback()
    this.execItemCallback()
  }

  // 删除一项或多项
  delete = (...ids) => {
    if (ids.filter(id => {
      const index = this.list.findIndex(item => item[this.key] === +id)
      if (~index) {
        this.list.splice(index, 1)
        // 删除了选中项则更新
        if (+id === this.selectId) {
          this.selectId = 0
          this.execSelectCallback()
        }
        this.execItemCallback(+id)
        return true
      }
      return false
    }).length) {
      this.execListCallback()
    }
  }

  // 清除数据
  clear = () => {
    this.list = []
    this.selectId = 0
    this.execItemCallback()
    this.execListCallback()
    this.execSelectCallback()
  }

  // 设置当前选中项
  select = async id => {
    if (this.selectId === +id) {
      return
    }
    let before = this.beforeSelectCallback?.(id)
    if (before instanceof Promise) {
      before = await before
    }
    if (before) {
      this.selectId = +id
      this.execSelectCallback()
    }
  }

  beforeSelectCallback = async () => true
  // 选中项前置操作
  beforeSelect = callback => {
    this.beforeSelectCallback = callback
  }

  async getSelect() {
    if (this.selectId) {
      return
    }
    try {
      if (this.savaSelectKey) {
        let { data } = await Taro.getStorage({ key: this.savaSelectKey })
        if (data) {
          data = JSON.parse(data)
          // 在列表中存在选中项 则让其选中当前列表
          if (this.list.some(item => item[this.key] === data[this.key])) {
            this.select(data[this.key])
            return
          }
        }
      }
      throw '获取本地数据失败'
    } catch (error) {
      if (this.savaSelectDefaultIndex !== undefined && this.list.length) {
        this.select(this.list[0][this.key])
      }
    }
  }

  execSelectCallback() {
    const info = !this.selectId ? {} : (this.list.find(item => item[this.key] === this.selectId) || {})
    // 从空变为空则不触发改变
    if (Object.keys(info).length === 0 && Object.keys(this.selectInfo).length === 0) {
      return
    }
    this.selectInfo = { ...info }
    // 将选中项保存到本地 供下次启动调用
    if (this.savaSelectKey) {
      Taro.setStorage({
        key: this.savaSelectKey,
        data: JSON.stringify(this.selectInfo)
      })
    }
    this.selectCallbacks.forEach(item => item(this.selectInfo))
  }

  execItemCallback(id) {
    const keys = id ? [id] : Object.keys(this.itemCallback)
    keys.forEach(key => {
      const data = this.list.find(item => item[this.key] === +key) || {}
      this.itemCallback[key]?.forEach(cb => cb(data))
    })
  }

  execListCallback() {
    this.list = [...this.list]
    this.getSelect()
    this.listCallbacks.forEach(item => item(this.list))
  }
}
