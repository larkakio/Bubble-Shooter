import { createConfig, createStorage, http, cookieStorage } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { baseAccount, injected } from "wagmi/connectors";
import { getBuilderDataSuffix } from "./builderCode";

const dataSuffix = getBuilderDataSuffix();

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
