import React from "react";
import { useTheme } from "next-themes";
import { useAccount } from "wagmi";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAddressNames } from "~~/ensLibrary/hooks/useAddressNames";

export const MyNames = ({ gotoPageRoot }: { gotoPageRoot: (pageNumber: number) => void }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const { address } = useAccount();

  const { data: addressNames, isLoading } = useAddressNames({ address: address as string });

  return (
    <div className="flex flex-col gap-y-4 pt-2 pb-4 px-6 bg-base-100 w-[350px] md:w-[500px] lg:w-[500px] rounded-xl shadow-sm">
      <div className="flex justify-between flex-wrap items-baseline">
        <h5 className="text-xl font-medium text-startself-start">My Names</h5>
        <div
          onClick={() => gotoPageRoot(0)}
          className={`flex  ${
            isDarkMode ? "text-gray-200 hover:text-blue-500" : "text-gray-500  hover:text-blue-500"
          }    gap-x-1 cursor-pointer mt-3 transition-all duration-200`}
        >
          <MagnifyingGlassIcon className="h-6" />
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
          addressNames.map(({ name, labelName, parentName }, index: number) => (
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
  );
};
