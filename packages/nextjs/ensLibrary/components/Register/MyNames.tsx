import React, { useEffect, useMemo, useState } from "react";
import { PrimaryButton, SecondaryButton } from "../Button/Button";
import { FullInvoice } from "../Register/FullInvoice";
import { RegistrationReducerDataItem } from "../Register/types";
import { useAccount, useChainId } from "wagmi";
import { useAddressNames } from "~~/ensLibrary/hooks/useAddressNames";
import { useContractAddress } from "~~/ensLibrary/hooks/useContractAddress";
import { useEstimateFullRegistration } from "~~/ensLibrary/hooks/useEstimateRegistration";
import useRegistrationReducer from "~~/ensLibrary/hooks/useRegistrationReducer";

export const MyNames = ({ gotoPageRoot }: { gotoPageRoot: (pageNumber: number) => void }) => {
  const { address } = useAccount();

  const { data: addressNames, isLoading } = useAddressNames({ address: address as string });

  return (
    <div>
      <div className="flex flex-col gap-y-4 pt-2 pb-4 px-6 bg-base-100 w-full md:w-[500px] lg:w-[500px] rounded-xl shadow-sm">
        <div className="flex justify-between items-baseline">
          <h5 className="text-xl font-medium text-startself-start">My Names</h5>
          <div
            onClick={() => gotoPageRoot(0)}
            className="flex text-gray-500 hover:text-blue-500  gap-x-1 cursor-pointer mt-3 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path
                fill-rule="evenodd"
                d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                clip-rule="evenodd"
              />
            </svg>

            <div>Search for a name</div>
          </div>
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
      </div>
    </div>
  );
};
