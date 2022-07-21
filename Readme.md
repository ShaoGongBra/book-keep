# 使用文档

## 代更新使用说明
### 发布正式版
```bash
yarn codepush
```
### 发布测试版
```bash
yarn codepush-test
```
上面两个命令会分别跑安卓和ios端时间可能会比较长，需要耐心等待，发布完成后就能在app上进行热更新了

## app 快捷命令

### 安卓打包发布版
```bash
yarn build:android
```
打包后将会把文件复制到`dist/build`下，不需要去安卓目录里面找

### 安卓打包调试版
```bash
yarn debug:android
```
打包的调试版需要将手机链接电脑，打开usb调试模式，才能自动安装运行
