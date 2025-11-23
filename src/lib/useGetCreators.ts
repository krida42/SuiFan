import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { ContentCreatorpackageId } from "./package_id";

export type ContentCreator = {
  id: string;
  pseudo: string;
  description: string;
  owner: string;
  image_url: string;
};

export const useGetCreators = () => {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();

  return async function getCreators(): Promise<ContentCreator[]> {
    if (!currentAccount?.address) {
      console.warn("getCreators called without a connected Sui account; returning empty list.");
      return [];
    }

    // get all owned cap objects
    const res = await suiClient.getOwnedObjects({
      owner: currentAccount?.address!,
      options: {
        showContent: true,
        showType: true,
      },
      filter: {
        StructType: `${ContentCreatorpackageId}::content_creator::ContentCreator`,
      },
    });
    const contentCreators = res.data
      .map((obj) => {
        const fields = (obj!.data!.content as { fields: any }).fields;
        return {
          id: fields?.id.id,
          pseudo: fields?.pseudo,
          description: fields?.description,
          // The Move struct exposes `wallet: address`; we surface it as `owner` in the UI.
          owner: fields?.wallet,
          image_url: fields?.image_url,
        };
      })
      .filter((item) => item !== null) as ContentCreator[];
    console.log("🚀 ~ getCapObj ~ contentCreators:", contentCreators);
    return contentCreators;
  };
};
