import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import type { EIP1193Provider } from '@web3-onboard/common'
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import './App.css'

const MAINNET_CHAIN_ID = "0x1"
const SEPOLIA_CHAIN_ID = "0xaa36a7"

const injected = injectedModule()

const onboard = Onboard({
  wallets: [injected],
  chains: [
    {
      id: MAINNET_CHAIN_ID,
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}`,
    },
    {
      id: SEPOLIA_CHAIN_ID,
      token: 'ETH',
      label: 'Sepolia',
      rpcUrl: `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}`,
    },
  ]
})

export default function App() {
  const [_, setProvider] = useState<EIP1193Provider>()
  const [account, setAccount] = useState("")
  const [error, setError] = useState("")
  const [chainId, setChainId] = useState("")
  const [chainName, setChainName] = useState("")

  const getChainName = (id: string) => {
    for (const chain of onboard.state.get().chains) {
      if (chain.id === id) {
        return chain.label || "Not set"
      }
    }

    return 'Unknown'
  }

  const connectWallet = async () => {
    try {
      const wallets = await onboard.connectWallet()

      const { accounts, chains, provider } = wallets[0]
      setAccount(accounts[0].address)
      setChainId(chains[0].id)
      setChainName(getChainName(chains[0].id))
      setProvider(provider)
      setError("")
    } catch (error) {
      setError(String(error))
    }
  }

  const disconnectWallet = async () => {
    const [primaryWallet] = onboard.state.get().wallets
    if (!primaryWallet) return
    await onboard.disconnectWallet({ label: primaryWallet.label })
    refreshState()
  }

  const refreshState = () => {
    setAccount("")
    setChainId("")
    setProvider(undefined)
  }

  return (
    <>
      <CssBaseline/>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Simple Pool
          </Typography>
          {!account ? (
            <Button variant="outlined" color="inherit" onClick={connectWallet}>Connect Wallet</Button>
          ) : (
            <Button variant="outlined" color="inherit" onClick={disconnectWallet}>Disconnect Wallet</Button>
          )}
        </Toolbar>
      </AppBar>
      <Box component="form"
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        visibility={account ? 'visible' : 'hidden'}
      >
        <Box>
          <Box>
            Chain: {chainName}
          </Box>
          <Box>
            Wallet: {account}
          </Box>
          <Box>
            <TextField label="Amount" size="small"></TextField>
            <Button variant="contained" style={{ width: 120}}>Deposit</Button>
          </Box>
          <Box>
            <TextField label="Amount" size="small"></TextField>
            <Button variant="contained" style={{ width: 120}}>Withthdraw</Button>
          </Box>
          <Box>
            Staked: 0 ETH
          </Box>
          <Box visibility={error ? 'visible' : 'hidden'}>
            {error}
          </Box>
        </Box>
      </Box>
    </>
  )
}
