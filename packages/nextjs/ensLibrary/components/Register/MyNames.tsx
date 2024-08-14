import React, { useEffect, useMemo, useState } from "react";
import { PrimaryButton, SecondaryButton } from "../Button/Button";
import { FullInvoice } from "../Register/FullInvoice";
import { RegistrationReducerDataItem } from "../Register/types";
import { useAccount, useChainId } from "wagmi";
import { useAddressNames } from "~~/ensLibrary/hooks/useAddressNames";
import { useContractAddress } from "~~/ensLibrary/hooks/useContractAddress";
import { useEstimateFullRegistration } from "~~/ensLibrary/hooks/useEstimateRegistration";
import useRegistrationReducer from "~~/ensLibrary/hooks/useRegistrationReducer";

export const MyNames = ({ registrationData }: { registrationData: RegistrationReducerDataItem }) => {
  const { address } = useAccount();

  const { data: addressNames, isLoading } = useAddressNames({ address: address as string });

  return (
    <div>
      <div className="flex flex-col gap-y-4 pt-2 pb-4 px-6 bg-base-100 w-full md:w-[500px] lg:w-[500px] rounded-xl shadow-sm">
        <div>
          <h5 className="text-xl font-medium text-startself-start">Names</h5>
        </div>

        <div>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <span className="loading loading-spinner loading-sm"></span>
            </div>
          ) : addressNames && addressNames.length < 1 ? (
            <div></div>
          ) : (
            addressNames &&
            addressNames.map(({ name, labelName, parentName }, index) => (
              <div key={index} className="flex justify-between w-full border-b bg-base-100  px-4 text-center ">
                <div className="flex items-center gap-x-3">
                  <div className="h-6 w-6 bg-blue-500 rounded-full" />
                  <p className="font-body font-medium">
                    {name && name.length > 30
                      ? name.slice(0, 5) + "...." + name.slice(name.length - 5, name.length)
                      : name}
                  </p>
                </div>

                <p className="flex items-center justify-center px-2 capitalize bg-blue-50  text-blue-500 rounded-full text-xs font-body font-medium">
                  owner
                </p>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-center gap-x-2 ">
          <PrimaryButton text="Go Home" />
        </div>
      </div>
    </div>
  );
};
