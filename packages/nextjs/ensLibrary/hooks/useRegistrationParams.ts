import { useMemo } from "react";
import { RegistrationReducerDataItem } from "../components/Register/types";
import { yearsToSeconds } from "../utils/ensUtils";
import { profileRecordsToRecordOptions } from "../utils/profileRecors";
import { ChildFuseReferenceType, RegistrationParameters } from "@ensdomains/ensjs/utils";
import { Address } from "viem";

type Props = {
  name: string;
  owner: Address;
  registrationData: Pick<
    RegistrationReducerDataItem,
    "years" | "resolverAddress" | "secret" | "records" | "clearRecords" | "permissions" | "reverseRecord"
  >;
};

const useRegistrationParams = ({ name, owner, registrationData }: Props) => {
  const registrationParams: RegistrationParameters = useMemo(
    () => ({
      name,
      owner,
      duration: yearsToSeconds(registrationData.years),
      resolverAddress: registrationData.resolverAddress,
      secret: registrationData.secret,
      records: profileRecordsToRecordOptions(registrationData.records, registrationData.clearRecords),
      fuses: {
        named: registrationData.permissions
          ? (Object.keys(registrationData.permissions).filter(
              key => !!registrationData.permissions?.[key as ChildFuseReferenceType["Key"]],
            ) as ChildFuseReferenceType["Key"][])
          : [],
        unnamed: [],
      },
      reverseRecord: registrationData.reverseRecord,
    }),
    [owner, name, registrationData],
  );

  return registrationParams;
};

export default useRegistrationParams;
