import React, { useRef, useState } from "react";
import { PrimaryButton } from "../Button/Button";
import { RegistrationReducerDataItem } from "./types";
import { RegistrationParameters } from "@ensdomains/ensjs/utils";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { getPublicClient } from "@wagmi/core";
import { useAccount, useChainId, useConnectorClient, useSendTransaction } from "wagmi";
import { WalletIcon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { transactions } from "~~/ensLibrary/flow/transaction-flow";
import { useQueryOptions } from "~~/ensLibrary/hooks/useQueryOptions";
import useRegistrationParams from "~~/ensLibrary/hooks/useRegistrationParams";
import { ConfigWithEns } from "~~/ensLibrary/types/types";
import { yearsToSeconds } from "~~/ensLibrary/utils/ensUtils";
import { createTransactionRequestQueryFn, getUniqueTransaction } from "~~/ensLibrary/utils/query";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { getBlockExplorerTxLink, getParsedError, notification } from "~~/utils/scaffold-eth";

const TxnNotification = ({ message, blockExplorerLink }: { message: string; blockExplorerLink?: string }) => {
  return (
    <div className={`flex flex-col ml-1 cursor-default`}>
      <p className="my-0">{message}</p>
      {blockExplorerLink && blockExplorerLink.length > 0 ? (
        <a href={blockExplorerLink} target="_blank" rel="noreferrer" className="block link text-md">
          check out transaction
        </a>
      ) : null}
    </div>
  );
};

const ConfirmTrxDetails = ({
  registrationData,
  transactioName,
  onSuccessFn,
}: {
  registrationData: RegistrationReducerDataItem;
  transactioName: "commitName" | "registerName";
  onSuccessFn: () => void;
}) => {
  const chainId = useChainId();
  const publicClient = getPublicClient(wagmiConfig);
  const { isConnected } = useAccount();
  const { data: connectorClient } = useConnectorClient<ConfigWithEns>();

  const registrationParams = useRegistrationParams({
    name: registrationData.name,
    owner: registrationData.address!,
    registrationData,
  });

  const params: RegistrationParameters = {
    name: registrationData.name,
    duration: yearsToSeconds(registrationData.years),
    owner: registrationData.address as `0x${string}`,
    secret: registrationData.secret as `0x${string}`,
  };

  const transaction = getUniqueTransaction({
    name: transactioName,
    data: params,
  });

  const transactionInfo = transactions[transactioName].displayItems(registrationParams);

  const initialOptions = useQueryOptions({
    params: transaction,
    functionName: "createTransactionRequest",
    queryDependencyType: "standard",
    queryFn: createTransactionRequestQueryFn,
  });

  const isSafeApp = true;

  const preparedOptions = queryOptions({
    queryKey: initialOptions.queryKey,
    queryFn: initialOptions.queryFn({ connectorClient, isSafeApp }),
  });

  const transactionRequestQuery = useQuery({
    ...preparedOptions,
    enabled: true,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const { data: request, isLoading: requestLoading, error: requestError } = transactionRequestQuery;

  console.log("request error: ", requestError);
  console.log("request: ", request);

  const [notificationId, setNotificationId] = useState<string>("");

  const { isPending: transactionLoading, sendTransaction } = useSendTransaction({
    mutation: {
      onSuccess: async data => {
        notification.remove(notificationId);

        const transactionHash = data;
        const blockExplorerTxURL = chainId ? getBlockExplorerTxLink(chainId, transactionHash) : "";

        const waitingForTrxNotificationId = notification.loading(
          <TxnNotification message="Waiting for transaction to complete." blockExplorerLink={blockExplorerTxURL} />,
        );

        const transactionReceipt = await publicClient.waitForTransactionReceipt({
          hash: transactionHash,
        });

        notification.remove(waitingForTrxNotificationId);

        notification.success(
          <TxnNotification message="Transaction completed successfully!" blockExplorerLink={blockExplorerTxURL} />,
          {
            icon: "🎉",
          },
        );

        onSuccessFn();

        triggerCheckboxClick();
      },
      onMutate: async data => {
        setNotificationId(notification.loading(<TxnNotification message="Awaiting for user confirmation" />));
      },

      onError: async data => {
        notification.remove(notificationId);
        const message = getParsedError(data);
        notification.error(message, { duration: 5000 });
      },
    },
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const triggerCheckboxClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div>
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
                  loading={transactionLoading || requestLoading}
                  action={() => sendTransaction(request!)}
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
    </div>
  );
};

export default ConfirmTrxDetails;
