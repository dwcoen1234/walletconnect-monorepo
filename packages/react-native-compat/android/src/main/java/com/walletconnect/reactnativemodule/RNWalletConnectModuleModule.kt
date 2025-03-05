package com.walletconnect.reactnativemodule

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import android.content.pm.PackageManager
import uniffi.uniffi_yttrium.ChainAbstractionClient
import uniffi.yttrium.PrepareResponse
import kotlinx.coroutines.*
import uniffi.uniffi_yttrium.*
import uniffi.yttrium.*
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.google.gson.JsonElement

class RNWalletConnectModuleModule internal constructor(context: ReactApplicationContext) :
  RNWalletConnectModuleSpec(context) {

  override fun getName(): String {
    return NAME
  }

  override protected fun getTypedExportedConstants(): Map<String, String> {
    var appName: String

    try {
      appName = getReactApplicationContext().getApplicationInfo()
        .loadLabel(getReactApplicationContext().getPackageManager()).toString()
    } catch (e: Exception) {
      appName = "unknown"
    }

    val constants: MutableMap<String, String> = HashMap()
    constants.put("applicationId", getReactApplicationContext().getPackageName());
    constants.put("applicationName", appName);
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
    val manager: PackageManager = getReactApplicationContext().getPackageManager()
    return try {
      @Suppress("DEPRECATION")
      manager.getPackageInfo(packageName, 0)
      true
    } catch (e: PackageManager.NameNotFoundException) {
      false
    }
  }



// ------------------------------ Yttrium Chain Abstraction ------------------------------

  private var prepareAvailableResultsMap: MutableMap<String, PrepareResponseAvailable> = mutableMapOf()
  private var prepareDetailedAvailableResultsMap: MutableMap<String, UiFields> = mutableMapOf()
  private lateinit var client: ChainAbstractionClient

  @OptIn(DelicateCoroutinesApi::class)
  @ReactMethod
  override fun initialize(params: ReadableMap, promise: Promise){
    GlobalScope.launch(Dispatchers.Main) {
      try {
        var projectId = params.getString("projectId") as String
        var sdkVersion = params.getString("sdkVersion") as String
        var url = params.getString("url") as String

        client = ChainAbstractionClient(projectId, PulseMetadata(url= url, bundleId = "test",  packageName = "test package", sdkVersion= sdkVersion, sdkPlatform = "mobile"))
        promise.resolve(true)
      } catch (e: Exception) {
        // In case of an error, reject the promise
        promise.reject("ERROR", "Yttrium initialize Error:" + e.message, e)
      }
    }
  }

  @ReactMethod
  override fun prepare(params: ReadableMap, promise: Promise){
    System.out.println("checkRoute: Hello from YttriumModule")
    GlobalScope.launch(Dispatchers.Main) {
      try {
        val transactionMap = params.getMap("transaction")

        if(transactionMap === null) {
          throw Error("no params")
        }
          // Extract values from the nested transaction map
          val chainId = transactionMap.getString("chainId") ?: ""
          val input = transactionMap.getString("input") ?: ""
          val from = transactionMap.getString("from") ?: ""
          val to = transactionMap.getString("to") ?: ""
          val value = transactionMap.getString("value") ?: "0"
          val result = client.prepare(chainId = chainId, from = from, Call(
            to= to,
            value = value,
            input = input
          ))

          when(result) {
            is PrepareResponse.Success -> {
              when (result.v1) {
                is PrepareResponseSuccess.Available -> {
                  val availableResult = (result.v1 as PrepareResponseSuccess.Available).v1;
                  prepareAvailableResultsMap[availableResult.orchestrationId] = availableResult;
                }

                is PrepareResponseSuccess.NotRequired -> {
                  println("not required")
                }
              }
            }
            is PrepareResponse.Error -> {
              println("prepare error: ")
              println(result.v1.error)
            }
          }
          println("checkRoute: result: ")
          println(result)

          val gson = Gson()
          val jsonResult = gson.toJson(result)
          promise.resolve(jsonResult)
      } catch (e: Exception) {
        // In case of an error, reject the promise
        promise.reject("ERROR", "Yttrium checkRoute Error:" + e.message, e)
      }
    }
  }

  @ReactMethod
  override fun prepareDetailed(params: ReadableMap, promise: Promise){
    System.out.println("prepareDetailed: Hello from YttriumModule")
    GlobalScope.launch(Dispatchers.Main) {
      try {
        val transactionMap = params.getMap("transaction")

        if(transactionMap === null) {
          throw Error("no params")
        }
        // Extract values from the nested transaction map
        val chainId = transactionMap.getString("chainId") ?: ""
        val input = transactionMap.getString("input") ?: ""
        val from = transactionMap.getString("from") ?: ""
        val to = transactionMap.getString("to") ?: ""
        val value = transactionMap.getString("value") ?: "0"
        val result = client.prepareDetailed(chainId = chainId, from = from, Call(
          to= to,
          value = value,
          input = input
        ), Currency.USD)


        println("prepareDetailed: result: ")
        println(result)

        when(result) {
          is PrepareDetailedResponse.Success -> {
            when (result.v1) {
              is PrepareDetailedResponseSuccess.Available -> {
                val availableResult = (result.v1 as PrepareDetailedResponseSuccess.Available).v1
                prepareDetailedAvailableResultsMap[availableResult.routeResponse.orchestrationId] = availableResult
              }
              is PrepareDetailedResponseSuccess.NotRequired -> {
                println("prepareDetailed NotRequired: ")
              }
            }
          }
          is PrepareDetailedResponse.Error -> {
            println("prepareDetailed error: ")
            println(result.v1.error)
          }
        }

        val gson = Gson()
        val jsonResult = gson.toJson(result)
        promise.resolve(jsonResult)
      } catch (e: Exception) {
        // In case of an error, reject the promise
        promise.reject("ERROR", "Yttrium checkRoute Error:" + e.message, e)
      }
    }
  }

  @ReactMethod
  override fun status(params: ReadableMap, promise: Promise){
    System.out.println("checkStatus: Hello from YttriumModule address")

    GlobalScope.launch(Dispatchers.Main) {
      try {
        var orchestrationId = params.getString("orchestrationId") as String
        val result = client.status(orchestrationId)
        println("checkRoute: status: ")
        println(result)

        val gson = Gson()
        val jsonResult = gson.toJson(result)
        promise.resolve(jsonResult)
      } catch (e: Exception) {
        // In case of an error, reject the promise
        promise.reject("ERROR", "Yttrium checkStatus Error:" + e.message, e)
      }
    }
  }

  @ReactMethod
  override fun getBridgeDetails(params: ReadableMap, promise: Promise){
    System.out.println("getFulfilmentDetails: Hello from YttriumModule address")

    GlobalScope.launch(Dispatchers.Main) {
      try {
        val orchestrationId = params.getString("orchestrationId") as String

        val availableResult = prepareAvailableResultsMap[orchestrationId]
        val uiFields = availableResult.let {
          if (it != null) {
            client.getUiFields(it, Currency.USD)
          }
        }
        val gson = Gson()
        val resultJson: JsonElement = gson.toJsonTree(uiFields)
        promise.resolve(gson.toJson(resultJson))
      } catch (e: Exception) {
        // In case of an error, reject the promise
        promise.reject("ERROR", "Yttrium getFulfilmentDetails Error:" + e.message, e)
      }
    }
  }

  @ReactMethod
  override fun getERC20Balance(params: ReadableMap, promise: Promise){
    System.out.println("getERC20Balance: Hello from YttriumModule address")

    GlobalScope.launch(Dispatchers.Main) {
      try {
        val tokenAddress = params.getString("tokenAddress") as String
        val ownerAddress = params.getString("ownerAddress") as String
        val chainId = params.getString("chainId") as String
        val result = client.erc20TokenBalance(chainId = chainId, token = tokenAddress, owner = ownerAddress)
        val gson = Gson()
        val resultJson: JsonElement = gson.toJsonTree(result)
        promise.resolve(gson.toJson(resultJson))
      } catch (e: Exception) {
        // In case of an error, reject the promise
        promise.reject("ERROR", "Yttrium getERC20Balance Error:" + e.message, e)
      }
    }
  }

  private fun getListOfStrings(params: ReadableMap, key: String): List<String> {
    val readableArray: ReadableArray? = params.getArray(key)
    return readableArray?.toArrayList()?.map { it as String } ?: emptyList()
  }

  @ReactMethod
  override fun execute(params: ReadableMap, promise: Promise){
    System.out.println("getERC20Balance: Hello from YttriumModule address")

    GlobalScope.launch(Dispatchers.Main) {
      try {
        val orchestrationId = params.getString("orchestrationId") as String
        val bridgeSignedTransactions = getListOfStrings(params, "bridgeSignedTransactions")
        val initialSignedTransaction = params.getString("initialSignedTransaction") as String


        val prepareDetailedResult = prepareDetailedAvailableResultsMap[orchestrationId]
        
        val result =
          prepareDetailedResult?.let {
            client.execute(
              uiFields = it,
              routeTxnSigs = bridgeSignedTransactions,
              initialTxnSig = initialSignedTransaction,
            )
          }

        val gson = Gson()
        val resultJson: JsonElement = gson.toJsonTree(result)
        promise.resolve(gson.toJson(resultJson))
      } catch (e: Exception) {
        // In case of an error, reject the promise
        promise.reject("ERROR", "Yttrium getERC20Balance Error:" + e.message, e)
      }
    }
  }


  companion object {
    const val NAME = "RNWalletConnectModule"
  }
}
