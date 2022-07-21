#import <React/RCTBridgeDelegate.h>
#import <Expo/Expo.h>
#import <UIKit/UIKit.h>

// react-native-wechat-lib start
#import "WXApi.h"
// react-native-wechat-lib end

@interface AppDelegate : EXAppDelegateWrapper <
  UIApplicationDelegate,
  RCTBridgeDelegate
  // react-native-wechat-lib start
  ,WXApiDelegate
  // react-native-wechat-lib end
>

@property (nonatomic, strong) UIWindow *window;

@end
