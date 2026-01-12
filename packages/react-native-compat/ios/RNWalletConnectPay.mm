#import "RNWalletConnectPay.h"
#import <React/RCTBridge.h>

// Import Swift/Yttrium
#if __has_include(<Yttrium/Yttrium-Swift.h>)
#import <Yttrium/Yttrium-Swift.h>
#elif __has_include(<YttriumWrapper/YttriumWrapper-Swift.h>)
#import <YttriumWrapper/YttriumWrapper-Swift.h>
#elif __has_include("Yttrium-Swift.h")
#import "Yttrium-Swift.h"
#else
// Fallback - uniffi generated code should be available
@import Yttrium;
#endif

@implementation RNWalletConnectPay {
    WalletConnectPayJson *_client;
    dispatch_queue_t _queue;
}

RCT_EXPORT_MODULE()

- (instancetype)init
{
    self = [super init];
    if (self) {
        _queue = dispatch_queue_create("com.walletconnect.pay", DISPATCH_QUEUE_SERIAL);
    }
    return self;
}

/**
 * Initialize the Pay client with SDK configuration
 * @param configJson JSON string containing SDK config
 */
RCT_EXPORT_METHOD(initialize:(NSString *)configJson)
{
    dispatch_async(_queue, ^{
        NSError *error = nil;
        self->_client = [[WalletConnectPayJson alloc] init:configJson error:&error];
        if (error) {
            NSLog(@"[RNWalletConnectPay] Failed to initialize: %@", error.localizedDescription);
        }
    });
}

/**
 * Get payment options for a payment link
 * @param requestJson JSON request string
 * @param resolve Promise resolve callback
 * @param reject Promise reject callback
 */
RCT_EXPORT_METHOD(getPaymentOptions:(NSString *)requestJson
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(_queue, ^{
        if (!self->_client) {
            reject(@"PAY_ERROR", @"Pay client not initialized. Call initialize() first.", nil);
            return;
        }
        
        NSError *error = nil;
        NSString *result = [self->_client getPaymentOptions:requestJson error:&error];
        
        if (error) {
            reject(@"PAY_ERROR", error.localizedDescription, error);
        } else {
            resolve(result);
        }
    });
}

/**
 * Get required payment actions for a selected option
 * @param requestJson JSON request string
 * @param resolve Promise resolve callback
 * @param reject Promise reject callback
 */
RCT_EXPORT_METHOD(getRequiredPaymentActions:(NSString *)requestJson
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(_queue, ^{
        if (!self->_client) {
            reject(@"PAY_ERROR", @"Pay client not initialized. Call initialize() first.", nil);
            return;
        }
        
        NSError *error = nil;
        NSString *result = [self->_client getRequiredPaymentActions:requestJson error:&error];
        
        if (error) {
            reject(@"PAY_ERROR", error.localizedDescription, error);
        } else {
            resolve(result);
        }
    });
}

/**
 * Confirm a payment with signatures
 * @param requestJson JSON request string
 * @param resolve Promise resolve callback
 * @param reject Promise reject callback
 */
RCT_EXPORT_METHOD(confirmPayment:(NSString *)requestJson
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(_queue, ^{
        if (!self->_client) {
            reject(@"PAY_ERROR", @"Pay client not initialized. Call initialize() first.", nil);
            return;
        }
        
        NSError *error = nil;
        NSString *result = [self->_client confirmPayment:requestJson error:&error];
        
        if (error) {
            reject(@"PAY_ERROR", error.localizedDescription, error);
        } else {
            resolve(result);
        }
    });
}

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRNWalletConnectPaySpecJSI>(params);
}
#endif

@end
