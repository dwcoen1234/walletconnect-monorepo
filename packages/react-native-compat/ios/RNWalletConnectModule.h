#ifdef RCT_NEW_ARCH_ENABLED
#import "RNWalletConnectModuleSpec.h"

@interface RNWalletConnectModule : NSObject <NativeRNWalletConnectModuleSpec>
#else
#import <React/RCTBridgeModule.h>

@interface RNWalletConnectModule : NSObject <RCTBridgeModule>
#endif

@end
