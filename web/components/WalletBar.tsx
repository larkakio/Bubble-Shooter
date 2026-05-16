"use client";

import {
  useConnect,
  useAccount,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { base } from "wagmi/chains";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export function WalletBar() {
  const [mounted, setMounted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const wrongNetwork = isConnected && chainId !== base.id;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  const short = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : "";

  const sheet =
    mounted && sheetOpen
      ? createPortal(
          <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={() => setSheetOpen(false)}>
            <div
              className="w-full max-w-lg rounded-t-2xl border border-cyan-500/30 bg-[#0a0a12]/95 p-4 shadow-[0_0_40px_rgba(0,245,255,0.15)]"
              role="dialog"
              aria-modal="true"
              aria-label="Connect wallet"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm tracking-widest text-cyan-300">
                  LINK WALLET
                </h2>
                <button
                  type="button"
                  aria-label="Close wallet sheet"
                  onClick={() => setSheetOpen(false)}
                  className="rounded border border-white/10 px-2 py-1 text-xs text-white/70 hover:border-cyan-500/50"
                >
                  ✕
                </button>
              </div>
              {wrongNetwork && (
                <div className="mb-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
                  Wrong network. Switch to Base to sync on-chain.
                  <button
                    type="button"
                    className="mt-2 block w-full rounded bg-amber-500/20 py-2 font-mono text-amber-100"
                    disabled={isSwitching}
                    onClick={() => switchChain({ chainId: base.id })}
                  >
                    {isSwitching ? "Switching…" : "Switch to Base"}
                  </button>
                </div>
              )}
              <ul className="max-h-[50vh] space-y-2 overflow-y-auto">
                {connectors.length === 0 ? (
                  <li className="py-4 text-center text-xs text-white/50">
                    No wallets detected. Open in a wallet browser or install an
                    extension.
                  </li>
                ) : (
                  connectors.map((connector) => (
                    <li key={connector.uid}>
                      <button
                        type="button"
                        disabled={isPending}
                        className="w-full rounded-lg border border-cyan-500/20 bg-white/5 py-3 font-mono text-sm text-cyan-100 transition hover:border-cyan-400/60 hover:bg-cyan-500/10"
                        onClick={() => {
                          connect({ connector, chainId: base.id });
                          setSheetOpen(false);
                        }}
                      >
                        {connector.name}
                      </button>
                    </li>
                  ))
                )}
              </ul>
              <div className="mb-[env(safe-area-inset-bottom)] h-2" />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            {wrongNetwork && (
              <button
                type="button"
                className="rounded border border-amber-500/50 px-2 py-1 text-[10px] uppercase tracking-wider text-amber-300"
                disabled={isSwitching}
                onClick={() => switchChain({ chainId: base.id })}
              >
                Base
              </button>
            )}
            <span className="hidden font-mono text-[10px] text-cyan-300/80 sm:inline">
              {short}
            </span>
            <button
              type="button"
              onClick={() => disconnect()}
              className="rounded border border-magenta-500/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-magenta-200 hover:bg-magenta-500/10"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="rounded border border-cyan-400/50 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-cyan-200 shadow-[0_0_12px_rgba(0,245,255,0.25)]"
          >
            Connect wallet
          </button>
        )}
      </div>
      {sheet}
    </>
  );
}
