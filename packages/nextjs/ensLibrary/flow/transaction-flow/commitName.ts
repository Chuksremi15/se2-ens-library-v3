import { Transaction, TransactionDisplayItem, TransactionFunctionParameters } from "../../types/ensTransactionTypes";
import { RegistrationParameters } from "@ensdomains/ensjs/utils";
import { commitName } from "@ensdomains/ensjs/wallet";

type Data = RegistrationParameters & { name: string };

const displayItems = ({ name }: Data): TransactionDisplayItem[] => [
  {
    label: "name",
    value: name,
    type: "name",
  },
  {
    label: "action",
    value: "Start timer",
  },
  {
    label: "info",
    value: "Start timer to register name",
  },
];

const transaction = async ({ connectorClient, data }: TransactionFunctionParameters<Data>) => {
  return commitName.makeFunctionData(connectorClient, data);
};

export default { displayItems, transaction } satisfies Transaction<Data>;
