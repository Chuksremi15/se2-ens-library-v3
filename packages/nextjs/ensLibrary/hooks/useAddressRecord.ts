import { ConfigWithEns, CreateQueryKey, PartialBy, QueryConfig } from "../types/types";
import { prepareQueryOptions } from "../utils/prepareQueryOptions";
import { useQueryOptions } from "./useQueryOptions";
import { GetAddressRecordParameters, GetAddressRecordReturnType, getAddressRecord } from "@ensdomains/ensjs/public";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

type UseAddressRecordParameters = PartialBy<GetAddressRecordParameters, "name">;

type UseAddressRecordReturnType = GetAddressRecordReturnType;

type UseAddressRecordConfig = QueryConfig<UseAddressRecordReturnType, Error>;

type QueryKey<TParams extends UseAddressRecordParameters> = CreateQueryKey<TParams, "getAddressRecord", "standard">;

export const getAddressRecordQueryFn =
  (config: ConfigWithEns) =>
  async <TParams extends UseAddressRecordParameters>({
    queryKey: [{ name, ...params }, chainId],
  }: QueryFunctionContext<QueryKey<TParams>>) => {
    if (!name) throw new Error("name is required");

    const client = config.getClient({ chainId });

    return getAddressRecord(client, { name, ...params });
  };

export const useAddressRecord = <TParams extends UseAddressRecordParameters>({
  // config
  enabled = true,
  gcTime,
  staleTime,
  scopeKey,
  // params
  ...params
}: TParams & UseAddressRecordConfig) => {
  const initialOptions = useQueryOptions({
    params,
    scopeKey,
    functionName: "getAddressRecord",
    queryDependencyType: "standard",
    queryFn: getAddressRecordQueryFn,
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
