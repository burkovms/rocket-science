export const publicKeyShortenerHelper = (
  publicKey: string,
  start: number = 5,
  end: number = 5
) => {
  if (!publicKey) {
    return publicKey;
  }
  if (!publicKey.startsWith('0x')) {
    publicKey = '0x' + publicKey;
  }

  return `${publicKey.slice(0, start)} ... ${publicKey.slice(-end)}`;
};
