"use client";

import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import { checkInAbi, getCheckInAddress } from "@/lib/contracts/checkIn";
import { getBuilderDataSuffix } from "@/lib/wagmi/builderCode";

export function CheckInPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddress = getCheckInAddress();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const { data: streak } = useReadContract({
    address: contractAddress,
    abi: checkInAbi,
    functionName: "streak",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(contractAddress && address) },
  });

  const wrongNetwork = isConnected && chainId !== base.id;
  const disabled =
    !isConnected ||
    !contractAddress ||
    isWriting ||
    isSwitching ||
    wrongNetwork;

  async function handleCheckIn() {
    if (!contractAddress) return;
    const baseId = base.id;
    if (chainId !== baseId) {
      await switchChainAsync({ chainId: baseId });
    }
    const suffix = getBuilderDataSuffix();
    await writeContractAsync({
      address: contractAddress,
      abi: checkInAbi,
      functionName: "checkIn",
      chainId: baseId,
      ...(suffix ? { dataSuffix: suffix } : {}),
    });
  }

  return (
    <div className="rounded-lg border border-violet-500/25 bg-violet-500/5 px-3 py-2 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-violet-300/70">
            Daily Sync
          </p>
          {streak !== undefined && isConnected && (
            <p className="font-mono text-[10px] text-lime-300">
              Streak: {Number(streak)}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={handleCheckIn}
          className="rounded border border-lime-400/40 bg-lime-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-lime-200 disabled:opacity-40"
        >
          {!contractAddress
            ? "No contract"
            : isWriting || isSwitching
              ? "Syncing…"
              : "Daily Sync"}
        </button>
      </div>
      {wrongNetwork && (
        <p className="mt-1 font-mono text-[9px] text-amber-300">
          Switch to Base network to sync.
        </p>
      )}
    </div>
  );
}
