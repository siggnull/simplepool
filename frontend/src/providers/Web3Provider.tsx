import { ReactNode } from "react"
import { WagmiProvider, createConfig } from "wagmi"
import { sepolia, hardhat } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConnectKitProvider, getDefaultConfig } from "connectkit"

const config = createConfig(
  getDefaultConfig({
    appName: "Simple Pool",
    chains: [sepolia, hardhat],
    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  }),
)

const queryClient = new QueryClient()

interface Web3ProviderProps {
  children: ReactNode
}

const Web3Provider = ({ children }: Web3ProviderProps) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default Web3Provider
