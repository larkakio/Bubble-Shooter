import { createConfig, createStorage, http, cookieStorage } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { baseAccount, injected } from "wagmi/connectors";
import { Attribution } from "ox/erc8021";

const builderCode = process.env.NEXT_PUBLIC_BUILDER_CODE;
const suffixOverride = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX;

const dataSuffix =
  suffixOverride && suffixOverride.startsWith("0x")
    ? (suffixOverride as `0x${string}`)
    : builderCode
      ? Attribution.toDataSuffix({ codes: [builderCode] })
      : undefined;

const connectors = [
  injected(),
  baseAccount({
    appName: "Neon Bubble Shooter",
  }),
];

export const config = createConfig({
  chains: [base, mainnet],
  connectors,
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
  ...(dataSuffix ? { dataSuffix } : {}),
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

export { dataSuffix };
