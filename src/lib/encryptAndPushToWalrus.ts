import { useSuiClient } from "@mysten/dapp-kit";
import { SealClient } from "@mysten/seal";
import { fromHex, toHex } from "@mysten/sui/utils";
import { useState } from "react";
import { packageId } from "./package_id";

export const useEncryptAndPushToWalrus = () => {
  const [isUploading, setIsUploading] = useState(false);
  const serverObjectIds = [
    "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
    "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
  ];
  const suiClient = useSuiClient();
  const client = new SealClient({
    suiClient,
    serverConfigs: serverObjectIds.map((id) => ({
      objectId: id,
      weight: 1,
    })),
    verifyKeyServers: false,
  });

  const handleSubmit = async (file: File, policyObject: string) => {
    setIsUploading(true);
    if (file) {
      const reader = new FileReader();
      reader.onload = async function (event) {
        if (event.target && event.target.result) {
          const result = event.target.result;
          if (result instanceof ArrayBuffer) {
            const nonce = crypto.getRandomValues(new Uint8Array(5));
            const policyObjectBytes = fromHex(policyObject);
            const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));
            const { encryptedObject: encryptedBytes } = await client.encrypt({
              threshold: 2,
              packageId,
              id,
              data: new Uint8Array(result),
            });
            const storageInfo = await storeBlob(encryptedBytes);
            console.log("🚀 ~ handleSubmit ~ storageInfo:", storageInfo);
            setIsUploading(false);
          } else {
            console.error("Unexpected result type:", typeof result);
            setIsUploading(false);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      console.error("No file selected");
    }
  };

  const storeBlob = (encryptedData: Uint8Array) => {
    return fetch(`https://publisher.walrus-testnet.walrus.space/v1/blobs?epochs=${1}`, {
      method: "PUT",
      body: encryptedData,
    }).then((response) => {
      if (response.status === 200) {
        return response.json().then((info) => {
          return { info };
        });
      } else {
        alert("Error publishing the blob on Walrus, please select a different Walrus service.");
        setIsUploading(false);
        throw new Error("Something went wrong when storing the blob!");
      }
    });
  };

  return {
    isUploading,
    handleSubmit,
  };
};
