import YttriumWrapper


@objc(Yttrium)
class Yttrium: NSObject {
    
    struct CustomError: Error {
        let message: String
    }

    private var client: ChainAbstractionClient?
    
    @objc
    func initialize(_ params: Any, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            if let dict = params as? [String: Any],
               let projectId = dict["projectId"] as? String,
               let url = dict["url"] as? String,
               let sdkVersion = dict["sdkVersion"] as? String {
                let bundleID = Bundle.main.bundleIdentifier ?? ""
                let pulseMetadata = PulseMetadata(url: url, bundleId: bundleID, sdkVersion: sdkVersion, sdkPlatform: "mobile")
                client = ChainAbstractionClient(projectId: projectId, pulseMetadata: pulseMetadata)
                resolve(true)
                return
            } else {
                throw CustomError(message: "failed to initialize")
            }
        } catch {
            reject("yttr_init", "yttr_init", error)
        }
        reject("yttr_init", "yttr_init", CustomError(message: "failed to init"))
    }
    
    func convertNotRequiredToDictionary(payload: YttriumWrapper.PrepareDetailedResponse?) -> [String: Any]? {
        // Ensure payload is not nil and extract the success case
        guard case let .success(.notRequired(response)) = payload else {
            return nil
        }

        let initialTransaction = response.initialTransaction
        let transactions = response.transactions.map { txn in
            return [
                "chainId": txn.chainId,
                "from": txn.from,
                "to": txn.to,
                "value": txn.value,
                "input": txn.input,
                "gasLimit": txn.gasLimit,
                "nonce": txn.nonce
            ]
        }

        return [
            "initialTransaction": [
                "chainId": initialTransaction.chainId,
                "from": initialTransaction.from,
                "to": initialTransaction.to,
                "value": initialTransaction.value,
                "input": initialTransaction.input,
                "gasLimit": initialTransaction.gasLimit,
                "nonce": initialTransaction.nonce
            ],
            "transactions": transactions
        ]
    }
    
    func convertUiFieldsToDictionary(payload: YttriumWrapper.PrepareDetailedResponse?) -> [String: Any]? {
        guard case let .success(.available(uiFields)) = payload else {
            return nil
        }
        
        let routeResponse = uiFields.routeResponse
        
        let initialTransaction = routeResponse.initialTransaction
        let initialTransactionDict: [String: Any] = [
            "chainId": initialTransaction.chainId,
            "from": initialTransaction.from,
            "to": initialTransaction.to,
            "value": initialTransaction.value,
            "input": initialTransaction.input,
            "gasLimit": initialTransaction.gasLimit,
            "nonce": initialTransaction.nonce
        ]
        
        let transactionsDict = routeResponse.transactions.map { txn in
            return [
                "chainId": txn.chainId,
                "from": txn.from,
                "to": txn.to,
                "value": txn.value,
                "input": txn.input,
                "gasLimit": txn.gasLimit,
                "nonce": txn.nonce
            ]
        }
        
        let fundingFromDict = routeResponse.metadata.fundingFrom.map { funding in
            return [
                "chainId": funding.chainId,
                "tokenContract": funding.tokenContract,
                "symbol": funding.symbol,
                "amount": funding.amount,
                "bridgingFee": funding.bridgingFee,
                "decimals": funding.decimals
            ]
        }
        
        let initialTransactionMetadataDict: [String: Any] = [
            "transferTo": routeResponse.metadata.initialTransaction.transferTo,
            "amount": routeResponse.metadata.initialTransaction.amount,
            "tokenContract": routeResponse.metadata.initialTransaction.tokenContract,
            "symbol": routeResponse.metadata.initialTransaction.symbol,
            "decimals": routeResponse.metadata.initialTransaction.decimals
        ]
        
        let checkIn = routeResponse.metadata.checkIn
        
        let routeDict = uiFields.route.map { txnDetail in
            let fee = txnDetail.fee
            return [
                "transaction": [
                    "chainId": txnDetail.transaction.chainId,
                    "from": txnDetail.transaction.from,
                    "to": txnDetail.transaction.to,
                    "value": txnDetail.transaction.value,
                    "input": txnDetail.transaction.input,
                    "gasLimit": txnDetail.transaction.gasLimit,
                    "nonce": txnDetail.transaction.nonce,
                    "maxFeePerGas": txnDetail.transaction.maxFeePerGas,
                    "maxPriorityFeePerGas": txnDetail.transaction.maxPriorityFeePerGas
                ],
                "transactionHashToSign": txnDetail.transactionHashToSign,
                "fee": [
                    "symbol": fee.fee.symbol,
                    "amount": fee.fee.amount,
                    "unit": fee.fee.unit,
                    "formatted": fee.fee.formatted,
                    "formattedAlt": fee.fee.formattedAlt
                ],
                "localFee": [
                    "symbol": fee.localFee.symbol,
                    "amount": fee.localFee.amount,
                    "unit": fee.localFee.unit,
                    "formatted": fee.localFee.formatted,
                    "formattedAlt": fee.localFee.formattedAlt
                ]
            ]
        }
        
        let localRouteTotalDict: [String: Any] = [
            "symbol": uiFields.localRouteTotal.symbol,
            "amount": uiFields.localRouteTotal.amount,
            "unit": uiFields.localRouteTotal.unit,
            "formatted": uiFields.localRouteTotal.formatted,
            "formattedAlt": uiFields.localRouteTotal.formattedAlt
        ]
        
        let bridgeDict = uiFields.bridge.map { fee in
            return [
                "fee": [
                    "symbol": fee.fee.symbol,
                    "amount": fee.fee.amount,
                    "unit": fee.fee.unit,
                    "formatted": fee.fee.formatted,
                    "formattedAlt": fee.fee.formattedAlt
                ],
                "localFee": [
                    "symbol": fee.localFee.symbol,
                    "amount": fee.localFee.amount,
                    "unit": fee.localFee.unit,
                    "formatted": fee.localFee.formatted,
                    "formattedAlt": fee.localFee.formattedAlt
                ]
            ]
        }
        
        let localBridgeTotalDict: [String: Any] = [
            "symbol": uiFields.localBridgeTotal.symbol,
            "amount": uiFields.localBridgeTotal.amount,
            "unit": uiFields.localBridgeTotal.unit,
            "formatted": uiFields.localBridgeTotal.formatted,
            "formattedAlt": uiFields.localBridgeTotal.formattedAlt
        ]
        
        let initialDict: [String: Any] = [
            "transaction": [
                "chainId": uiFields.initial.transaction.chainId,
                "from": uiFields.initial.transaction.from,
                "to": uiFields.initial.transaction.to,
                "value": uiFields.initial.transaction.value,
                "input": uiFields.initial.transaction.input,
                "gasLimit": uiFields.initial.transaction.gasLimit,
                "nonce": uiFields.initial.transaction.nonce,
                "maxFeePerGas": uiFields.initial.transaction.maxFeePerGas,
                "maxPriorityFeePerGas": uiFields.initial.transaction.maxPriorityFeePerGas
            ],
            "transactionHashToSign": uiFields.initial.transactionHashToSign,
            "fee": [
                "symbol": uiFields.initial.fee.fee.symbol,
                "amount": uiFields.initial.fee.fee.amount,
                "unit": uiFields.initial.fee.fee.unit,
                "formatted": uiFields.initial.fee.fee.formatted,
                "formattedAlt": uiFields.initial.fee.fee.formattedAlt
            ],
            "localFee": [
                "symbol": uiFields.initial.fee.localFee.symbol,
                "amount": uiFields.initial.fee.localFee.amount,
                "unit": uiFields.initial.fee.localFee.unit,
                "formatted": uiFields.initial.fee.localFee.formatted,
                "formattedAlt": uiFields.initial.fee.localFee.formattedAlt
            ]
        ]
        
        let localTotalDict: [String: Any] = [
            "symbol": uiFields.localTotal.symbol,
            "amount": uiFields.localTotal.amount,
            "unit": uiFields.localTotal.unit,
            "formatted": uiFields.localTotal.formatted,
            "formattedAlt": uiFields.localTotal.formattedAlt
        ]
        
        return [
            "orchestrationId": routeResponse.orchestrationId,
            "initialTransaction": initialTransactionDict,
            "transactions": transactionsDict,
            "metadata": [
                "fundingFrom": fundingFromDict,
                "initialTransaction": initialTransactionMetadataDict,
                "checkIn": checkIn
            ],
            "route": routeDict,
            "localRouteTotal": localRouteTotalDict,
            "bridge": bridgeDict,
            "localBridgeTotal": localBridgeTotalDict,
            "initial": initialDict,
            "localTotal": localTotalDict
        ]
    }
    
    func convertPrepareDetailedErrorToDictionary(payload: YttriumWrapper.PrepareDetailedResponse?) -> [String: Any]? {
        guard case let .error(error) = payload else {
            return nil
        }
        
        switch error.error {
        case .noRoutesAvailable:
            return [
                "error": "noRoutesAvailable"
            ]
            
        case .insufficientFunds:
            return [
                "error": "insufficientFunds"
            ]
            
        case .insufficientGasFunds:
            return [
                "error": "insufficientGasFunds"
            ]
        }
    }
    
    private var prepareDetailedResultDict: [String: UiFields] = [:]

    
    @objc
    func prepareDetailed(_ params: Any, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        print("prepareDetailed called with", params)
        let dict = params as? [String: Any]
        
        if let transactionData = dict?["transaction"] as? [String: String],
            let from = transactionData["from"] ?? "" as Optional,
            let chainId = transactionData["chainId"] ?? "" as Optional,
            let input = transactionData["input"] ?? "" as Optional,
            let value = transactionData["value"] ?? "" as Optional,
            let to = transactionData["to"] ?? "" as Optional {
            
            print("created client, checking route...")
            Task {
                do {
                    if((client) != nil) {
                        //                    let transaction = InitialTransaction.init(chainId: chainId, from: from, to: to, value: value, input: data)
                        let call = Call(to: to, value: value, input: input)
                        let routeResponse = try await client?.prepareDetailed(chainId: chainId, from: from, call: call, localCurrency: Currency.usd)
                        print("result", routeResponse)
                        
                        if let notRequiredDict = convertNotRequiredToDictionary(payload: routeResponse) {
                            resolve(notRequiredDict)
                        } else if let detailedDict = convertUiFieldsToDictionary(payload: routeResponse) {
                            guard case let .success(.available(uiFields)) = routeResponse else {
                                throw CustomError(message:"prepareDetailed, something went wrong")
                            }
                            prepareDetailedResultDict[uiFields.routeResponse.orchestrationId] = uiFields

                            resolve(detailedDict)
                        } else if let detailedError = convertPrepareDetailedErrorToDictionary(payload: routeResponse) {
                            resolve(detailedError)
                        }
                        
                        return
                    } else {
                        reject("yttrium err", "yttrium_err", CustomError(message:"prepareDetailed: client not init"))
                    }
//
//                    switch routeResponseSuccess {
//                    case let .success(routeResponse):
//                        switch routeResponse {
//                        case let .available(availableResponse):
//                            
//                            availableResponseDictionary[availableResponse.orchestrationId] = availableResponse;
//                            //                          let uiFields = try await client.getRouteUiFields(routeResponse: availableResponse, initialTransaction: Transaction(from: from, to: to, value: value, gas: gas, data: data, nonce: nonce, chainId: chainId, gasPrice: gasPrice, maxFeePerGas: maxFeePerGas, maxPriorityFeePerGas: maxPriorityFeePerGas), currency: Currency.usd)
//                            //
//                            //                          let routesDetails = convertRouteUiFieldsToDictionary(uiFields)
////                            print("available result", availableResponse)
//                            //                          print("ui_fields_json", routesDetails)
//                          let responseDict = convertRouteResponseAvailableToDictionary(availableResponse)
//                            print("parsed result dictionary", responseDict)
//                          resolve(["status": "available", "data": responseDict])
////                                                          "routesDetails": routesDetails
//                            
//                        case .notRequired(_):
//                            print("not required")
//                            resolve(["status": "not_required"])
//                        }
//                    case let .error(routeResponse):
//                        switch routeResponse.error {
//                        case BridgingError.insufficientFunds:
//                            let responseDict: [String: Any] = [
//                                "status": "error",
//                                "reason": "insufficientFunds"
//                            ]
//                            resolve(responseDict)
//                        case BridgingError.insufficientGasFunds:
//                            let responseDict: [String: Any] = [
//                                "status": "error",
//                                "reason": "insufficientGasFunds"
//                            ]
//                            resolve(responseDict)
//                        case BridgingError.noRoutesAvailable:
//                            let responseDict: [String: Any] = [
//                                "status": "error",
//                                "reason": "noRoutesAvailable"
//                            ]
//                            resolve(responseDict)
//                        }
//                        print(routeResponse)
//                        print(routeResponse.error)
//                    }
                    //          resolve(result)
                } catch {
                    print("Error occurred: \(error)")
                    print(error)
                    reject("yttrium err", "yttrium_err", error)
                }
            }
        } else {
            reject("prepareDetailed failed", "prepareDetailed", CustomError(message: "prepareDetailed failed"))
        }
    }
    
    @objc
    func execute(_ params: Any, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        print("execute called", params)
    
        Task {
            do {
                if let dict = params as? [String: Any],
                   let bridgeSignedTransactions = dict["bridgeSignedTransactions"] as? Array<String>,
                   let initialSignedTransaction = dict["initialSignedTransaction"] as? String,
                   let orchestrationId = dict["orchestrationId"] as? String {
                    
                    if((client) != nil) {
                        
                        guard let uiFields = prepareDetailedResultDict[orchestrationId] else {
                            throw CustomError(message: "prepareDetailed result not found, try again")
                        }
                        
                        print("UI fields found for:", orchestrationId)
                    
                        let result = try await client?.execute(uiFields: uiFields, routeTxnSigs: bridgeSignedTransactions, initialTxnSig: initialSignedTransaction)
                        print("execute success", orchestrationId, result)
                        resolve(["initialTxnHash": result?.initialTxnHash, "initialTxnReceipt": result?.initialTxnReceipt])
                    } else {
                        throw CustomError(message: "execute failed: client doesn't exist")
                    }
                }
            } catch {
                print("execute threw")
                reject("execute err", "execute", error)
            }
        }
    }
    
