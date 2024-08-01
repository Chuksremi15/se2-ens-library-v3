import React, { useEffect, useMemo, useState } from "react";
import { PrimaryButton, SecondaryButton } from "../Button/Button";
import { FullInvoice } from "./FullInvoice";
import { PlusMinusControl } from "./PlusMinusControl";
import { RegistrationReducerAction, RegistrationReducerDataItem } from "./types";
import { useEffectOnce } from "usehooks-ts";
import { useAccount, useChainId } from "wagmi";
import { useContractAddress } from "~~/ensLibrary/hooks/useContractAddress";
import { useEstimateFullRegistration } from "~~/ensLibrary/hooks/useEstimateRegistration";
import useRegistrationReducer from "~~/ensLibrary/hooks/useRegistrationReducer";

export const Registration = ({
  searchItem,
  prevPage,
  nextPage,
  registrationData,
  selected,
  dispatch,
}: {
  searchItem: string;
  prevPage: () => void;
  nextPage: () => void;
  registrationData: RegistrationReducerDataItem;
  selected?: any;
  dispatch: React.Dispatch<RegistrationReducerAction>;
}) => {
  if (!searchItem) {
    prevPage();
  }

  const resolverAddress = useContractAddress({ contract: "ensPublicResolver" });

  const [years, setYears] = useState(registrationData.years);

  const [reverseRecord, setReverseRecord] = useState(() =>
    registrationData.started ? registrationData.reverseRecord : false,
  );

  const fullEstimate = useEstimateFullRegistration({
    name: searchItem,
    registrationData: {
      ...registrationData,
      reverseRecord,
      years,
      records: [{ key: "ETH", value: resolverAddress, type: "addr", group: "address" }],
      clearRecords: true,
      resolverAddress,
    },
  });

  const nextPageAction = (newYears: number) => {
    console.log("years: ", newYears);
    dispatch({ name: "setPricingData", payload: { years: newYears, reverseRecord }, selected });
    console.log("registrationData: ", registrationData);
  };

  const resetItem = () => {
    dispatch({ name: "clearItem", selected });
    setTimeout(() => prevPage(), 500);
  };

  return (
    <div>
      <div className="flex flex-col gap-y-4 pt-4 pb-5 px-6 bg-base-100 w-full md:w-[500px] lg:w-[500px] rounded-xl shadow-sm">
        <h5 className="text-xl font-medium text-start self-start">Register {searchItem}</h5>

        <PlusMinusControl
          minValue={1}
          value={years}
          onChange={e => {
            const newYears = parseInt(e.target.value);
            if (!Number.isNaN(newYears)) {
              setYears(newYears);
              nextPageAction(newYears);
            }
          }}
        />
        {fullEstimate && <FullInvoice {...fullEstimate} unit={"eth"} />}

        <div className="flex items-center justify-center gap-x-2 ">
          <SecondaryButton text="Back" action={() => resetItem()} />
          <PrimaryButton
            text="Next"
            action={() => {
              dispatch({ name: "increaseStep", selected });
              nextPage();
            }}
          />
        </div>
      </div>
    </div>
  );
};
