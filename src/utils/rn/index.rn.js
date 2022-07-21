import codePush from 'react-native-code-push'
import Taro from '@tarojs/taro'
// react-native-wechat-lib start
import { registerApp } from 'react-native-wechat-lib'
// react-native-wechat-lib end
import { Platform, LogBox, Linking, Alert, PermissionsAndroid } from 'react-native'
import { getVersion } from 'react-native-device-info'
import { hide } from 'react-native-bootsplash'
import RNFetchBlob from 'rn-fetch-blob'
import { toast } from 'taro-tools'
import DuxPush from 'react-native-dux-push'
import config from '@/config/app'
import { getConfig } from '@/utils/config'
import { offUserStatus, onUserStatus } from '../user'
import { nav } from '../nav'
import { message } from '../design'

// react-native-wechat-lib start
export const wechatInit = () => {
  registerApp(config.wxAppid, config.wxUniversalLink)
}
// react-native-wechat-lib end

// 屏蔽黄屏警告
LogBox.ignoreLogs(['Require cycle', 'Constants'])

/**
 * 版本号比较
 * @param {*} curV 当前版本
 * @param {*} reqV 请求的版本
 * @returns
 */
const compare = (curV, reqV) => {
  if (curV && reqV) {
    //将两个版本号拆成数字
    const arr1 = curV.split('.'),
      arr2 = reqV.split('.')
    let minLength = Math.min(arr1.length, arr2.length),
      position = 0,
      diff = 0
    //依次比较版本号每一位大小，当对比得出结果后跳出循环（后文有简单介绍）
    while (position < minLength && ((diff = parseInt(arr1[position]) - parseInt(arr2[position])) == 0)) {
      position++
    }
    diff = (diff != 0) ? diff : (arr1.length - arr2.length);
    //若curV大于reqV，则返回true
    return diff > 0
  } else {
    //输入为空
    return false
  }
}

export const systemUploadApp = async info => {
  if (!info) {
    info = (await getConfig(true, true)).nativeapp
  }
  if (Platform.OS === 'android') {
    if (compare(info.androidVersion, getVersion()) && (info.androidUrl || info.androidDowloadUrl)) {
      Alert.alert(
        '有新版本',
        info.androidUpdateInfo,
        [
          { text: '取消', onPress: () => { }, style: 'cancel' },
          {
            text: '立即更新', onPress: async () => {
              if (info.androidDowloadUrl) {
                await crequestMultiplePermission()
                toast('下载中 可在任务栏查看进度')
                RNFetchBlob.config({
                  addAndroidDownloads: {
                    useDownloadManager: true,
                    title: '更新APP',
                    description: '安装包正在下载',
                    mime: 'application/vnd.android.package-archive',
                    path: `${RNFetchBlob.fs.dirs.DownloadDir}/update${info.androidVersion}.apk`,
                    mediaScannable: true,
                    notification: true
                  }
                }).fetch(
                  'GET',
                  info.androidDowloadUrl
                ).then(res => {
                  RNFetchBlob.android.actionViewIntent(
                    res.path(),
                    'application/vnd.android.package-archive'
                  )
                  toast('下载成功 请在任务栏点击安装')
                })
              } else {
                // 打开浏览器
                Linking.openURL(info.androidUrl)
              }
            }
          }
        ]
      )
      return true
    }
  } else {
    if (compare(info.iosVersion, getVersion()) && info.iosUrl) {
      Alert.alert(
        '有新版本',
        info.iosUpdateInfo,
        [
          { text: '取消', onPress: () => { }, style: 'cancel' },
          { text: '立即更新', onPress: () => Linking.openURL(info.iosUrl) }
        ]
      )
      return true
    }
  }
}

