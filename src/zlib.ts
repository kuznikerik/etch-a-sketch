import { zlibSync, unzlibSync } from "fflate";
import { decode, encode, fromUint8Array, toUint8Array } from "js-base64";

export const compress = (input: string): string => {
  // string > uint8array > zlibSync > uint8array > base64
  const uint8Array = stringToUint8Array(input);
  const compressed = zlibSync(uint8Array);
  return uint8ArrayToBase64(compressed);
};
export const decompress = (base64String: string): string => {
  // base64 > uint8array > unzlibSync > uint8array > string
  const uint8Array = base64ToUint8Array(base64String);
  const decompressed = unzlibSync(uint8Array);
  return uint8ArrayToString(decompressed);
};

export const stringToUint8Array = (string: string): Uint8Array => {
  return toUint8Array(encode(string));
};

export const uint8ArrayToString = (uint8Array: Uint8Array): string => {
  return decode(fromUint8Array(uint8Array));
};

export const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
  return fromUint8Array(uint8Array, true);
};

export const base64ToUint8Array = (string: string): Uint8Array => {
  return toUint8Array(string);
};
