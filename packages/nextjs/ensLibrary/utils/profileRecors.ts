import { normalizeCoinAddress } from "./coins";
import { RecordOptions } from "@ensdomains/ensjs/utils";
import { stringToHex } from "viem";

export type ProfileRecordGroup = "general" | "media" | "address" | "social" | "website" | "other" | "custom";

export type ProfileRecordType = "text" | "addr" | "contenthash" | "abi";

export type ProfileRecord = {
  key: string;
  value?: string;
  type: ProfileRecordType;
  group: ProfileRecordGroup;
};

export const profileRecordsToRecordOptions = (
  profileRecords: ProfileRecord[] = [],
  clearRecords = false,
): RecordOptions => {
  return profileRecords.reduce<RecordOptions>(
    (options, record) => {
      if (!record.key) return options;

      const { key, value = "", group } = record;

      const recordItem = {
        key: key.trim(),
        value: value.trim(),
      };

      if (record.key === "avatar") {
        const currentAvatarValue = options.texts?.find(r => r.key === "avatar")?.value || "";
        const defaultAvatarValue =
          !!currentAvatarValue && !!recordItem.value && group === "media" ? recordItem.value : currentAvatarValue;
        const newAvatarValue = defaultAvatarValue || currentAvatarValue || recordItem.value;
        return {
          ...options,
          texts: [...(options.texts?.filter(r => r.key !== "avatar") || []), { key: "avatar", value: newAvatarValue }],
        };
      }

      if (record.type === "text") {
        return {
          ...options,
          texts: [...(options.texts?.filter(r => r.key !== recordItem.key) || []), recordItem],
        };
      }

      if (record.type === "addr") {
        return {
          ...options,
          coins: [
            ...(options.coins?.filter(r => r.coin !== recordItem.key) || []),
            {
              coin: recordItem.key,
              value: normalizeCoinAddress({ coin: recordItem.key, address: recordItem.value }),
            },
          ],
        };
      }

      if (record.type === "contenthash") {
        return {
          ...options,
          contentHash: recordItem.value,
        };
      }

      if (record.type === "abi") {
        return {
          ...options,
          abi: {
            contentType: 1,
            encodedData: stringToHex(recordItem.value),
          },
        };
      }

      return options;
    },
    {
      clearRecords: !!clearRecords,
    } as RecordOptions,
  );
};
