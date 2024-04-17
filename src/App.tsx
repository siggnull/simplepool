import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { init } from '@web3-onboard/react'
import initInjectedWallets from '@web3-onboard/injected-wallets'
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
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Simple Pool
          </Typography>
          <Button variant="outlined" color="inherit">Connect Wallet</Button>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default App
