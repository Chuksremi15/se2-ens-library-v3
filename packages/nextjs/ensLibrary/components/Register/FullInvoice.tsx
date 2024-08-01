import { useMemo, useState } from "react";
import { CurrencyDisplay, CurrencyText } from "./CurrencyText";
import { useLocalStorage } from "usehooks-ts";
import { formatEther, formatUnits, parseEther } from "viem";
import { useEstimateFullRegistration } from "~~/ensLibrary/hooks/useEstimateRegistration";
import { CURRENCY_FLUCTUATION_BUFFER_PERCENTAGE } from "~~/ensLibrary/utils/constants";
import { makeDisplay } from "~~/ensLibrary/utils/makeDisplay";

type Props = ReturnType<typeof useEstimateFullRegistration> & { unit: CurrencyDisplay };

export const FullInvoice = ({
  years,
  totalYearlyFee,
  estimatedGasFee,
  hasPremium,
  premiumFee,
  gasPrice,
  unit = "eth",
}: Props) => {
  const invoiceItems = useMemo(
    () => [
      {
        label: "invoice yearRegistration",
        bufferPercentage: CURRENCY_FLUCTUATION_BUFFER_PERCENTAGE,
        value: totalYearlyFee,
      },
      {
        label: "invoice estimatedNetworkFee",
        value: estimatedGasFee,
      },
      ...(hasPremium
        ? [
            {
              label: "invoice temporaryPremium",
              value: premiumFee,
              bufferPercentage: CURRENCY_FLUCTUATION_BUFFER_PERCENTAGE,
            },
          ]
        : []),
    ],
    [years, totalYearlyFee, estimatedGasFee, hasPremium, premiumFee],
  );

  const filteredItems = invoiceItems
    .map(({ value, bufferPercentage }) =>
      value && unit === "eth" && bufferPercentage ? (value * bufferPercentage) / 100n : value,
    )
    .filter((x): x is bigint => !!x);
  const total = filteredItems.reduce((a, b) => a + b, 0n);
  const hasEmptyItems = filteredItems.length !== invoiceItems.length;

  const [faitToggle, setFaitToggle] = useLocalStorage<boolean>("faitToggle", false, {
    initializeWithValue: false,
  });

  const gasLabel = gasPrice ? makeDisplay({ value: gasPrice, symbol: "Gwei", fromDecimals: 9 }) : "-";

  return (
    <div>
      <div className="mb-1 flex justify-between">
        <div className="text-xs flex items-center">Gas price: {gasLabel}</div>
        <div className="bg-base-200 p-1 rounded-md cursor-pointer ">
          <div className="flex relative">
            <div
              className={`${
                faitToggle ? "left-11" : "left-0"
              } bg-blue-500 absolute px-2 py-1 rounded-md h-7 w-11 transition-all duration-200`}
            ></div>
            <div
              onClick={() => {
                setFaitToggle(!faitToggle);
              }}
              className={`px-2 py-1 rounded-md text-sm font-semibold flex items-center justify-center relative`}
            >
              ETH
            </div>
            <div
              onClick={() => {
                setFaitToggle(!faitToggle);
              }}
              className={`px-2 py-1 rounded-md text-sm font-semibold  relative flex items-center justify-center`}
            >
              USD
            </div>
          </div>
        </div>
      </div>
      <div className="bg-base-200 flex flex-col gap-y-2 rounded-xl px-4 py-4 ">
        <>
          {invoiceItems.map(({ label, value, bufferPercentage }, index) =>
            label === "invoice yearRegistration" ? (
              <div key={index} className="flex justify-between font-body text-sm ">
                <h6>
                  {years} {years > 1 ? " years" : " year"} registration
                </h6>{" "}
                <h6>
                  {" "}
                  <CurrencyText
                    bufferPercentage={bufferPercentage}
                    eth={value || 0n}
                    currency={faitToggle ? "usd" : unit}
                  />
                </h6>
              </div>
            ) : (
              <div key={index} className="flex justify-between font-body text-sm ">
                <h6>Est. network fee</h6>{" "}
                <h6>
                  {" "}
                  <CurrencyText
                    bufferPercentage={bufferPercentage}
                    eth={value || 0n}
                    currency={faitToggle ? "usd" : unit}
                  />
                </h6>
              </div>
            ),
          )}

          <div className="flex justify-between font-body text-sm ">
            <h6>Estimated total</h6>{" "}
            <CurrencyText eth={hasEmptyItems ? 0n : total} currency={faitToggle ? "usd" : unit} />
          </div>
        </>
      </div>
    </div>
  );
};

export const Invoice = () => {
  return (
    <div>
      <div>FullInvoice</div>

      <div className="flex justify-between font-body text-sm ">
        <h6>Estimated total</h6> <h6>totalFee ETH</h6>
      </div>
    </div>
  );
};
