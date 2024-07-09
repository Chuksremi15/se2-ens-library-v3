"use client";

import { useCallback, useMemo } from "react";
import { SearchItemType } from "./SearchInputTypes";
import { useBasicName } from "~~/ensLibrary/hooks/useBasicName";
import { RegistrationStatus } from "~~/ensLibrary/utils/registrationStatus";

// import { useBasicName } from "~~/hooks/ens-hook/useBasicName";

export const SearchResult = ({
  value,
  type,
  clickCallback,
}: {
  type: SearchItemType | "nameWithDotEth";
  value: string;
  clickCallback: (input: string) => void;
}) => {
  const input = useMemo(() => {
    if (type === "nameWithDotEth") {
      return `${value!}.eth`;
    }
    return value;
  }, [type, value]);

  const { registrationStatus, isLoading, beautifiedName } = useBasicName({ name: input });

  const handleClick = useCallback(() => {
    if (registrationStatus !== "short") {
      clickCallback(input);
    }
  }, [input, clickCallback]);

  if (type === "error") {
    return (
      <div className="w-[350px] bg-red-100 h-[50px] text-black rounded-lg shadow-sm p-3 flex items-center justify-between">
        {" "}
        <div className="font-bold">{value}</div>
      </div>
    );
  }

  if (type === "name" || type === "nameWithDotEth") {
    return (
      <div
        onClick={handleClick}
        className="w-[350px] cursor-pointer  bg-base-100  h-[50px] rounded-lg shadow-sm p-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-x-2">
          <div className="h-6 w-6 bg-blue-500 rounded-full" />
          <p className=" font-medium text-base lowercase  break-words max-w-[200px]">{beautifiedName}</p>
        </div>
        <div className="flex gap-x-2 items-center">
          {isLoading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <StatusTag status={registrationStatus} />
          )}

          <div className="w-0 h-0 border-l-gray-300 border-t-transparent border-b-transparent  border-r-[0px] border-l-[7px] border-t-[7px] border-b-[7px]  "></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[350px] bg-base-100 h-[50px] rounded-lg shadow-sm p-3 flex items-center justify-between"></div>
  );
};

const StatusTag = ({ status }: { status: RegistrationStatus | undefined }) => {
  switch (status) {
    case "owned":
    case "imported":
    case "registered":
      return <StatusButtonWrapper bgColor={"bg-blue-100"} textColor={"text-blue-700"} status={status} />;
    case "gracePeriod":
      return <StatusButtonWrapper bgColor={"bg-green-50"} textColor={"text-green-600"} status={"Grace period"} />;
    case "premium":
      return <div>{status}</div>;
    case "available":
      return <StatusButtonWrapper bgColor={"bg-green-50"} textColor={"text-green-600"} status={status} />;
    case "notOwned":
    case "notImported":
      return <StatusButtonWrapper bgColor={"bg-red-100"} textColor={"text-red-700"} status={"Not imported"} />;
    case "short":
      return <StatusButtonWrapper bgColor={"bg-red-100"} textColor={"text-red-700"} status={status} />;
    default:
      return <div> {status}</div>;
  }
};

const StatusButtonWrapper = ({
  bgColor,
  textColor,
  status,
}: {
  bgColor?: String;
  textColor?: String;
  status: String;
}) => {
  return (
    <div
      className={`py-[3px] px-[8px]  capitalize flex items-centern justify-center text-center text-xs  ${
        bgColor ? bgColor : "bg-green-50"
      } ${textColor ? textColor : "text-green-500"}  rounded-full  font-body font-medium cursor-pointer`}
    >
      {status}
    </div>
  );
};
