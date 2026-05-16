import { Attribution } from "ox/erc8021";

/** From base.dev → Settings → Builder Codes */
export const BUILDER_CODE =
  process.env.NEXT_PUBLIC_BUILDER_CODE ?? "bc_q8x3brxf";

const suffixOverride = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX;

/**
 * ERC-8021 data suffix for transaction attribution.
 * @see https://docs.base.org/apps/builder-codes/app-developers
 */
export function getBuilderDataSuffix(): `0x${string}` | undefined {
  if (suffixOverride?.startsWith("0x")) {
    return suffixOverride as `0x${string}`;
  }
  if (!BUILDER_CODE || !BUILDER_CODE.startsWith("bc_")) {
    return undefined;
  }
  return Attribution.toDataSuffix({ codes: [BUILDER_CODE] });
}
