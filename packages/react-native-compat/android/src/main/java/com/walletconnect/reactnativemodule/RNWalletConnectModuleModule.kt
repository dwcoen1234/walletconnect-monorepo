package com.walletconnect.reactnativemodule

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.content.pm.PackageManager

class RNWalletConnectModuleModule internal constructor(context: ReactApplicationContext) :
  RNWalletConnectModuleSpec(context) {

  override fun getName(): String {
    return NAME
  }

  override fun getTypedExportedConstants(): Map<String, String> {
    var appName: String

    try {
      appName = reactApplicationContext.applicationInfo
        .loadLabel(reactApplicationContext.packageManager).toString()
    } catch (e: Exception) {
      appName = "unknown"
    }

    val constants: MutableMap<String, String> = HashMap()
    constants["applicationId"] = reactApplicationContext.packageName
    constants["applicationName"] = appName
    return constants
  }

  @ReactMethod
  override fun isAppInstalled(packageName: String?, promise: Promise) {
    try {
        val installed = packageName?.let { isPackageInstalled(it) } ?: false
        promise.resolve(installed)
    } catch (e: Exception) {
        promise.resolve(false)
    }
  }

  private fun isPackageInstalled(packageName: String): Boolean {
    val manager: PackageManager = reactApplicationContext.packageManager
    return try {
      @Suppress("DEPRECATION")
      manager.getPackageInfo(packageName, 0)
      true
    } catch (e: PackageManager.NameNotFoundException) {
      false
    }
  }

  companion object {
    const val NAME = "RNWalletConnectModule"
  }
}
