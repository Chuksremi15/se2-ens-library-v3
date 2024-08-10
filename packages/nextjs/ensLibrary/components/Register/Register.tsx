import React, { useEffect, useMemo, useState } from "react";
import { PrimaryButton, SecondaryButton } from "../Button/Button";
import { Info } from "../Info/Info";
import { PageSlider } from "../slider/PageSlider";
import { FullInvoice } from "./FullInvoice";
import { PlusMinusControl } from "./PlusMinusControl";
import { Registration } from "./Registration";
import TimerAlert from "./TimerAlert";
import { useEffectOnce, useLocalStorage } from "usehooks-ts";
import { stringify } from "viem";
import { useAccount, useChainId } from "wagmi";
import { useContractAddress } from "~~/ensLibrary/hooks/useContractAddress";
import { useEstimateFullRegistration } from "~~/ensLibrary/hooks/useEstimateRegistration";
import useRegistrationReducer from "~~/ensLibrary/hooks/useRegistrationReducer";

export const Register = ({ searchItem, prevPageRoot }: { searchItem: string; prevPageRoot: () => void }) => {
  // if (!searchItem) {
  //   prevPage();
  // }

  const [page, setPage] = useLocalStorage<number>("Registrationpage", 0, {
    initializeWithValue: false,
  });

  const maxPage = 3;

  const nextPage = () => {
    if (page < maxPage) setPage(page + 1);
    else () => {};
  };
  const prevPage = () => {
    if (page > 0) setPage(page - 1);
    else () => {};
  };

  const chainId = useChainId();
  const { address } = useAccount();

  const selected = useMemo(
    () => ({ name: searchItem && searchItem, address: address!, chainId }),
    [address, chainId, searchItem && searchItem],
  );

  const { state, dispatch, item } = useRegistrationReducer(selected);

  // useEffect(() => {
  //   localStorage.setItem("registration-status", stringify({ items: [] }));
  // }, []);

  const components = [
    <Registration
      searchItem={searchItem}
      prevPage={prevPageRoot}
      nextPage={nextPage}
      registrationData={item}
      selected={selected}
      dispatch={dispatch}
    />,
    <Info searchItem={searchItem} prevPage={prevPage} nextPage={nextPage} registrationData={item} />,
    <TimerAlert searchItem={searchItem} prevPage={prevPage} nextPage={nextPage} registrationData={item} />,
  ];

  return <PageSlider>{components[page]}</PageSlider>;
};
