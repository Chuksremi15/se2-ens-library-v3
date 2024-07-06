import { wagmiConnectors } from "./wagmiConnectors";
import { Chain, HttpTransport, createClient, http } from "viem";
import { goerli, hardhat, holesky, mainnet, sepolia } from "viem/chains";
import { createConfig, fallback } from "wagmi";
import { goerliWithEns, holeskyWithEns, mainnetWithEns, sepoliaWithEns } from "~~/ensLibrary/constants/chains";
import scaffoldConfig from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

const { targetNetworks } = scaffoldConfig;

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
// export const enabledChains = targetNetworks.find((network: Chain) => network.id === 1)
//   ? targetNetworks
//   : ([...targetNetworks, mainnetWithEns] as const);

//const chains = [mainnetWithEns, goerliWithEns, sepoliaWithEns, holeskyWithEns] as const;

const wagmiConfig_ = createConfig({
  chains: targetNetworks,
  connectors: wagmiConnectors,
  ssr: true,
  client({ chain }) {
    return createClient({
      chain,
      transport: http(getAlchemyHttpUrl(chain.id)),
      ...(chain.id !== (hardhat as Chain).id
        ? {
            pollingInterval: scaffoldConfig.pollingInterval,
          }
        : {}),
    });
  },
});

export const wagmiConfig = wagmiConfig_ as typeof wagmiConfig_ & {
  _isEns: true;
};

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
