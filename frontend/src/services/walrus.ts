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
      const response = await axios.put<WalrusUploadResponse>(
        `${PUBLISHER_URL}/v1/store?epochs=${epochs}`,
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
    return `${AGGREGATOR_URL}/v1/${blobId}`;
  },

  /**
   * Download a Blob directly
   */
  downloadBlob: async (blobId: string): Promise<Blob> => {
    const response = await axios.get(`${AGGREGATOR_URL}/v1/${blobId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
