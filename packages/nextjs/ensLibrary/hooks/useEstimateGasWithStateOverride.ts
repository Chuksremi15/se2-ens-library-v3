import { useEffect, useMemo, useState } from "react";
import { TransactionName, TransactionParameters, createTransactionRequest } from "../flow/transaction-flow/index";
import { ConnectorClientWithEns } from "../types/ensTransactionTypes";
import { ConfigWithEns, Prettify } from "../types/types";
import { useGasPrice } from "./useGasPrice";
import {
  Address,
  BlockNumber,
  BlockTag,
  Hex,
  RpcTransactionRequest,
  TransactionRequest,
  concatHex,
  formatEther,
  formatTransactionRequest,
  hexToBigInt,
  keccak256,
  padHex,
  parseEther,
  toHex,
} from "viem";
import { useChainId, useConfig, useConnect, useConnectorClient } from "wagmi";

type UserStateValue = {
  slot: number;
  keys: Hex[];
  value: Hex | boolean | bigint;
};

type UserStateOverrides = {
  address: Address;
  /* Fake balance to set for the account before executing the call */
  balance?: bigint;
  /* Fake nonce to set for the account before executing the call */
  nonce?: number;
  /* Fake EVM bytecode to inject into the account before executing the call */
  code?: Hex;
  /* Fake key-value mapping to override **all** slots in the account storage before executing the call */
  state?: UserStateValue[];
  /* Fake key-value mapping to override **individual** slots in the account storage before executing the call */
  stateDiff?: UserStateValue[];
}[];

type StateOverride<Quantity256 = bigint, Quantity = number> = {
  [address: Address]: {
    /* Fake balance to set for the account before executing the call */
    balance?: Quantity256;
    /* Fake nonce to set for the account before executing the call */
    nonce?: Quantity;
    /* Fake EVM bytecode to inject into the account before executing the call */
    code?: Hex;
    /* Fake key-value mapping to override **all** slots in the account storage before executing the call */
    state?: {
      [slot: Hex]: Hex;
    };
    /* Fake key-value mapping to override **individual** slots in the account storage before executing the call */
    stateDiff?: {
      [slot: Hex]: Hex;
    };
  };
};

type TransactionItem = {
  [TName in TransactionName]: Omit<TransactionParameters<TName>, "client" | "connectorClient"> & {
    name: TName;
    stateOverride?: UserStateOverrides;
  };
}[TransactionName];

type UseEstimateGasWithStateOverrideParameters<
  TransactionItems extends TransactionItem[] | readonly TransactionItem[],
> = {
  transactions: TransactionItems;
};

type GasEstimateArray<TransactionItems extends TransactionItem[] | readonly TransactionItem[]> = Prettify<{
  [n in keyof TransactionItems]: bigint;
}>;

type UseEstimateGasWithStateOverrideReturnType<
  TransactionItems extends TransactionItem[] | readonly TransactionItem[] = TransactionItem[],
> = {
  reduced: bigint;
  gasEstimates: GasEstimateArray<TransactionItems>;
};

const leftPadBytes32 = (hex: Hex) => padHex(hex, { dir: "left", size: 32 });

const concatKey = (existing: Hex, key: Hex) => keccak256(concatHex([leftPadBytes32(key), existing]));
const calculateStorageValue = (value: UserStateValue["value"]) => {
  if (typeof value === "boolean") {
    return value ? leftPadBytes32("0x01") : leftPadBytes32("0x00");
  }

  if (typeof value === "bigint") {
    return leftPadBytes32(toHex(value));
  }

  return leftPadBytes32(value);
};

const mapUserState = (state: UserStateValue[]) =>
  Object.fromEntries(
    state.map(({ slot, keys, value }) => {
      const storageKey = keys.reduce(concatKey, leftPadBytes32(toHex(slot)));
      const storageValue = calculateStorageValue(value);
      return [storageKey, storageValue];
    }),
  );

export const addStateOverride = <
  const TTransactionItem extends TransactionItem | Readonly<TransactionItem>,
  const TStateOverride extends UserStateOverrides,
>({
  item,
  stateOverride,
}: {
  item: TTransactionItem;
  stateOverride: TStateOverride;
}) =>
  ({
    ...item,
    stateOverride,
  } as Prettify<TTransactionItem & { stateOverride: TStateOverride }>);

