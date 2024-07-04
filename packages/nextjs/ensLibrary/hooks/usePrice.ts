import { ConfigWithEns, CreateQueryKey, PartialBy, QueryConfig } from "../types/types";
import { prepareQueryOptions } from "../utils/prepareQueryOptions";
import { useQueryOptions } from "./useQueryOptions";
import { GetPriceParameters, GetPriceReturnType, getPrice } from "@ensdomains/ensjs/public";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

type UsePriceParameters = PartialBy<GetPriceParameters, "nameOrNames">;

type UsePriceReturnType = GetPriceReturnType;

type UsePriceConfig = QueryConfig<UsePriceReturnType, Error>;

type QueryKey<TParams extends UsePriceParameters> = CreateQueryKey<TParams, "getPrice", "standard">;

export const getPriceQueryFn =
  (config: ConfigWithEns) =>
  async <TParams extends UsePriceParameters>({
    queryKey: [{ nameOrNames, ...params }, chainId],
  }: QueryFunctionContext<QueryKey<TParams>>) => {
    if (!nameOrNames) throw new Error("nameOrNames is required");

    const client = config.getClient({ chainId });

    return getPrice(client, { nameOrNames, ...params });
  };

export const usePrice = <TParams extends UsePriceParameters>({
  // config
  enabled = true,
  gcTime,
  staleTime,
  scopeKey,
  // params
  ...params
}: TParams & UsePriceConfig) => {
  const initialOptions = useQueryOptions({
    params,
    scopeKey,
    functionName: "getPrice",
    queryDependencyType: "standard",
    queryFn: getPriceQueryFn,
  });

  const preparedOptions = prepareQueryOptions({
    queryKey: initialOptions.queryKey,
    queryFn: initialOptions.queryFn,
    enabled: enabled && !!params.nameOrNames,
    gcTime,
    staleTime,
  });

  const query = useQuery(preparedOptions);

  return {
    ...query,
    refetchIfEnabled: preparedOptions.enabled ? query.refetch : () => {},
  };
};
