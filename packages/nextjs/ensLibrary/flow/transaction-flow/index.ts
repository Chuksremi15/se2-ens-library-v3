import commitName from "./commitName";
import registerName from "./registerName";

export const transactions = {
  commitName,
  registerName,
};

export type Transaction = typeof transactions;
export type TransactionName = keyof Transaction;

export type TransactionParameters<T extends TransactionName> = Parameters<Transaction[T]["transaction"]>[0];

export type TransactionData<T extends TransactionName> = TransactionParameters<T>["data"];

export type TransactionReturnType<T extends TransactionName> = ReturnType<Transaction[T]["transaction"]>;

export const createTransactionItem = <T extends TransactionName>(name: T, data: TransactionData<T>) => ({
  name,
  data,
});

export const createTransactionRequest = <TName extends TransactionName>({
  name,
  ...rest
}: { name: TName } & TransactionParameters<TName>): TransactionReturnType<TName> => {
  // i think this has to be any :(
  return transactions[name].transaction({ ...rest } as any) as TransactionReturnType<TName>;
};

export type TransactionItem<TName extends TransactionName = TransactionName> = {
  name: TName;
  data: TransactionData<TName>;
};

export type TransactionItemUnion = {
  [TName in TransactionName]: TransactionItem<TName>;
}[TransactionName];
