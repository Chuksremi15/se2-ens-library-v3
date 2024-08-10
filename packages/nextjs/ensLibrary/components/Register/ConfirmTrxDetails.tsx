import React, { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { PrimaryButton } from "../Button/Button";
import { RegistrationReducerDataItem } from "./types";
import { RegistrationParameters } from "@ensdomains/ensjs/utils";
import { commitName } from "@ensdomains/ensjs/wallet";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { getPublicClient, getWalletClient } from "@wagmi/core";
import { createWalletClient } from "viem";
import { useAccount, useChainId, useClient, useConfig, useConnectorClient } from "wagmi";
import { Connector, useConnect } from "wagmi";
import { WalletIcon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import getCommitNameDisplay from "~~/ensLibrary/flow/transaction-flow/commitName";
import { useQueryOptions } from "~~/ensLibrary/hooks/useQueryOptions";
import useRegistrationParams from "~~/ensLibrary/hooks/useRegistrationParams";
import { ConfigWithEns } from "~~/ensLibrary/types/types";
import { yearsToSeconds } from "~~/ensLibrary/utils/ensUtils";
import { createTransactionRequestQueryFn, getUniqueTransaction } from "~~/ensLibrary/utils/query";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const ConfirmTrxDetails = ({
  registrationData,
  setStartTimer,
}: {
  registrationData: RegistrationReducerDataItem;
  setStartTimer: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { address, isConnected } = useAccount();
  const config = useConfig();
  const { data: connectorClient } = useConnectorClient<ConfigWithEns>();
  const commitNameTrx = useTransactor();

  const [commitNameLoading, setCommitNameLoading] = useState<boolean>(false);

  const registrationParams = useRegistrationParams({
    name: registrationData.name,
    owner: registrationData.address!,
    registrationData,
  });

  const transactionInfo = getCommitNameDisplay.displayItems(registrationParams);

  const params: RegistrationParameters = {
    name: registrationData.name,
    duration: yearsToSeconds(registrationData.years),
    owner: registrationData.address as `0x${string}`,
    secret: registrationData.secret as `0x${string}`,
  };

  const commitUserName = async () => {
    try {
      setCommitNameLoading(true);

      const client = await getWalletClient(config, {
        account: address,
      });

      const transactionHashh = commitName.makeFunctionData(client, params);

      //await commitNameTrx(transactionHashh);

      // const transactionHash = await commitName(client, { ...params, account: registrationData.address });
      triggerCheckboxClick();

      setStartTimer(true);

      setCommitNameLoading(false);
    } catch (error) {
      console.log(error);
      setCommitNameLoading(false);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const triggerCheckboxClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <>
      <input ref={inputRef} type="checkbox" id={`transaction-modal`} className="modal-toggle" />

      <label htmlFor={`transaction-modal`} className="modal cursor-pointer">
        <label className="modal-box relative">
          {/* dummy input to capture event onclick on modal box */}
          <div>
            <label htmlFor={`transaction-modal`} className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
              ✕
            </label>
          </div>

          <div>
            <h5 className="text-xl font-medium text-center">Confirm Details</h5>

            <WalletIcon className="text-base w-10 text-primary mx-auto mt-4" />

            <p className="text-sm text-center font-medium">
              Double check these details before confirming in your wallet.
            </p>

            <div className="px-3 flex flex-col gap-y-2">
              {transactionInfo.map(({ label, value }, index) => (
                <div key={index} className="flex items-center justify-between border rounded-xl px-5 py-4 text-sm">
                  <h6>{label}</h6>
                  <h5 className="font-bold">{value}</h5>
                </div>
              ))}
            </div>

            <div className="px-3 mt-5">
              {isConnected ? (
                <PrimaryButton
                  loading={commitNameLoading}
                  action={() => {
                    commitUserName();
                  }}
                  //action={triggerCheckboxClick}
                  text={"Open wallet"}
                  btnWidth="100%"
                />
              ) : (
                <div className=" flex items-center justify-center">
                  <RainbowKitCustomConnectButton />
                </div>
              )}
            </div>
          </div>
        </label>
      </label>
    </>
  );
};

export default ConfirmTrxDetails;
