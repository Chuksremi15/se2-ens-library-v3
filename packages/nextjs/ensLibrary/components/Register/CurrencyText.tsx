import { useEthPrice } from "~~/ensLibrary/hooks/useEthPrice";
import { makeDisplay } from "~~/ensLibrary/utils/makeDisplay";

export type CurrencyDisplay = "usd" | "eur" | "gbp" | "aud" | "eth";

type Props = {
  eth?: bigint;
  /* Percentage buffer to multiply value by when displaying in ETH, defaults to 100 */
  bufferPercentage?: bigint;
  currency: CurrencyDisplay;
};

export const CurrencyText = ({ eth, bufferPercentage = 100n, currency = "eth" }: Props) => {
  const { data: ethPrice, isLoading: isEthPriceLoading } = useEthPrice();

  const isLoading = isEthPriceLoading || !eth || !ethPrice;

  const bufferPercentageBigInt = BigInt(bufferPercentage);

  return (
    <div>
      {(() => {
        if (isLoading) return "0.0001 ETH";
        if (currency === "eth") return makeDisplay({ value: (eth * bufferPercentage) / 100n, symbol: "eth" });
        return makeDisplay({ value: (eth * ethPrice) / BigInt(1e8), symbol: currency });
      })()}
    </div>
  );
};
