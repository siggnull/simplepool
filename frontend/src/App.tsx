import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import injectedModule from '@web3-onboard/injected-wallets'
import { init, useConnectWallet } from '@web3-onboard/react'
import './App.css'

const MAINNET_CHAIN_ID = "0x1"
const SEPOLIA_CHAIN_ID = "0xaa36a7"
const HARDHAT_CHAIN_ID = "0x7a69"

const injected = injectedModule()

const chains = [
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
  {
    id: HARDHAT_CHAIN_ID,
    token: 'ETH',
    label: 'Hardhat',
    rpcUrl: 'http://127.0.0.1:8545',
  }
]

init({
  wallets: [injected],
  chains: chains
})

export default function App() {
  const [ { wallet }, connect, disconnect ] = useConnectWallet()

  const connectWallet = async () => {
    await connect()
  }

  const disconnectWallet = async () => {
    if (!wallet) return

    await disconnect({ label: wallet.label })
  }

  let account = ""
  let chainId = ""
  let chainLabel = ""
  if (wallet) {
    account = wallet.accounts[0].address
    chainId = wallet.chains[0].id

    for (const chain of chains) {
      if (chain.id === chainId) {
        chainLabel = chain.label
      }
    }
  }

  const deposit = async () => {
  }

  const withdraw = async () => {
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
            Chain: {chainLabel} ({chainId})
          </Box>
          <Box>
            Wallet: {account}
          </Box>
          <Box>
            <TextField label="Amount" size="small"></TextField>
            <Button variant="contained" style={{ width: 120}} onClick={deposit}>Deposit</Button>
          </Box>
          <Box>
            <TextField label="Amount" size="small"></TextField>
            <Button variant="contained" style={{ width: 120}} onClick={withdraw}>Withthdraw</Button>
          </Box>
          <Box>
            Staked: 0 ETH
          </Box>
        </Box>
      </Box>
    </>
  )
}
