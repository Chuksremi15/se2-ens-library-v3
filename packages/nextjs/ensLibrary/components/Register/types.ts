import { ChildFuses } from "@ensdomains/ensjs/utils";
import { Address, Hex } from "viem";
import { Prettify } from "~~/ensLibrary/types/types";

export type ProfileRecordGroup = "general" | "media" | "address" | "social" | "website" | "other" | "custom";

export type ProfileRecordType = "text" | "addr" | "contenthash" | "abi";

export type ProfileRecord = {
  key: string;
  value?: string;
  type: ProfileRecordType;
  group: ProfileRecordGroup;
};

export type RegistrationStep = "pricing" | "profile" | "info" | "transactions" | "complete";

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type RegistrationStepData = {
  pricing: {
    years: number;
    reverseRecord: boolean;
    paymentMethodChoice: "ethereum" | "";
  };
  profile: {
    records: ProfileRecord[];
    clearRecords?: boolean;
    resolverAddress?: Address;
    permissions?: CurrentChildFuses;
  };
  info: {};
  transactions: {
    secret: Hex;
    started: boolean;
  };
  complete: {};
};

export type BackObj = { back: boolean };

export type RegistrationData = Prettify<UnionToIntersection<RegistrationStepData[RegistrationStep]>>;

export type SelectedItemProperties = {
  address: string;
  name: string;
  chainId: number;
};

export type RegistrationReducerDataItem = Prettify<
  Omit<RegistrationData, "paymentMethodChoice"> & {
    stepIndex: number;
    queue: RegistrationStep[];
    isMoonpayFlow: boolean;
    externalTransactionId: string;
    version: number;
  } & SelectedItemProperties
>;

export type RegistrationReducerData = {
  items: RegistrationReducerDataItem[];
};

export type RegistrationReducerAction =
  | {
      name: "increaseStep";
      selected: SelectedItemProperties;
    }
  | {
      name: "decreaseStep";
      selected: SelectedItemProperties;
    }
  | {
      name: "setQueue";
      selected: SelectedItemProperties;
      payload: RegistrationStep[];
    }
  | {
      name: "setPricingData";
      selected: SelectedItemProperties;
      payload: Omit<RegistrationStepData["pricing"], "paymentMethodChoice">;
    }
  | {
      name: "setProfileData";
      selected: SelectedItemProperties;
      payload: RegistrationStepData["profile"];
    }
  | {
      name: "setTransactionsData";
      selected: SelectedItemProperties;
      payload: RegistrationStepData["transactions"];
    }
  | {
      name: "clearItem";
      selected: SelectedItemProperties;
    }
  | {
      name: "setStarted";
      selected: SelectedItemProperties;
    }
  | {
      name: "resetItem";
      selected: SelectedItemProperties;
    }
  | {
      name: "resetSecret";
      selected: SelectedItemProperties;
    }
  | {
      name: "setExternalTransactionId";
      selected: SelectedItemProperties;
      externalTransactionId: string;
    };

export type CurrentChildFuses = { -readonly [k in keyof ChildFuses]: boolean };
