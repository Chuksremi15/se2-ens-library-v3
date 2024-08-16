import React, { useEffect, useState } from "react";
import { MyNames } from "../components/Register/MyNames";
import { Register } from "../components/Register/Register";
import { SearchInput } from "../components/SearchInput/SearchInput";
import { PageSlider } from "../components/slider/PageSlider";
import { useTheme } from "next-themes";
import { useLocalStorage } from "usehooks-ts";
import { useAccount, useSwitchChain } from "wagmi";
import { ArrowsRightLeftIcon } from "@heroicons/react/20/solid";
import { getNetworkColor } from "~~/hooks/scaffold-eth";
import { ChainWithAttributes, getTargetNetworks } from "~~/utils/scaffold-eth";

const burnerStorageKey = "scaffoldEth2.burnerWallet.sk";

const getAllowedNetworks = () => {
  const allNetworks = getTargetNetworks();
  const ensNetwork = allNetworks.filter(({ id }) => id === 1 || id === 5 || id === 17000 || id === 11155111);
  return ensNetwork;
};

const EnsSe2 = () => {
  const [page, setPage] = useLocalStorage<number>("page", 0, {
    initializeWithValue: false,
  });
  const [searchItem, setSearchItem] = useLocalStorage<string>(burnerStorageKey, "ens", {
    initializeWithValue: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const maxPage = 2;

  const nextPageRoot = () => {
    if (page <= maxPage) setPage(page + 1);
    else () => {};
  };
  const prevPageRoot = () => {
    if (page > 0) setPage(page - 1);
    else () => {};
  };

  const gotoPageRoot = (pageNumber: number) => {
    if (pageNumber <= maxPage && pageNumber >= 0) setPage(pageNumber);
    else () => {};
  };

  const handleSearch = (input: string) => {
    setSearchItem(input);
    nextPageRoot();
  };

  const allNetworks = getTargetNetworks();
  const { switchChain } = useSwitchChain();
  const { chain } = useAccount();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  //const [allowedNetworks, setAllowedNetworks] = useState<ChainWithAttributes[]>();
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const allowedNetworks = getAllowedNetworks();

  useEffect(() => {
    setIsDisabled(true);

    if (chain)
      allowedNetworks.forEach(({ id }) => {
        if (id === chain.id) {
          setIsDisabled(false);
          return;
        }
      });
  }, [chain, switchChain]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [chain, switchChain]);

  const components = [
    <SearchInput handleSearch={handleSearch} gotoPageRoot={gotoPageRoot} />,
    <Register searchItem={searchItem} prevPageRoot={prevPageRoot} gotoPageRoot={gotoPageRoot} />,
    <MyNames gotoPageRoot={gotoPageRoot} />,
    // <Info searchItem={searchItem} prevPage={prevPage} nextPage={nextPage} />,
    // <TimerAlert searchItem={searchItem} prevPage={prevPage} nextPage={nextPage} />,
  ];

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-4">
        {isLoading ? (
          <span className="loading loading-spinner loading-sm" />
        ) : isDisabled ? (
          <div className="flex flex-col gap-y-1 pt-2 pb-4 px-6 bg-base-100 w-[350px] md:w-[500px] lg:w-[500px] rounded-xl shadow-sm">
            <h1 className="text-base font-medium">
              ENS contract is not deploy on network. Switch to network below to enable registration
            </h1>
            {allowedNetworks.map(allowedNetwork => (
              <div key={allowedNetwork.id} className={false ? "hidden" : ""}>
                <button
                  className="menu-item btn-sm !rounded-xl flex gap-3 py-3 whitespace-nowrap"
                  type="button"
                  onClick={() => {
                    switchChain?.({ chainId: allowedNetwork.id });
                  }}
                >
                  <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" />
                  <span>
                    Switch to{" "}
                    <span
                      style={{
                        color: getNetworkColor(allowedNetwork, isDarkMode),
                      }}
                    >
                      {allowedNetwork.name}
                    </span>
                  </span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          chain &&
          (chain.id === 1 || chain.id === 5 || chain.id === 17000 || chain.id === 11155111) && (
            <PageSlider>{components[page]}</PageSlider>
          )
        )}
      </div>
    </>
  );
};

export default EnsSe2;
