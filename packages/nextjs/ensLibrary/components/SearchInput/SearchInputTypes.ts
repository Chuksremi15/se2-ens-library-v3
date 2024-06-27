export type SearchItemType = "text" | "error" | "address" | "name";
export type SearchItem = {
  type: SearchItemType | "nameWithDotEth";
  value?: string;
};
