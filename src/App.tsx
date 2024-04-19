import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { init, useConnectWallet } from '@web3-onboard/react'
import initInjectedWallets from '@web3-onboard/injected-wallets'
import ConnectButton from './components/ConnectButton'
import './App.css'

init({
  wallets: [initInjectedWallets()],
  chains: [
    {
      id: 1,
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}`,
    },
    {
      id: 11155111,
      token: 'ETH',
      label: 'Sepolia',
      rpcUrl: `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}`,
    },
  ]
})

function App() {
  const [{ wallet }] = useConnectWallet()

  return (
    <>
      <CssBaseline/>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Simple Pool
          </Typography>
          <ConnectButton/>
        </Toolbar>
      </AppBar>
      <Box component="form"
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        visibility={wallet ? 'visible' : 'hidden'}
      >
        <Box>
          <Box>
            <Box>Wallet: {wallet?.accounts[0].address}</Box>
          </Box>
          <Box>
            <Box>Balance: 0 mETH</Box>
          </Box>
          <Box>
            <TextField label="Amount" size="small"></TextField>
            <Button variant="contained" style={{ width: 120}}>Deposit</Button>
          </Box>
          <Box>
            <TextField label="Amount" size="small"></TextField>
            <Button variant="contained" style={{ width: 120}}>Withthdraw</Button>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default App
