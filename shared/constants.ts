import "dotenv/config";

export const Constants = {
  USER_TOKEN_VALIDITY: "24h",
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  USER: "User",
  ADMIN: "Admin",

  AUTH_ENCRYPTION_KEY: process.env.AUTH_ENCRYTION_KEY,
  DEFAULT_USER_PROFILE_IMAGE:
    "https://s3.uat.gojungle.xyz/profile/1667915533072-ProfileEmptyState.png",
};

export const NullAddressConstant = {
  NULLADDRESS: "0x0000000000000000000000000000000000000000",
};

export const HTTP_PROVIDER_ETH = {
  HTTP_PROVIDER_ETH:
    "https://eth-goerli.g.alchemy.com/v2/JcK2AesIy-C0XaLZZdPiFEKwPKznoRCa",
  // process.env.HTTP_PROVIDER_ETH
};

export const HTTP_PROVIDER_MATIC = {
  HTTP_PROVIDER_MATIC:
    "https://polygon-mumbai.g.alchemy.com/v2/tm4_sLWgDbcExuOQxPbP2T8zBEC9X4wr",
  // process.env.HTTP_PROVIDER_MATIC
};

export const csrfExcludeRoutes = [
  "/api/v1/user/logout",
  "/api/v1/user",
  "/api/v1/admin/login",
];

export const walletTypes = [
  "Metamask",
  "Fortmatic",
  "Walletconnect",
  "Coinbase",
];
