package com.walletconnect.reactnativemodule

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.NativeModule
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.module.model.ReactModuleInfo
import java.util.HashMap

class RNWalletConnectModulePackage : BaseReactPackage() {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(RNWalletConnectModuleModule(reactContext))
  }

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == RNWalletConnectModuleModule.NAME) {
      RNWalletConnectModuleModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
      moduleInfos[RNWalletConnectModuleModule.NAME] = ReactModuleInfo(
        RNWalletConnectModuleModule.NAME,
        RNWalletConnectModuleModule.NAME,
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        true,  // hasConstants
        false   // isCxxModule
      )
      moduleInfos
    }
  }
}
