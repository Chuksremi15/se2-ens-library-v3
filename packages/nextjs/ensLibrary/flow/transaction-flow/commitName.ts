import { Transaction, TransactionDisplayItem, TransactionFunctionParameters } from "../../types/ensTransactionTypes";
import { RegistrationParameters } from "@ensdomains/ensjs/utils";
import { commitName } from "@ensdomains/ensjs/wallet";

type Data = RegistrationParameters & { name: string };

const displayItems = ({ name }: Data): TransactionDisplayItem[] => [
  {
    label: "Name",
    value: name,
    type: "name",
  },
  {
    label: "Action",
    value: "Start timer",
  },
  {
    label: "Info",
    value: "Start timer to commit name",
  },
];

const transaction = async ({ connectorClient, data }: TransactionFunctionParameters<Data>) => {
  return commitName.makeFunctionData(connectorClient, data);
};

export default { displayItems, transaction } satisfies Transaction<Data>;
