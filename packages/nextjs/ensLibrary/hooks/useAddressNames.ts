import { ConfigWithEns, CreateQueryKey, QueryConfig } from "../types/types";
import { prepareQueryOptions } from "../utils/prepareQueryOptions";
import { useQueryOptions } from "./useQueryOptions";
import {
  GetNamesForAddressParameters,
  GetNamesForAddressReturnType,
  getNamesForAddress,
} from "@ensdomains/ensjs/subgraph";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

type UseNamesForAddressConfig = QueryConfig<GetNamesForAddressReturnType, Error>;

type QueryKey<TParams extends GetNamesForAddressParameters> = CreateQueryKey<TParams, "getNamesForAddress", "standard">;

export const getNamesForAddressQueryFn =
  (config: ConfigWithEns) =>
  async <TParams extends GetNamesForAddressParameters>({
    queryKey: [{ address, ...params }, chainId],
  }: QueryFunctionContext<QueryKey<TParams>>) => {
    if (!address) throw new Error("address is required");

    const client = config.getClient({ chainId });

    return getNamesForAddress(client, { address });
  };

export const useAddressNames = <TParams extends GetNamesForAddressParameters>({
  // config
  enabled = true,
  gcTime,
  staleTime,
  scopeKey,
  // params
  ...params
}: TParams & UseNamesForAddressConfig) => {
  const initialOptions = useQueryOptions({
    params,
    scopeKey,
    functionName: "getNamesForAddress",
    queryDependencyType: "standard",
    queryFn: getNamesForAddressQueryFn,
  });

  const preparedOptions = prepareQueryOptions({
    queryKey: initialOptions.queryKey,
    queryFn: initialOptions.queryFn,
    enabled: enabled && !!params.address,
    gcTime,
    staleTime,
  });

  const query = useQuery(preparedOptions);

  return {
    ...query,
    refetchIfEnabled: preparedOptions.enabled ? query.refetch : () => {},
  };
};
