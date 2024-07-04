import { ClientWithEns } from "../types/types";
import { getChainContractAddress } from "viem";
import { useClient } from "wagmi";

export const getSupportedChainContractAddress = <
  TContract extends Extract<keyof ClientWithEns["chain"]["contracts"], string>,
  TContractObject extends ClientWithEns["chain"]["contracts"][TContract]["address"],
>({
  client,
  contract,
  blockNumber,
}: {
  client: ClientWithEns;
  contract: TContract;
  blockNumber?: bigint;
}) =>
  getChainContractAddress({
    chain: client.chain,
    contract,
    blockNumber,
  }) as TContractObject;

export const useContractAddress = <TContractName extends Extract<keyof ClientWithEns["chain"]["contracts"], string>>({
  contract,
  blockNumber,
}: {
  contract: TContractName;
  blockNumber?: bigint;
}) => {
  const client = useClient();

  return getSupportedChainContractAddress({
    client,
    contract,
    blockNumber,
  });
};
