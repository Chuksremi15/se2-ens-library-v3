import React, { useEffect, useMemo, useState } from "react";
import { PrimaryButton, SecondaryButton } from "../Button/Button";
import { FullInvoice } from "../Register/FullInvoice";
import { RegistrationReducerDataItem } from "../Register/types";
import { useAccount, useChainId } from "wagmi";
import { useContractAddress } from "~~/ensLibrary/hooks/useContractAddress";
import { useEstimateFullRegistration } from "~~/ensLibrary/hooks/useEstimateRegistration";
import useRegistrationReducer from "~~/ensLibrary/hooks/useRegistrationReducer";

export const Info = ({
  prevPage,
  nextPage,
  registrationData,
}: {
  prevPage: () => void;
  nextPage: () => void;
  registrationData: RegistrationReducerDataItem;
}) => {
  const resolverAddress = useContractAddress({ contract: "ensPublicResolver" });

  const [reverseRecord, setReverseRecord] = useState(() =>
    registrationData.started ? registrationData.reverseRecord : false,
  );

  const fullEstimate = useEstimateFullRegistration({
    name: registrationData.name,
    registrationData: {
      ...registrationData,
      reverseRecord,
      records: [{ key: "ETH", value: resolverAddress, type: "addr", group: "address" }],
      clearRecords: true,
      resolverAddress,
    },
  });

  const infoCardArray = [
    { number: "1", text: "Complete a transaction to begin the timer" },
    { number: "2", text: "Wait 60 seconds for the timer to complete" },
    { number: "3", text: "Complete a second transaction to secure your name" },
  ];
  return (
    <div>
      <div className="flex flex-col gap-y-4 pt-2 pb-4 px-6 bg-base-100 w-full md:w-[500px] lg:w-[500px] rounded-xl shadow-sm">
        <div>
          <h5 className="text-xl font-medium text-startself-start"> {registrationData.name}</h5>
          <h5 className="text-2xl font-medium text-center">Before we start</h5>
          <h5 className="text-xs font-medium text-center">Registering your name takes three steps</h5>

          <div className="grid grid-cols-3 gap-x-3 mt-4">
            {infoCardArray.map(({ number, text }, index) => (
              <InfoCard number={number} text={text} key={index} />
            ))}
          </div>
        </div>

        {fullEstimate && <FullInvoice {...fullEstimate} unit={"eth"} />}

        <div className="flex items-center justify-center gap-x-2 ">
          <SecondaryButton text="Back" action={prevPage} />
          <PrimaryButton text="Next" action={nextPage} />
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ number, text }: { number: string; text: string }) => {
  return (
    <div className="flex flex-col items-center justify-center border rounded-md  px-1  pt-2">
      <div className="flex items-center justify-center py-1  text-xl bg-primary rounded-full w-9">{number}</div>{" "}
      <p className="text-xs text-center font-medium">{text}</p>
    </div>
  );
};
