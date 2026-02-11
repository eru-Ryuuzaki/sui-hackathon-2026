import axios from 'axios';

// Walrus Testnet Endpoints
const PUBLISHER_URL = 'https://publisher.walrus-testnet.walrus.space';
const AGGREGATOR_URL = 'https://aggregator.walrus-testnet.walrus.space';

export interface WalrusUploadResponse {
  newlyCreated: {
    blobObject: {
      blobId: string;
      storage: any;
      id: string;
      registeredEpoch: number;
    };
    cost: number;
  };
  alreadyCertified?: {
    blobId: string;
    event: any;
  };
}

export const WalrusService = {
  /**
   * Upload a file (Blob) to Walrus
   * @param file The file or blob to upload
   * @param epochs Number of epochs to store (default 1)
   */
  uploadBlob: async (file: Blob, epochs = 1): Promise<string> => {
    // Walrus Publisher expects a PUT request with the binary body
    // URL: /v1/store?epochs=N
    
    try {
      // Updated Endpoint: /v1/blobs?epochs=N
      const response = await axios.put<WalrusUploadResponse>(
        `${PUBLISHER_URL}/v1/blobs?epochs=${epochs}`,
        file,
        {
          headers: {
            'Content-Type': 'application/octet-stream' // Binary upload
          }
        }
      );

      // Handle response structure
      if (response.data.newlyCreated) {
        return response.data.newlyCreated.blobObject.blobId;
      } else if (response.data.alreadyCertified) {
        return response.data.alreadyCertified.blobId;
      } else {
        throw new Error('Unexpected response from Walrus Publisher');
      }
    } catch (error) {
      console.error('Walrus Upload Error:', error);
      throw error;
    }
  },

  /**
   * Get the download URL for a Blob ID
   * @param blobId The Walrus Blob ID
   */
  getBlobUrl: (blobId: string): string => {
    return `${AGGREGATOR_URL}/v1/blobs/${blobId}`;
  },

  /**
   * Download a Blob directly
   */
  downloadBlob: async (blobId: string): Promise<Blob> => {
    const response = await axios.get(`${AGGREGATOR_URL}/v1/blobs/${blobId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Extend storage duration for an existing Blob
   * @param blobId The Walrus Blob ID
   * @param epochs Number of additional epochs to purchase
   */
  extendStorage: async (blobId: string, epochs: number): Promise<boolean> => {
    try {
      // Walrus Publisher API: POST /v1/blobs/{blobId}?epochs=N
      // Note: This operation requires paying storage fees, similar to upload.
      const response = await axios.post(
        `${PUBLISHER_URL}/v1/blobs/${blobId}?epochs=${epochs}`,
        {}, // Empty body
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Walrus Extend Storage Error:', error);
      throw error;
    }
  }
};
