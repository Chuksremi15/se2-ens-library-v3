import { Transaction, TransactionDisplayItem, TransactionFunctionParameters } from "../../types/ensTransactionTypes";
import { calculateValueWithBuffer, secondsToYears } from "../../utils/ensUtils";
import { getPrice } from "@ensdomains/ensjs/public";
import { RegistrationParameters } from "@ensdomains/ensjs/utils";
import { registerName } from "@ensdomains/ensjs/wallet";

type Data = RegistrationParameters;

const displayItems = ({ name, duration }: Data): TransactionDisplayItem[] => [
  {
    label: "Name",
    value: name,
    type: "name",
  },
  {
    label: "Action",
    value: "Register name",
  },
  {
    label: "Duration",
    value: secondsToYears(duration) > 1 ? `${secondsToYears(duration)} years` : `${secondsToYears(duration)} year`,
  },
];

const transaction = async ({ client, connectorClient, data }: TransactionFunctionParameters<Data>) => {
  const price = await getPrice(client, { nameOrNames: data.name, duration: data.duration });
  const value = price.base + price.premium;
  const valueWithBuffer = calculateValueWithBuffer(value);

  return registerName.makeFunctionData(connectorClient, {
    ...data,
    value: valueWithBuffer,
  });
};

export default { displayItems, transaction } satisfies Transaction<Data>;
