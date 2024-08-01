import React, { useMemo } from "react";
import { PrimaryButton } from "../Button/Button";
import { useAccount, useChainId, useConnectorClient } from "wagmi";
import { WalletIcon } from "@heroicons/react/24/outline";
import commitName from "~~/ensLibrary/flow/transaction-flow/commitName";
import useRegistrationParams from "~~/ensLibrary/hooks/useRegistrationParams";
import useRegistrationReducer from "~~/ensLibrary/hooks/useRegistrationReducer";
import { ConfigWithEns } from "~~/ensLibrary/types/types";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const ConfirmTrxDetails = ({ searchItem, action, info }: { searchItem: string; action: string; info: string }) => {
  const { address } = useAccount();
  const chainId = useChainId();

  const selected = useMemo(
    () => ({ name: searchItem && searchItem, address: address! }),
    [address, chainId, searchItem && searchItem],
  );

  const { item } = useRegistrationReducer(selected);

  const registrationParams = useRegistrationParams({
    name: searchItem,
    owner: address!,
    registrationData: item,
  });

  const transactionInfo = commitName.displayItems(registrationParams);

  const { data: connectorClient, isLoading: isConnectorLoading } = useConnectorClient<ConfigWithEns>();

  const client = wagmiConfig.getClient({ chainId });

  const transactionItem = useMemo(
    () => ({ client, connectorClient, data: registrationParams }),
    [client, connectorClient, registrationParams],
  );

  console.log("transactionItem: ", transactionItem);

  // const commitTx = commitName.transaction(transactionItem);

  return (
    <>
      <input type="checkbox" id={`transaction-modal`} className="modal-toggle" />

      <label htmlFor={`transaction-modal`} className="modal cursor-pointer">
        <label className="modal-box relative">
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <label htmlFor={`transaction-modal`} className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>

          <div>
            <h5 className="text-xl font-medium text-center">Confirm Details</h5>

            <WalletIcon className="text-base w-10 text-primary mx-auto mt-4" />

            <p className="text-sm text-center font-medium">
              Double check these details before confirming in your wallet.
            </p>

            <div className="px-3 flex flex-col gap-y-2">
              {transactionInfo.map(({ label, value }, index) => (
                <div className="flex items-center justify-between border rounded-xl px-5 py-4 text-sm">
                  <h6>{label}</h6>
                  <h5 className="font-bold">{value}</h5>
                </div>
              ))}
            </div>

            <div className="px-3 mt-5">
              <PrimaryButton text="Open wallet" btnWidth="100%" />
            </div>
          </div>
        </label>
      </label>
    </>
  );
};

export default ConfirmTrxDetails;
