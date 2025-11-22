import { useState } from "react";
import { WriteFilesFlow } from "@mysten/walrus";
import type { SuiClient } from "@mysten/sui/client";
import type { SignAndExecuteTransactionOptions } from "@mysten/dapp-kit";
import { WalrusService } from "./walrusServiceSDK";

interface UploadedItem {
  blobId: string;
  id: string; // Metadata ID for explorer links
  url: string;
  size: number;
  type: string;
  timestamp: number;
  filename?: string;
}

interface UseWalrusFileUploadOptions {
  walrus: WalrusService | null;
  currentAccount: { address: string } | null;
  signAndExecute: (
    options: SignAndExecuteTransactionOptions,
    callbacks?: {
      onSuccess?: (result: { digest: string }) => void | Promise<void>;
      onError?: (error: Error) => void;
    }
  ) => void;
  suiClient: SuiClient;
  onSuccess?: (item: UploadedItem) => void;
}

interface UseWalrusFileUploadReturn {
  uploadFile: (file: File) => Promise<UploadedItem | null>;
  uploading: boolean;
  error: string | null;
  success: string | null;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

/**
 * Custom hook for uploading files to Walrus storage
 * Handles the complete upload flow: encode, register, upload, certify
 */
export function useWalrusFileUpload({
  walrus,
  currentAccount,
  signAndExecute,
  suiClient,
  onSuccess,
}: UseWalrusFileUploadOptions): UseWalrusFileUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<UploadedItem | null> => {
    if (!currentAccount) {
      setError("Please connect your wallet first");
      return null;
    }

    if (!walrus) {
      setError("Walrus service not available. Please refresh the page.");
      return null;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Read file as array buffer
      const contents = await file.arrayBuffer();

      // Use writeFilesFlow for browser environments (avoids popup blocking)
      const flow: WriteFilesFlow = walrus.uploadWithFlow(
        [
          {
            contents: new Uint8Array(contents),
            identifier: file.name,
            tags: { "content-type": file.type || "application/octet-stream" },
          },
        ],
        { epochs: 10, deletable: true }
      );

      // Step 1: Encode files
      await flow.encode();

      // Step 2: Register the blob (returns transaction)
      const registerTx = flow.register({
        owner: currentAccount.address,
        epochs: 10,
        deletable: true,
      });

      // Step 3: Sign and execute register transaction and get the created blob object ID
      let registerDigest: string;
      let blobObjectId: string | null = null;
      await new Promise<void>((resolve, reject) => {
        signAndExecute(
          { transaction: registerTx },
          {
            onSuccess: async ({ digest }) => {
              try {
                registerDigest = digest;
                const result = await suiClient.waitForTransaction({
                  digest,
                  options: {
                    showEffects: true,
                    showEvents: true,
                  },
                });

                // Get the blob object ID from BlobRegistered event
                if (result.events) {
                  const blobRegisteredEvent = result.events.find((event) => event.type.includes("BlobRegistered"));

                  if (blobRegisteredEvent?.parsedJson) {
                    // Extract object_id from the event (can be snake_case or camelCase)
                    const eventData = blobRegisteredEvent.parsedJson as {
                      object_id?: string;
                      objectId?: string;
                    };
                    blobObjectId = eventData.object_id || eventData.objectId || null;
                  }
                }
                resolve();
              } catch (err) {
                reject(err);
              }
            },
            onError: reject,
          }
        );
      });

      // Step 4: Upload the blob data to storage nodes
      await flow.upload({ digest: registerDigest! });

      // Step 5: Certify the blob (returns transaction)
      const certifyTx = flow.certify();

      // Step 6: Sign and execute certify transaction
      await new Promise<void>((resolve, reject) => {
        signAndExecute(
          { transaction: certifyTx },
          {
            onSuccess: async ({ digest }) => {
              try {
                await suiClient.waitForTransaction({ digest });
                resolve();
              } catch (err) {
                reject(err);
              }
            },
            onError: reject,
          }
        );
      });

      // Step 7: Get the blobId from listFiles
      const files = await flow.listFiles();
      const blobId = files[0]?.blobId;

      if (!blobId) {
        throw new Error("Failed to get blobId after upload");
      }

      // Use the blob object ID from transaction effects, or fallback to blobId if not found
      const metadataId = blobObjectId || blobId;

      const uploadedItem: UploadedItem = {
        blobId,
        id: metadataId,
        url: `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`,
        size: file.size,
        type: file.type || "application/octet-stream",
        timestamp: Date.now(),
        filename: file.name,
      };

      setSuccess(`File "${file.name}" uploaded successfully!`);

      if (onSuccess) {
        onSuccess(uploadedItem);
      }

      return uploadedItem;
    } catch (err) {
      const errorMessage = `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`;
      setError(errorMessage);
      console.error("Upload error:", err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploading,
    error,
    success,
    setError,
    setSuccess,
  };
}
