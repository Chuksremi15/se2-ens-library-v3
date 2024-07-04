import { ConfigWithEns, CreateQueryKey, PartialBy, QueryConfig } from "../types/types";
import { prepareQueryOptions } from "../utils/prepareQueryOptions";
import { useQueryOptions } from "./useQueryOptions";
import { GetWrapperDataParameters, GetWrapperDataReturnType, getWrapperData } from "@ensdomains/ensjs/public";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

type UseWrapperDataParameters = PartialBy<GetWrapperDataParameters, "name">;

export type UseWrapperDataReturnType = GetWrapperDataReturnType;

type UseWrapperDataConfig = QueryConfig<UseWrapperDataReturnType, Error>;

type QueryKey<TParams extends UseWrapperDataParameters> = CreateQueryKey<TParams, "getWrapperData", "standard">;

export const getWrapperDataQueryFn =
  (config: ConfigWithEns) =>
  async <TParams extends UseWrapperDataParameters>({
    queryKey: [{ name }, chainId],
  }: QueryFunctionContext<QueryKey<TParams>>) => {
    if (!name) throw new Error("name is required");

    const client = config.getClient({ chainId });

    return getWrapperData(client, { name });
  };

export const useWrapperData = <TParams extends UseWrapperDataParameters>({
  // config
  enabled = true,
  gcTime,
  staleTime,
  scopeKey,
  // params
  ...params
}: TParams & UseWrapperDataConfig) => {
  const initialOptions = useQueryOptions({
    params,
    scopeKey,
    functionName: "getWrapperData",
    queryDependencyType: "standard",
    queryFn: getWrapperDataQueryFn,
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
