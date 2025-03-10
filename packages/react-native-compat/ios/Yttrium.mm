#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Yttrium, NSObject)


RCT_EXTERN_METHOD(initialize:(id)params
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(prepareDetailed:(id)params
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(execute:(id)params
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)


//RCT_EXTERN_METHOD(status:(id)params
//                  resolve:(RCTPromiseResolveBlock)resolve
//                  reject:(RCTPromiseRejectBlock)reject)
//
//RCT_EXTERN_METHOD(prepare:(id)params
//                  resolve:(RCTPromiseResolveBlock)resolve
//                  reject:(RCTPromiseRejectBlock)reject)
//
//RCT_EXTERN_METHOD(getBridgeDetails:(id)params
//                  resolve:(RCTPromiseResolveBlock)resolve
//                  reject:(RCTPromiseRejectBlock)reject)
//
//RCT_EXTERN_METHOD(getERC20Balance:(id)params
//                  resolve:(RCTPromiseResolveBlock)resolve
//                  reject:(RCTPromiseRejectBlock)reject)
//
//RCT_EXTERN_METHOD(estimateFees:(id)params
//                  resolve:(RCTPromiseResolveBlock)resolve
//                  reject:(RCTPromiseRejectBlock)reject)


+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