const estimateIndividualGas = async <TName extends TransactionName>({
  data,
  name,
  stateOverride,
  connectorClient,
  client,
}: { name: TName; stateOverride?: UserStateOverrides } & TransactionParameters<TName>) => {
  const generatedRequest = await createTransactionRequest({
    client,
    connectorClient,
    data,
    name,
  });

  const formattedRequest = formatTransactionRequest({
    ...generatedRequest,
    from: connectorClient.account.address,
  } as TransactionRequest);

  const stateOverrideWithBalance = stateOverride?.find(s => s.address === connectorClient.account.address)
    ? stateOverride
    : [
        ...(stateOverride || []),
        {
          address: connectorClient.account.address,
          balance:
            ("value" in generatedRequest && generatedRequest.value ? generatedRequest.value : 0n) + parseEther("10"),
        },
      ];

  const formattedOverrides = Object.fromEntries(
    (stateOverrideWithBalance || []).map(({ address, balance, nonce, code, state, stateDiff }) => [
      address,
      {
        ...(state ? { state: mapUserState(state) } : {}),
        ...(stateDiff ? { stateDiff: mapUserState(stateDiff) } : {}),
        ...(code ? { code } : {}),
        ...(balance ? { balance: toHex(balance) } : {}),
        ...(nonce ? { nonce: toHex(nonce) } : {}),
      },
    ]),
  );

  return client
    .request<{
      Method: "eth_estimateGas";
      Parameters:
        | [transaction: RpcTransactionRequest]
        | [transaction: RpcTransactionRequest, block: BlockNumber | BlockTag]
        | [transaction: RpcTransactionRequest, block: BlockNumber | BlockTag, overrides: StateOverride<Hex, Hex>];
      ReturnType: Hex;
    }>({
      method: "eth_estimateGas",
      params: [formattedRequest, "latest", formattedOverrides],
    })
    .then(g => hexToBigInt(g));
};

export const estimateGasWithStateOverrideQueryFn =
  (config: ConfigWithEns) =>
  (connectorClient: ConnectorClientWithEns | undefined) =>
  async <
    TransactionItems extends TransactionItem[] | readonly TransactionItem[],
    TParams extends UseEstimateGasWithStateOverrideParameters<TransactionItems>,
  >({
    transactions,
    chainId,
  }: {
    transactions: TransactionItem[] | readonly TransactionItem[];
    chainId: 1 | 5 | 17000 | 11155111;
  }) => {
    const client = config.getClient({ chainId });

    const connectorClientWithAccount = {
      ...(connectorClient ?? client),
      ...(connectorClient?.account?.address
        ? {}
        : {
            account: {
              address: "0x0673cdcbaDBD4137A627A92123c94D5CDBA05839c3",
              type: "json-rpc",
            },
          }),
    } as ConnectorClientWithEns;

    const gasEstimates = await Promise.all(
      transactions.map(t =>
        estimateIndividualGas({
          ...t,
          client,
          connectorClient: connectorClientWithAccount,
        }),
      ),
    );

    return {
      reduced: gasEstimates.reduce((acc, curr) => acc + curr, 0n),
      gasEstimates,
    };
  };

export const useEstimateGasWithStateOverride = <
  const TransactionItems extends TransactionItem[] | readonly TransactionItem[],
>({
  ...params
}: UseEstimateGasWithStateOverrideParameters<TransactionItems>) => {
  const { data: connectorClient, isLoading: isConnectorLoading } = useConnectorClient<ConfigWithEns>();

  const chainId = useChainId();
  const config = useConfig();

  const [query, setQuery] = useState<{ reduced: bigint; gasEstimates: bigint[] }>({ reduced: 0n, gasEstimates: [] }); // Replace `any` with the correct type
  const [queryError, setQueryError] = useState<Error | null>(null);

  useEffect(() => {
    estimateGasWithStateOverrideQueryFn(config)(connectorClient)({
      transactions: params.transactions,
      chainId: chainId,
    })
      .then(setQuery)
      .catch(setQueryError);
  }, [config, connectorClient, params.transactions, chainId]);

  const { data: gasPrice, isLoading: isGasPriceLoading, isFetching: isGasPriceFetching } = useGasPrice();

  const data = useMemo(() => {
    if (!gasPrice || !query.gasEstimates) {
      return {
        gasEstimate: 0n,
        gasEstimateArray: params.transactions.map(() => 0n) as GasEstimateArray<TransactionItems>,
        gasCost: 0n,
        gasCostEth: "0",
      };
    }

    const gasEstimate = query.reduced;
    const gasEstimateArray = query.gasEstimates as GasEstimateArray<TransactionItems>;
    const gasCost_ = gasPrice * gasEstimate;

    return {
      gasEstimate,
      gasEstimateArray,
      gasCost: gasCost_,
      gasCostEth: formatEther(gasCost_),
    };
  }, [gasPrice, params.transactions, query]);

  const isLoading = isGasPriceLoading || isConnectorLoading;

  return useMemo(
    () => ({
      ...query,
      data,
      gasPrice,
      isLoading,
    }),
    [data, gasPrice, isLoading, query],
  );
};
