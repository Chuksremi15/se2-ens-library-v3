import { wagmiConnectors } from "./wagmiConnectors";
import { Chain, HttpTransport, createClient, http } from "viem";
import { goerli, hardhat, holesky, mainnet, sepolia } from "viem/chains";
import { createConfig, fallback } from "wagmi";
import { goerliWithEns, holeskyWithEns, mainnetWithEns, sepoliaWithEns } from "~~/ensLibrary/constants/chains";
import scaffoldConfig from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

const infuraKey = process.env.NEXT_PUBLIC_INFURA_KEY || "cfa6ae2501cc4354a74e20432507317c";
const tenderlyKey = process.env.NEXT_PUBLIC_TENDERLY_KEY || "4imxc4hQfRjxrVB2kWKvTo";

const infuraUrl = (chainName: string) => `https://${chainName}.infura.io/v3/${infuraKey}`;
const cloudflareUrl = (chainName: string) => `https://web3.ens.domains/v1/${chainName}`;
const tenderlyUrl = (chainName: string) => `https://${chainName}.gateway.tenderly.co/${tenderlyKey}`;

type SupportedUrlFunc = typeof infuraUrl | typeof cloudflareUrl | typeof tenderlyUrl;

const initialiseTransports = <const UrlFuncArray extends SupportedUrlFunc[]>(
  chainName: string,
  urlFuncArray: UrlFuncArray,
) => {
  const transportArray: HttpTransport[] = [];

  for (const urlFunc of urlFuncArray) {
    // eslint-disable-next-line no-continue
    if (urlFunc === infuraUrl && process.env.NEXT_PUBLIC_IPFS) continue;
    transportArray.push(http(urlFunc(chainName)));
  }

  return fallback(transportArray);
};

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