//
//    @objc
//    func status(_ params: Any, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
//        print("checkStatus called with", params )
//        if let dict = params as? [String: Any],
//           let projectId = dict["projectId"] as? String,
//           let orchestrationId = dict["orchestrationId"] as? String {
//            let client = ChainAbstractionClient.init(projectId: projectId)
//            Task {
//                do {
//                    let statusResponse = try await client.status(orchestrationId: orchestrationId)
//                    
//                    switch statusResponse {
//                    case let .completed(statusResponseCompleted):
//                        print("status response completed", statusResponseCompleted)
//                        let responseDict: [String: Any] = [
//                            "createdAt": statusResponseCompleted.createdAt,
//                            "status": "completed"
//                        ]
//                        resolve(responseDict)
//                    case let .error(statusResponseError):
//                        print("status response error", statusResponseError)
//                        let responseDict: [String: Any] = [
//                            "createdAt": statusResponseError.createdAt,
//                            "reason": statusResponseError.error,
//                            "status": "error"
//                        ]
//                        resolve(responseDict)
//                    case let .pending(statusResponsePending):
//                        print("status response pending", statusResponsePending)
//                        let responseDict: [String: Any] = [
//                            "createdAt": statusResponsePending.createdAt,
//                            "checkIn": statusResponsePending.checkIn,
//                            "status": "pending"
//                        ]
//                        resolve(responseDict)
//                    }
//                } catch {
//                    print("Error occurred: \(error)")
//                    print(error)
//                    reject("checkStatus err", "checkStatus", error)
//                }
//            }
//        }
//    }
//    
//    func convertRouteResponseAvailableToDictionary(_ routeResponse: RouteResponseAvailable) -> [String: Any] {
//        func transactionToDictionary(_ transaction: YttriumWrapper.Transaction) -> [String: Any] {
//            return [
//                "chainId": transaction.chainId,
//                "from": transaction.from,
//                "to": transaction.to,
//                "value": transaction.value,
//                "input": transaction.input,
//                "gasLimit": transaction.gasLimit,
//                "nonce": transaction.nonce
//            ]
//        }
//
//        func fundingMetadataToDictionary(_ metadata: YttriumWrapper.FundingMetadata) -> [String: Any] {
//            return [
//                "chainId": metadata.chainId,
//                "tokenContract": metadata.tokenContract,
//                "symbol": metadata.symbol,
//                "amount": metadata.amount,
//                "bridgingFee": metadata.bridgingFee,
//                "decimals": metadata.decimals
//            ]
//        }
//
//        func initialTransactionMetadataToDictionary(_ metadata: YttriumWrapper.InitialTransactionMetadata) -> [String: Any] {
//            return [
//                "transferTo": metadata.transferTo,
//                "amount": metadata.amount,
//                "tokenContract": metadata.tokenContract,
//                "symbol": metadata.symbol,
//                "decimals": metadata.decimals
//            ]
//        }
//
//        func metadataToDictionary(_ metadata: YttriumWrapper.Metadata) -> [String: Any] {
//            return [
//                "fundingFrom": metadata.fundingFrom.map { fundingMetadataToDictionary($0) },
//                "initialTransaction": initialTransactionMetadataToDictionary(metadata.initialTransaction),
//                "checkIn": metadata.checkIn
//            ]
//        }
//
//        return [
//            "orchestrationId": routeResponse.orchestrationId,
//            "initialTransaction": transactionToDictionary(routeResponse.initialTransaction),
//            "transactions": routeResponse.transactions.map { transactionToDictionary($0) },
//            "metadata": metadataToDictionary(routeResponse.metadata)
//        ]
//    }
//    
//    private var availableResponseDictionary: [String: RouteResponseAvailable] = [:]
//    
//    @objc
//    func prepare(_ params: Any, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
//        print("checkRoute called with", params)
//        let dict = params as? [String: Any]
//        
//        if let transactionData = dict?["transaction"] as? [String: String],
//            let from = transactionData["from"] ?? "" as Optional,
//            let chainId = transactionData["chainId"] ?? "" as Optional,
//            let data = transactionData["data"] ?? "" as Optional,
//            let value = transactionData["value"] ?? "" as Optional,
//            let to = transactionData["to"] ?? "" as Optional,
//            let projectId = dict?["projectId"] as? String {
//            
//            let client = ChainAbstractionClient.init(projectId: projectId)
//            print("created client, checking route...")
//            Task {
//                do {
//                    let transaction = InitialTransaction.init(chainId: chainId, from: from, to: to, value: value, input: data)
//                    
//                    let routeResponseSuccess = try await client.prepare(initialTransaction: transaction)
//                    print("result", routeResponseSuccess)
//                    
//                    switch routeResponseSuccess {
//                    case let .success(routeResponse):
//                        switch routeResponse {
//                        case let .available(availableResponse):
//                            
//                            availableResponseDictionary[availableResponse.orchestrationId] = availableResponse;
//                            //                          let uiFields = try await client.getRouteUiFields(routeResponse: availableResponse, initialTransaction: Transaction(from: from, to: to, value: value, gas: gas, data: data, nonce: nonce, chainId: chainId, gasPrice: gasPrice, maxFeePerGas: maxFeePerGas, maxPriorityFeePerGas: maxPriorityFeePerGas), currency: Currency.usd)
//                            //
//                            //                          let routesDetails = convertRouteUiFieldsToDictionary(uiFields)
////                            print("available result", availableResponse)
//                            //                          print("ui_fields_json", routesDetails)
//                          let responseDict = convertRouteResponseAvailableToDictionary(availableResponse)
//                            print("parsed result dictionary", responseDict)
//                          resolve(["status": "available", "data": responseDict])
////                                                          "routesDetails": routesDetails
//                            
//                        case .notRequired(_):
//                            print("not required")
//                            resolve(["status": "not_required"])
//                        }
//                    case let .error(routeResponse):
//                        switch routeResponse.error {
//                        case BridgingError.insufficientFunds:
//                            let responseDict: [String: Any] = [
//                                "status": "error",
//                                "reason": "insufficientFunds"
//                            ]
//                            resolve(responseDict)
//                        case BridgingError.insufficientGasFunds:
//                            let responseDict: [String: Any] = [
//                                "status": "error",
//                                "reason": "insufficientGasFunds"
//                            ]
//                            resolve(responseDict)
//                        case BridgingError.noRoutesAvailable:
//                            let responseDict: [String: Any] = [
//                                "status": "error",
//                                "reason": "noRoutesAvailable"
//                            ]
//                            resolve(responseDict)
//                        }
//                        print(routeResponse)
//                        print(routeResponse.error)
//                    }
//                    //          resolve(result)
//                } catch {
//                    print("Error occurred: \(error)")
//                    print(error)
//                    reject("yttrium err", "yttrium_err", error)
//                }
//            }
//        }
//    }
//    
//    func convertUiFieldsToDictionary(_ uiFields: UiFields) -> [String: Any] {
//        func feeEstimatedTransactionToDictionary(_ transaction: YttriumWrapper.FeeEstimatedTransaction) -> [String: Any] {
//            return [
//                "chainId": transaction.chainId,
//                "from": transaction.from,
//                "to": transaction.to,
//                "value": transaction.value,
//                "input": transaction.input,
//                "gasLimit": transaction.gasLimit,
//                "nonce": transaction.nonce,
//                "maxFeePerGas": transaction.maxFeePerGas,
//                "maxPriorityFeePerGas": transaction.maxPriorityFeePerGas
//            ]
//        }
//
//        func amountToDictionary(_ amount: YttriumWrapper.Amount) -> [String: Any] {
//            return [
//                "symbol": amount.symbol,
//                "amount": amount.amount,
//                "unit": amount.unit,
//                "formatted": amount.formatted,
//                "formattedAlt": amount.formattedAlt
//            ]
//        }
//
//        func transactionFeeToDictionary(_ fee: YttriumWrapper.TransactionFee) -> [String: Any] {
//            return [
//                "fee": amountToDictionary(fee.fee),
//                "localFee": amountToDictionary(fee.localFee)
//            ]
//        }
//
//        func txnDetailsToDictionary(_ txnDetails: YttriumWrapper.TxnDetails) -> [String: Any] {
//            return [
//                "transaction": feeEstimatedTransactionToDictionary(txnDetails.transaction),
//                "fee": transactionFeeToDictionary(txnDetails.fee)
//            ]
//        }
//
//        return [
//            "route": uiFields.route.map { txnDetailsToDictionary($0) },
//            "localRouteTotal": amountToDictionary(uiFields.localRouteTotal),
//            "bridge": uiFields.bridge.map { transactionFeeToDictionary($0) },
//            "localBridgeTotal": amountToDictionary(uiFields.localBridgeTotal),
//            "initial": txnDetailsToDictionary(uiFields.initial),
//            "localTotal": amountToDictionary(uiFields.localTotal)
//        ]
//    }
//    
//    @objc
//    func getBridgeDetails(_ params: Any, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
//        print("getBridgeDetails called with", params)
//        let dict = params as? [String: String]
//        
//        if  let orchestrationId = dict?["orchestrationId"] ?? "" as Optional,
//            let projectId = dict?["projectId"] as? String {
//            
//            let client = ChainAbstractionClient.init(projectId: projectId)
//            print("created client, getting UI fields...")
//            Task {
//                do {
//                    
//                    let availableResponse = availableResponseDictionary[orchestrationId]!
//                    let uiFields = try await client.getUiFields(routeResponse: availableResponse, currency: Currency.usd)
//                    let uiFIeldsDict = convertUiFieldsToDictionary(uiFields)
//                    print("getBridgeDetails result", uiFields)
//                    resolve(uiFIeldsDict)
//                } catch {
//                    print("Error occurred: \(error)")
//                    print(error)
//                    reject("yttrium err", "yttrium_err getBridgeDetails", error)
//                }
//            }
//        }
//    }
//    
//    @objc
//    func getERC20Balance(_ params: Any, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
//        print("getERC20Balance called with", params)
//        let dict = params as? [String: String]
//        
//        if  let tokenAddress = dict?["tokenAddress"] ?? "" as Optional,
//            let ownerAddress = dict?["ownerAddress"] ?? "" as Optional,
//            let chainId = dict?["chainId"] ?? "" as Optional,
//            let projectId = dict?["projectId"] as? String {
//            
//            let client = ChainAbstractionClient.init(projectId: projectId)
//            Task {
//                do {
//                    let balance = try await client.erc20TokenBalance(chainId: chainId, token: tokenAddress, owner: ownerAddress)
//                    print("getERC20Balance result", balance)
//                    resolve(balance)
//                } catch {
//                    print("Error occurred: \(error)")
//                    print(error)
//                    reject("yttrium err", "yttrium_err getERC20Balance", error)
//                }
//            }
//        }
//    }
//    
//    @objc
//    func estimateFees(_ params: Any, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
//        print("getERC20Balance called with", params)
//        let dict = params as? [String: String]
//        
//        if let chainId = dict?["chainId"] ?? "" as Optional,
//            let projectId = dict?["projectId"] as? String {
//            
//            let client = ChainAbstractionClient.init(projectId: projectId)
//            Task {
//                do {
//                    let fees = try await client.estimateFees(chainId: chainId)
//                    print("estimateFees result", fees)
//                    resolve(["maxFeePerGas": fees.maxFeePerGas, "maxPriorityFeePerGas": fees.maxPriorityFeePerGas])
//                } catch {
//                    print("Error occurred: \(error)")
//                    print(error)
//                    reject("yttrium err", "yttrium_err estimateFees", error)
//                }
//            }
//        }
//    }
    
}
