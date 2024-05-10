import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import {
  AppShell,
  Button,
  Center,
  Flex,
  Group,
  MantineProvider,
  NumberInput,
  Paper,
  Text,
  Title,
} from '@mantine/core'
import { notifications, Notifications } from '@mantine/notifications'
import injectedModule from '@web3-onboard/injected-wallets'
import { init, useConnectWallet } from '@web3-onboard/react'
import { SimplePool__factory } from '../typechain'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css';
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
  const [depositAmount, setDepositAmount] = useState<string | number>("0")
  const [withdrawalAmount, setWithdrawalAmount] = useState<string | number>("0")
  const [availableBalance, setAvailableBalance] = useState("0")
  const [updateRequired, setUpdateRequired] = useState(false)
  const [ { wallet }, connect, disconnect ] = useConnectWallet()

  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet) return
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const simplePool = SimplePool__factory.connect(import.meta.env.VITE_CONTRACT_ADDRESS, signer)

      simplePool.balanceOf(wallet.accounts[0].address).then((balance) => {
        setUpdateRequired(false)
        setAvailableBalance(ethers.formatEther(balance))
      }).catch((error) => {
        setAvailableBalance("0")
        notifications.show({
          color: 'red',
          title: 'Error',
          message: error.message,
        })
      })
    }

    fetchBalance()
  }, [wallet, updateRequired])

  const connectWallet = async () => {
    await connect()
  }

  const disconnectWallet = async () => {
    if (!wallet) return

    await disconnect({ label: wallet.label })
  }

  let address = ""
  let chainId = ""
  let chainLabel = ""
  if (wallet) {
    address = wallet.accounts[0].address
    chainId = wallet.chains[0].id

    for (const chain of chains) {
      if (chain.id === chainId) {
        chainLabel = chain.label
      }
    }
  }

  const deposit = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const simplePool = SimplePool__factory.connect(import.meta.env.VITE_CONTRACT_ADDRESS, signer)

    await simplePool.deposit({ value: ethers.parseEther(depositAmount.toString()) }).then(() => {
      setUpdateRequired(true)
    }).catch((error) => {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: error.message,
      })
    })
  }

  const withdraw = async () => {
  }

  function truncateMiddle(str: string, maxLength: number) {
    if (str.length <= maxLength) {
      return str;
    }
  
    var ellipsis = '...';
    var truncatedLength = maxLength - ellipsis.length;
  
    var leftLength = Math.ceil(truncatedLength / 2);
    var rightLength = Math.floor(truncatedLength / 2);
  
    var leftSubstring = str.substring(0, leftLength);
    var rightSubstring = str.substring(str.length - rightLength);
  
    return leftSubstring + ellipsis + rightSubstring;
  }

  let addressDisplay = truncateMiddle(address, 13)

  return (
    <MantineProvider>
      <Notifications position="top-center"/>
      <AppShell
        header={{ height: 80 }}
        footer={{ height: 80 }}
        padding="md"
      >
        <AppShell.Header>
          <Group justify="space-between" h="100%" px="md">
            <Group>
              <Title order={2}>Simple Pool</Title>
            </Group>
            {!wallet ? (
              <Button onClick={connectWallet}>Connect Wallet</Button>
            ) : (
              <Button onClick={disconnectWallet}>Disconnect Wallet</Button>
            )}
          </Group>
        </AppShell.Header>
        <AppShell.Main>
          <Center>
            <Paper display={wallet ? "block" : "none"} withBorder shadow="lg" radius="lg" p="lg">
              <Flex direction="column" gap="sm">
                <Flex direction="row" justify="space-between">
                  <Text>Chain</Text>
                  <Text>{chainId} ({chainLabel})</Text>
                </Flex>
                <Flex direction="row" justify="space-between">
                  <Text>Wallet</Text>
                  <Text>{addressDisplay}</Text>
                </Flex>
                <Flex direction="row" align="end">
                  <NumberInput label="Deposit Amount" value={depositAmount} onChange={setDepositAmount} min={0} step={0.01} flex="1 1 0%"/>
                  <Button onClick={deposit} w="100">Deposit</Button>
                </Flex>
                <Flex direction="row" align="end">
                  <NumberInput label="Withdrawal Amount" value={withdrawalAmount} onChange={setWithdrawalAmount} min={0} step={0.01}  flex="1 1 0%"/>
                  <Button onClick={withdraw} w="100">Withdraw</Button>
                </Flex>
                <Flex direction="row" justify="space-between">
                  <Text>Balance</Text>
                  <Text>{availableBalance} ETH</Text>
                </Flex>
              </Flex>
            </Paper>
          </Center>
        </AppShell.Main>
        <AppShell.Footer>
          <Center h="100%">
            Footer
          </Center>
        </AppShell.Footer>
      </AppShell>
    </MantineProvider>
  )
}
