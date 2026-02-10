import { Transaction } from '@mysten/sui/transactions';

// TODO: Replace with actual IDs after deployment
export const PACKAGE_ID = '0x_YOUR_PACKAGE_ID'; 
export const HIVE_STATE_ID = '0x_YOUR_HIVE_STATE_ID';
export const MODULE_NAME = 'core';

export const buildEngraveTx = (
  constructId: string,
  content: string,
  emotionVal: number,
  category: number,
  isEncrypted: boolean,
  blobId?: string,
  mediaType?: string
) => {
  const tx = new Transaction();

  // Argument Order in Move:
  // construct: &mut Construct,
  // hive: &mut HiveState,
  // clock: &Clock,
  // content: String,
  // mood: u8,
  // category: u8,
  // is_encrypted: bool,
  // blob_id: Option<String>,
  // media_type: Option<String>

  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::engrave`,
    arguments: [
      tx.object(constructId),
      tx.object(HIVE_STATE_ID),
      tx.object('0x6'), // Clock
      tx.pure.string(content),
      tx.pure.u8(emotionVal),
      tx.pure.u8(category),
      tx.pure.bool(isEncrypted),
      tx.pure.option('string', blobId || null),
      tx.pure.option('string', mediaType || null)
    ],
  });

  return tx;
};

export const buildJackInTx = () => {
  const tx = new Transaction();

  // jack_in(hive: &mut HiveState, clock: &Clock)
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::jack_in`,
    arguments: [
      tx.object(HIVE_STATE_ID),
      tx.object('0x6')
    ],
  });

  return tx;
};
