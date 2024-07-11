import { Transaction, TransactionDisplayItem, TransactionFunctionParameters } from "../../types/ensTransactionTypes";
import { calculateValueWithBuffer, secondsToYears } from "../../utils/ensUtils";
import { getPrice } from "@ensdomains/ensjs/public";
import { RegistrationParameters } from "@ensdomains/ensjs/utils";
import { registerName } from "@ensdomains/ensjs/wallet";

type Data = RegistrationParameters;

const displayItems = ({ name, duration }: Data): TransactionDisplayItem[] => [
  {
    label: "name",
    value: name,
    type: "name",
  },
  {
    label: "action",
    value: "Register name",
  },
  {
    label: "duration",
    value: secondsToYears(duration) > 1 ? "years" : "year",
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
