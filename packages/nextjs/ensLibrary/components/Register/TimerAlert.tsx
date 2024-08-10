import React, { useEffect, useState } from "react";
import { BackButton, OpenModalBtn, PrimaryButton, SecondaryButton } from "../Button/Button";
import ConfirmTrxDetails from "./ConfirmTrxDetails";
import RegisterNameModal from "./RegisterNameModal";
import { RegistrationReducerDataItem } from "./types";
import { RegistrationParameters } from "@ensdomains/ensjs/utils";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { Hash, Transaction } from "viem";
import { useChainId, useConfig, useConnectorClient, useSendTransaction, useWalletClient } from "wagmi";
import { SendTransactionReturnType } from "wagmi/actions";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useQueryOptions } from "~~/ensLibrary/hooks/useQueryOptions";
import useRegistrationParams from "~~/ensLibrary/hooks/useRegistrationParams";
import { ConfigWithEns, ConnectorClientWithEns } from "~~/ensLibrary/types/ensTransactionTypes";
import { yearsToSeconds } from "~~/ensLibrary/utils/ensUtils";
import { createTransactionRequestQueryFn, getUniqueTransaction } from "~~/ensLibrary/utils/query";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export const TimerAlert = ({
  searchItem,
  prevPage,
  nextPage,
  registrationData,
}: {
  searchItem: string;
  prevPage: () => void;
  nextPage: () => void;
  registrationData: RegistrationReducerDataItem;
}) => {
  if (!searchItem) {
    prevPage();
  }
  const chainId = useChainId();

  const config = useConfig();
  const client = config.getClient({ chainId });

  const walletClient = useWalletClient();

  const [startTimer, setStartTimer] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);

  const { data: connectorClient } = useConnectorClient<ConfigWithEns>();

  const params: RegistrationParameters = {
    name: registrationData.name,
    duration: yearsToSeconds(registrationData.years),
    owner: registrationData.address as `0x${string}`,
    secret: registrationData.secret as `0x${string}`,
  };

  console.log("params: ", params);

  const transaction = getUniqueTransaction({
    name: "registerName",
    data: params,
  });

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
  });

  const { data: request, isLoading: requestLoading, error: requestError } = transactionRequestQuery;

  console.log("request error: ", requestError);
  console.log("request: ", request);

  const commitNameTrx = useTransactor();

  // const sendTransacitonCommitName = async () => {
  //   const serializedTransaction = await connectorClient.signTransaction(request);
  //   const hash = await client.sendRawTransaction({ serializedTransaction });
  // };

  const addTransactionSuccess =
    ({}: {}) =>
    async (tx: SendTransactionReturnType) => {
      console.log("Transaction sent");

      let transactionData: Transaction | null = null;
      try {
        // If using private mempool, this won't error, will return null
        // transactionData = await connectorClient.request<{
        //   Method: 'eth_getTransactionByHash'
        //   Parameters: [hash: Hash]
        //   ReturnType: Transaction | null
        // }>({ method: 'eth_getTransactionByHash', params: [tx] })
      } catch (e) {
        // this is expected to fail in most cases
      }

      if (!transactionData) {
        try {
          transactionData = await client.request({
            method: "eth_getTransactionByHash",
            params: [tx],
          });

          console.log("transaction data: ", transactionData);
        } catch (e) {
          console.error("Failed to get transaction info");
        }
      }
    };

  const {
    isPending: transactionLoading,
    error: transactionError,
    sendTransaction,
  } = useSendTransaction({
    mutation: {
      onSuccess: addTransactionSuccess,
    },
  });

  return (
    <div>
      <RegisterNameModal registrationData={registrationData} />
      <ConfirmTrxDetails registrationData={registrationData} setStartTimer={setStartTimer} />

      <div className="flex flex-col gap-y-0 pt-2 pb-4 px-6 bg-base-100 w-full md:w-[500px] lg:w-[500px] rounded-xl shadow-sm">
        <div>
          <h5 className="text-xl font-medium text-startself-start"> {registrationData.name}</h5>
          <h5 className="text-2xl font-medium text-center">Almost there</h5>

          <div className="my-5">
            <MovingCircularBorder minutes={1} startTimer={startTimer} timeLeft={timeLeft} setTimeLeft={setTimeLeft} />
          </div>

          <p className="text-xs text-center font-medium">
            You will need to complete two transactions to secure your name. The second transaction must be completed
            within 24 hours of the first.
          </p>
        </div>
        <div className="flex items-center justify-center gap-x-2 ">
          <BackButton action={prevPage} text={"Back"} />
          {timeLeft === 0 ? (
            <>
              <PrimaryButton text={"send Transaction "} action={() => sendTransaction(request!)} />
              <OpenModalBtn text={"Finish"} modalId="registerNameModal-modal" />
            </>
          ) : (
            <>
              <PrimaryButton
                text={"send Transaction "}
                loading={transactionLoading}
                action={() => sendTransaction(request!)}
              />
              <OpenModalBtn text="Start timer" modalId="transaction-modal" loading={timeLeft < 60} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const MovingCircularBorder = ({
  minutes,
  startTimer = false,
  timeLeft,
  setTimeLeft,
}: {
  minutes: number;
  startTimer: boolean;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { setTheme, resolvedTheme } = useTheme();

  // Convert minutes to seconds

  useEffect(() => {
    if (startTimer) {
      if (timeLeft > 0) {
        const timer = setInterval(() => {
          setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
      }
    }
  }, [timeLeft, startTimer]);

  // Calculate the stroke-dashoffset based on the time left
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (timeLeft / (minutes * 60)) * circumference;

  const isDarkMode = resolvedTheme === "dark";

  return (
    <div className=" flex items-center justify-center relative">
      <svg height="120" width="120">
        <circle
          className=""
          cx="60"
          cy="60"
          r={radius}
          stroke={isDarkMode ? "#bdc7ea" : "#dae0ea"}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeLinecap="round" // Added this line for curved edges
        />
        <circle
          className="circle"
          cx="60"
          cy="60"
          r={radius}
          stroke={isDarkMode ? "#212638" : "#93BBFB"}
          strokeWidth="11"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round" // Added this line for curved edges
        />
      </svg>

      {timeLeft === 0 ? (
        <div className="absolute">
          <CheckIcon className={`${isDarkMode ? "text-#212638" : "text-blue-500"}  w-10  text-3xl`} />
        </div>
      ) : (
        <div className="time-left absolute ">{("0" + timeLeft).slice(-2)}</div>
      )}
    </div>
  );
};

export default TimerAlert;
