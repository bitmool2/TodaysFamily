// ShareIntentModule-Bridging.m
// Exposes ShareIntentModule to React Native's ObjC bridge.

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ShareIntentModule, NSObject)

RCT_EXTERN_METHOD(getShareIntent:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(clearShareIntent)

@end
