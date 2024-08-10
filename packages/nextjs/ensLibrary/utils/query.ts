import { TransactionData, TransactionName, createTransactionRequest } from "../flow/transaction-flow";
import {
  BasicTransactionRequest,
  ClientWithEns,
  ConfigWithEns,
  ConnectorClientWithEns,
  CreateQueryKey,
} from "../types/ensTransactionTypes";
import { QueryFunctionContext } from "@tanstack/react-query";
import { Address, BlockTag, Hex, TransactionRequest, parseGwei, parseUnits, toHex } from "viem";
import { estimateGas, prepareTransactionRequest } from "viem/actions";

type AccessListResponse = {
  accessList: {
    address: Address;
    storageKeys: Hex[];
  }[];
  gasUsed: Hex;
};

export const registrationGasFeeModifier = (gasLimit: bigint, transactionName: TransactionName) =>
  // this addition is arbitrary, something to do with a gas refund but not 100% sure
  transactionName === "registerName" ? gasLimit + 5000n : gasLimit;

export const calculateGasLimit = async ({
  client,
  connectorClient,
  isSafeApp,
  txWithZeroGas,
  transactionName,
}: {
  client: ClientWithEns;
  connectorClient: ConnectorClientWithEns;
  isSafeApp: boolean;
  txWithZeroGas: BasicTransactionRequest;
  transactionName: TransactionName;
}) => {
  if (isSafeApp) {
    const accessListResponse = await client.request<{
      Method: "eth_createAccessList";
      Parameters: [tx: TransactionRequest<Hex>, blockTag: BlockTag];
      ReturnType: AccessListResponse;
    }>({
      method: "eth_createAccessList",
      params: [
        {
          to: txWithZeroGas.to,
          data: txWithZeroGas.data,
          from: connectorClient.account!.address,
          value: toHex(txWithZeroGas.value ? txWithZeroGas.value + 1000000n : 0n),
        },
        "latest",
      ],
    });

    return {
      gasLimit: registrationGasFeeModifier(BigInt(accessListResponse.gasUsed), transactionName),
      accessList: accessListResponse.accessList,
    };
  }

  const gasEstimate = await estimateGas(client, {
    ...txWithZeroGas,
    account: connectorClient.account!,
  });
  return {
    gasLimit: registrationGasFeeModifier(gasEstimate, transactionName),
    accessList: undefined,
  };
};

type UniqueTransaction<TName extends TransactionName = TransactionName> = {
  name: TName;
  data: TransactionData<TName>;
};

type CreateTransactionRequestQueryKey = CreateQueryKey<UniqueTransaction, "createTransactionRequest", "standard">;

export const createTransactionRequestQueryFn =
  (config: ConfigWithEns) =>
  ({
    connectorClient,
    isSafeApp,
  }: {
    connectorClient: ConnectorClientWithEns | undefined;
    isSafeApp: boolean | undefined;
  }) =>
  async ({ queryKey: [params, chainId, address] }: QueryFunctionContext<CreateTransactionRequestQueryKey>) => {
    const client = config.getClient({ chainId });

    if (!connectorClient) throw new Error("connectorClient is required");
    if (connectorClient.account.address !== address) throw new Error("address does not match connector");

    const transactionRequest = await createTransactionRequest({
      name: params.name,
      data: params.data,
      connectorClient,
      client,
    });

    console.log("transaction request: ", transactionRequest);

    const txWithZeroGas = {
      ...transactionRequest,
      maxFeePerGas: 0n,
      maxPriorityFeePerGas: 0n,
    };

    //isSafeApp: !!isSafeApp,

    const { gasLimit, accessList } = await calculateGasLimit({
      client,
      connectorClient,
      isSafeApp: false,
      txWithZeroGas,
      transactionName: params.name,
    });

    const request = await prepareTransactionRequest(client, {
      to: transactionRequest.to,
      accessList,
      account: connectorClient.account,
      data: transactionRequest.data,
      gas: gasLimit,
      parameters: ["fees", "nonce", "type"],
      ...("value" in transactionRequest ? { value: transactionRequest.value } : {}),
    });

    return {
      ...request,
      chain: request.chain!,
      to: request.to!,
      gas: request.gas!,
      chainId,
    };
  };

export const getUniqueTransaction = <Tdata>(transaction: { name: TransactionName; data: Tdata }) => {
  return {
    name: transaction.name,
    data: transaction.data,
  };
};
