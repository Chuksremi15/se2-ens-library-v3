import { ConfigWithEns, CreateQueryKey, PartialBy, QueryConfig } from "../types/types";
import { prepareQueryOptions } from "../utils/prepareQueryOptions";
import { useQueryOptions } from "./useQueryOptions";
import { GetOwnerParameters, GetOwnerReturnType, getOwner } from "@ensdomains/ensjs/public";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

export type UseOwnerParameters = PartialBy<GetOwnerParameters, "name">;

type UseOwnerConfig = QueryConfig<GetOwnerReturnType, Error>;

export type UseOwnerQueryKey = CreateQueryKey<UseOwnerParameters, "getOwner", "standard">;

export const getOwnerQueryFn =
  (config: ConfigWithEns) =>
  async ({ queryKey: [{ name, ...params }, chainId] }: QueryFunctionContext<UseOwnerQueryKey>) => {
    if (!name) throw new Error("name is required");

    const client = config.getClient({ chainId });

    return getOwner(client, { name, ...params });
  };

export const useOwner = <const TParams extends UseOwnerParameters = UseOwnerParameters>({
  enabled = true,
  gcTime,
  staleTime,
  scopeKey,
  ...params
}: TParams & UseOwnerConfig) => {
  const initialOptions = useQueryOptions({
    params,
    scopeKey,
    functionName: "getOwner",
    queryDependencyType: "standard",
    queryFn: getOwnerQueryFn,
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
