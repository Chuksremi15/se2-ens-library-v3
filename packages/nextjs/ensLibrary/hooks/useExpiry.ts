import { ConfigWithEns, CreateQueryKey, PartialBy, QueryConfig } from "../types/types";
import { prepareQueryOptions } from "../utils/prepareQueryOptions";
import { useQueryOptions } from "./useQueryOptions";
import { GetExpiryParameters, GetExpiryReturnType, getExpiry } from "@ensdomains/ensjs/public";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

type UseExpiryParameters = PartialBy<GetExpiryParameters, "name">;

type UseExpiryReturnType = GetExpiryReturnType;

type UseExpiryConfig = QueryConfig<UseExpiryReturnType, Error>;

export type UseExpiryQueryKey<TParams extends UseExpiryParameters> = CreateQueryKey<TParams, "getExpiry", "standard">;

export const getExpiryQueryFn =
  (config: ConfigWithEns) =>
  async <TParams extends UseExpiryParameters>({
    queryKey: [{ name, ...params }, chainId],
  }: QueryFunctionContext<UseExpiryQueryKey<TParams>>) => {
    if (!name) throw new Error("name is required");

    const client = config.getClient({ chainId });

    return getExpiry(client, { name, ...params });
  };

export const useExpiry = <TParams extends UseExpiryParameters>({
  // config
  enabled = true,
  gcTime,
  staleTime,
  scopeKey,
  // params
  ...params
}: TParams & UseExpiryConfig) => {
  const initialOptions = useQueryOptions({
    params,
    scopeKey,
    functionName: "getExpiry",
    queryDependencyType: "standard",
    queryFn: getExpiryQueryFn,
  });

  const preparedOptions = prepareQueryOptions({
    queryKey: initialOptions.queryKey,
    queryFn: initialOptions.queryFn,
    enabled: enabled && !!params.name,
    gcTime,
    staleTime,
  });

  const query = useQuery(preparedOptions);

  return {
    ...query,
    refetchIfEnabled: preparedOptions.enabled ? query.refetch : () => {},
  };
};
