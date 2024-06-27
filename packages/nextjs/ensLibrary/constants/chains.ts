import { addEnsContracts } from "@ensdomains/ensjs";
import { holesky } from "viem/chains";
import { goerli, mainnet, sepolia } from "wagmi/chains";

export const mainnetWithEns = addEnsContracts(mainnet);
export const goerliWithEns = addEnsContracts(goerli);
export const sepoliaWithEns = addEnsContracts(sepolia);
export const holeskyWithEns = addEnsContracts(holesky);

export const chainsWithEns = [mainnetWithEns, goerliWithEns, sepoliaWithEns, holeskyWithEns] as const;

export const getSupportedChainById = (chainId: number | undefined) =>
  chainId ? chainsWithEns.find(c => c.id === chainId) : undefined;

export type SupportedChain =
  | typeof mainnetWithEns
  | typeof goerliWithEns
  | typeof sepoliaWithEns
  | typeof holeskyWithEns;