export const updateApp = async () => {
  // eslint-disable-next-line no-undef
  if (__DEV__) {
    return toast('调试模式不可用')
  }
  // 有二进制文件更新则不执行codepush更新
  if (await systemUploadApp()) {
    return
  }
  const update = await codePush.getUpdateMetadata(codePush.UpdateState.PENDING)
  if (update) {
    Taro.showModal({
      title: '提示',
      content: '是否立即重启更新到最新版本'
    }).then(({ confirm }) => {
      confirm && update.install(codePush.InstallMode.IMMEDIATE)
    })
  } else {
    codePush.sync({
      deploymentKey: Platform.OS === 'android' ? config.codePushAndroidKey : config.codePushIosKey,
      updateDialog: {
        appendReleaseDescription: true,
        descriptionPrefix: '',
        mandatoryContinueButtonLabel: '更新',
        mandatoryUpdateMessage: '必须安装的更新',
        optionalIgnoreButtonLabel: '稍后',
        optionalInstallButtonLabel: '安装',
        optionalUpdateMessage: '有可用更新,你要安装它吗?',
        title: '有新版本'
      },
      installMode: codePush.InstallMode.IMMEDIATE,
      mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
      rollbackRetryOptions: {
        delayInHours: 0,
        maxRetryAttempts: 5
      }
    }, status => {
      switch (status) {
        case codePush.SyncStatus.CHECKING_FOR_UPDATE:
          toast('正在检查')
          break
        case codePush.SyncStatus.DOWNLOADING_PACKAGE:
          toast('下载中')
          break
        case codePush.SyncStatus.INSTALLING_UPDATE:
          toast('正在安装')
          break
        case codePush.SyncStatus.UP_TO_DATE:
          toast('已经最新版')
          break
        case codePush.SyncStatus.UPDATE_INSTALLED:
          Taro.showModal({
            title: '提示',
            content: '是否立即重启更新到最新版本'
          }).then(({ confirm }) => {
            confirm && codePush.restartApp()
          })
          break
        case codePush.SyncStatus.SYNC_IN_PROGRESS:
          toast('处理中')
          break
        case codePush.SyncStatus.UPDATE_IGNORED:
          // toast('已经忽略当前版本')
          break
        case codePush.SyncStatus.UNKNOWN_ERROR:
          toast('更新遇到未知错误')
          break
        default:
          toast('错误:' + status)
          break
      }
    }, progress => {
      toast((progress.receivedBytes / 1024 | 0) + 'KB/' + (progress.totalBytes / 1024 | 0) + 'KB')
    }).catch(err => {
      toast(err.message)
    })
  }
}

// eslint-disable-next-line no-undef
export const codePushHigh = app => __DEV__ ? app : codePush({
  deploymentKey: Platform.OS === 'android' ? config.codePushAndroidKey : config.codePushIosKey,
  rollbackRetryOptions: {
    delayInHours: 0,
    maxRetryAttempts: 5
  }
})(app)

/**
 * 隐藏启动图
 * @returns
 */
export const startHide = () => hide({ fade: true })

/**
 * 申请安卓文件读取权限
 * @returns
 */
export const crequestMultiplePermission = async () => {
  const granteds = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  ])
  if (granteds['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted') {
    return true
  } else {
    throw '获取权限失败'
  }
}


export const duxPushInit = () => {
  DuxPush.init(config.duxPushID, '')
  const click = e => {
    if (e.page) {
      nav(e.page)
    }
  }
  const notify = e => {
    message(e.title, e.body, e.page)
  }
  const cb = status => {
    if (status) {
      setTimeout(() => {
        global.userInfo.id && DuxPush.setAlias('' + global.userInfo.id)
        // 检测是否开通通知权限，未开通提示开通
        DuxPush.notificationsEnabled?.()?.then(res => {
          if (!res) {
            Alert.alert(
              '通知权限',
              '您当前未开启通知权限，您将无法收到消息推送，是否立即前往设置开启通知权限？',
              [
                { text: '取消', onPress: () => { }, style: 'cancel' },
                {
                  text: '立即前往', onPress: () => DuxPush.goPushSetting()
                }
              ]
            )
          }
        })
      }, 3000)
      DuxPush.addEventListener('duxpush_click', click)
      DuxPush.addEventListener('duxpush_notify', notify)
    } else {
      DuxPush.unsetAlias('')
    }
  }
  onUserStatus(cb)
  return () => {
    offUserStatus(cb)
    DuxPush.removeEventListener('duxpush_click')
    DuxPush.removeEventListener('duxpush_notify')
  }
}
