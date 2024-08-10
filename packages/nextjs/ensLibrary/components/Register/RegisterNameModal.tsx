import React, { useRef, useState } from "react";
import { PrimaryButton } from "../Button/Button";
import { RegistrationReducerDataItem } from "./types";
import { useAccount, useChainId, useConfig, useConnectorClient } from "wagmi";
import { WalletIcon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { createTransactionRequest } from "~~/ensLibrary/flow/transaction-flow";
import getRegisterName from "~~/ensLibrary/flow/transaction-flow/registerName";
import { usePrice } from "~~/ensLibrary/hooks/usePrice";
import { useQueryOptions } from "~~/ensLibrary/hooks/useQueryOptions";
import useRegistrationParams from "~~/ensLibrary/hooks/useRegistrationParams";
import { ConfigWithEns } from "~~/ensLibrary/types/types";
import { calculateValueWithBuffer, yearsToSeconds } from "~~/ensLibrary/utils/ensUtils";
import { createTransactionRequestQueryFn, getUniqueTransaction } from "~~/ensLibrary/utils/query";
import { useTransactor } from "~~/hooks/scaffold-eth";

const RegisterNameModal = ({ registrationData }: { registrationData: RegistrationReducerDataItem }) => {
  const { address, isConnected } = useAccount();
  const config = useConfig();

  const registerNameTrx = useTransactor();

  const [registerNameLoading, setRegisterLoading] = useState<boolean>(false);

  const registrationParams = useRegistrationParams({
    name: registrationData.name,
    owner: registrationData.address!,
    registrationData,
  });

  const transactionInfo = getRegisterName.displayItems(registrationParams);

  //const { priceData } = useBasicName({ name: registrationData.name });

  const {
    data: priceData,
    isLoading: isPriceLoading,
    refetchIfEnabled: refetchPrice,
  } = usePrice({
    nameOrNames: registrationData.name,
    duration: yearsToSeconds(registrationData.years),
  });

  console.log("Registration data: ", registrationData);
  //console.log("base price: ", formatEther(priceData!.base));
  //console.log("base price: ", formatEther(priceData!.premium));

  const { data: connectorClient } = useConnectorClient<ConfigWithEns>();

  const chainId = useChainId();

  const inputRef = useRef<HTMLInputElement>(null);

  const triggerCheckboxClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const registerUserName = async () => {
    try {
      setRegisterLoading(true);

      console.log("Connector Client Address", connectorClient?.account.address);

      // const client = await getWalletClient(config, {
      //   account: address,
      // });

      // const price = await getPrice(client, {
      //   nameOrNames: registrationData.name,
      //   duration: yearsToSeconds(registrationData.years),
      // });

      // const value = price.base + price.premium;

      // const valueWithBuffer = calculateValueWithBuffer(value);

      // const params = {
      //   name: registrationData.name,
      //   duration: yearsToSeconds(registrationData.years),
      //   owner: registrationData.address as `0x${string}`,
      //   secret: registrationData.secret as `0x${string}`,
      //   value: valueWithBuffer,
      // };

      // console.log("params: ", params);

      //getRegisterName.transaction({ client, connectorClient, data: registrationParams });

      //const registrationFunctionData = registerName.makeFunctionData(client, params);

      //console.log("registrationFunctionData: ", registrationFunctionData);

      //await registerNameTrx(request);

      //triggerCheckboxClick();

      setRegisterLoading(false);
    } catch (error) {
      console.log(error);
      setRegisterLoading(false);
    }
  };

  return (
    <>
      <input ref={inputRef} type="checkbox" id={`registerNameModal-modal`} className="modal-toggle" />

      <label htmlFor={`registerNameModal-modal`} className="modal cursor-pointer">
        <label className="modal-box relative">
          {/* dummy input to capture event onclick on modal box */}
          <div>
            <label
              htmlFor={`registerNameModal-modal`}
              className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
            >
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
                  loading={registerNameLoading}
                  action={() => {
                    registerUserName();
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

export default RegisterNameModal;
