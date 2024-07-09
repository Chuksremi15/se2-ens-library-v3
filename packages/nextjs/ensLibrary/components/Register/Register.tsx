import React, { useEffect, useMemo, useState } from "react";
import { PlusMinusControl } from "./PlusMinusControl";
import { useEffectOnce } from "usehooks-ts";
import { useAccount, useChainId } from "wagmi";
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

  const { item } = useRegistrationReducer(selected);

  const [years, setYears] = useState(item.years);

  return (
    <div>
      <div className="flex flex-col gap-y-4 py-2 px-6 bg-base-100 w-[500px]  rounded-xl shadow-sm">
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
