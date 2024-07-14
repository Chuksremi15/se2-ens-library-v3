import React, { useEffect, useMemo, useState } from "react";
import { PlusMinusControl } from "./PlusMinusControl";
import { useEffectOnce } from "usehooks-ts";
import { useAccount, useChainId } from "wagmi";
import { useContractAddress } from "~~/ensLibrary/hooks/useContractAddress";
import { useEstimateFullRegistration } from "~~/ensLibrary/hooks/useEstimateRegistration";
import useRegistrationReducer from "~~/ensLibrary/hooks/useRegistrationReducer";

export const Register = ({ searchItem, prevPage }: { searchItem: string; prevPage: () => void }) => {
  if (!searchItem) {
    prevPage();
  }

  const chainId = useChainId();
  const { address } = useAccount();

  const selected = useMemo(
    () => ({ name: searchItem && searchItem, address: address! }),
    [address, chainId, searchItem && searchItem],
  );

  const resolverAddress = useContractAddress({ contract: "ensPublicResolver" });

  const { item } = useRegistrationReducer(selected);

  const [years, setYears] = useState(item.years);
  let registrationData = item;

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

  console.log("fullestimate: ", fullEstimate);

  return (
    <div>
      <div className="flex flex-col gap-y-4 py-2 px-6 bg-base-100 w-full md:w-[500px] lg:w-[500px] rounded-xl shadow-sm">
        <h5 className="text-xl font-medium text-start self-start">Register {searchItem}</h5>

        <PlusMinusControl
          minValue={1}
          value={years}
          onChange={e => {
            const newYears = parseInt(e.target.value);
            if (!Number.isNaN(newYears)) setYears(newYears);
          }}
        />
        {/* {fullEstimate && <FullInvoice {...fullEstimate} unit={"eth"} />} */}
      </div>
    </div>
  );
};
