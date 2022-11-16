import 'dotenv/config';

export const Constants = {
  USER_TOKEN_VALIDITY: '24h',
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  USER: 'User',
  ADMIN: 'Admin',

  EMAIL_TOKEN_VALIDITY: '15m',
  EMAIL_VALIDITY_BASE_URL: `${process.env.FRONTEND_BASE_URL}emailverify`,

  DEFAULT_NFT_IMAGE: process.env.DEFAULT_NFT_IMAGE,
  COLLECTION_LOGO: process.env.COLLECTION_LOGO,
  COLLECTION_BANNER: process.env.COLLECTION_BANNER,
  COLLECTION_FEATUREIMAGE: process.env.COLLECTION_FEATUREIMAGE,

  COLLECTION_NAME: 'Untitled Collection',
  COLLECTION_SLUG: 'untitled-collection',

  STATS_DISPLAY_TYPE: 'number',
  IPFS_BASE_URI: 'https://ipfs.io/ipfs',
  ARWEAVE_URI: 'arweave.net',
  S3_BASE_URI: 'https://jungle-development-bucket.s3.amazonaws.com',

  AUTH_ENCRYPTION_KEY: process.env.AUTH_ENCRYTION_KEY,
  DEFAULT_USER_PROFILE_IMAGE:
    'https://s3.uat.gojungle.xyz/profile/1667915533072-ProfileEmptyState.png',
};

export const AdminWalletAddress = [
  process.env.ADMIN_WALLET_ADDRESS_EARNING,
  process.env.ADMIN_WALLET_ADDRESS,
  process.env.ADMIN_WALLET_ADDRESS_GASFREE,
  process.env.ADMIN_EXCHANGE_WALLET_ADDRESS,
];



export const NullAddressConstant = {
  NULLADDRESS: '0x0000000000000000000000000000000000000000',
};

export const HTTP_PROVIDER_ETH = {
  HTTP_PROVIDER_ETH: 'https://eth-goerli.g.alchemy.com/v2/JcK2AesIy-C0XaLZZdPiFEKwPKznoRCa'
  // process.env.HTTP_PROVIDER_ETH
}

export const HTTP_PROVIDER_MATIC = {
  HTTP_PROVIDER_MATIC: 'https://polygon-mumbai.g.alchemy.com/v2/tm4_sLWgDbcExuOQxPbP2T8zBEC9X4wr'
  // process.env.HTTP_PROVIDER_MATIC
}

export const csrfExcludeRoutes = [
  '/api/v1/user/logout',
  '/api/v1/user',
  '/api/v1/kyc/kyc_submittion_hook',
  '/api/v1/admin/login',
];


export const walletTypes = [
  'Metamask',
  'Fortmatic',
  'Walletconnect',
  'Coinbase',
];
