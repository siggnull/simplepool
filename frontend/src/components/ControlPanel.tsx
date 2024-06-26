import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { Button, Flex, NumberInput, Paper, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { SimplePool__factory } from '../../typechain'

export default function ControlPanel() {
  const account = useAccount()
  const balance = useBalance({ address: account.address })
  const [depositAmount, setDepositAmount] = useState<string | number>("0")
  const [withdrawalAmount, setWithdrawalAmount] = useState<string | number>("0")
  const [stakedBalance, setStakedBalance] = useState("0")
  const [updateRequired, setUpdateRequired] = useState(false)

  const showError = (message: string) => {
    notifications.show({
      color: 'red',
      title: 'Error',
      message: message,
      autoClose: 10000,
    })
  }

  const getSimplePoolInstance = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    
    return SimplePool__factory.connect(import.meta.env.VITE_CONTRACT_ADDRESS, signer)
  }

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account.address) return

      const simplePool = await getSimplePoolInstance()

      simplePool.balanceOf(account.address).then((balance) => {
        setUpdateRequired(false)
        setStakedBalance(ethers.formatEther(balance))
      }).catch((error) => {
        setStakedBalance("0")
        showError(error.message)
      })
    }

    fetchBalance()
  }, [account, updateRequired])

  let chainLabel = account.chain?.name ?? "Not connected"
  let chainId = account.chainId ?? 0
  let address = account.address ?? "Unknown"
    
  const deposit = async () => {
    const simplePool = await getSimplePoolInstance()

    await simplePool.deposit({ value: ethers.parseEther(depositAmount.toString()) }).then(() => {
      setUpdateRequired(true)
    }).catch((error) => {
      showError(error.message)
    })
  }
    
  const withdraw = async () => {
    const simplePool = await getSimplePoolInstance()

    await simplePool.withdraw(ethers.parseEther(withdrawalAmount.toString())).then(() => {
      setUpdateRequired(true)
    }).catch((error) => {
      showError(error.message)
    })
  }

  function truncateMiddle(str: string, maxLength: number) {
    if (str.length <= maxLength) {
      return str
    }

    var ellipsis = '...'
    var truncatedLength = maxLength - ellipsis.length

    var leftLength = Math.ceil(truncatedLength / 2)
    var rightLength = Math.floor(truncatedLength / 2)

    var leftSubstring = str.substring(0, leftLength)
    var rightSubstring = str.substring(str.length - rightLength)

    return leftSubstring + ellipsis + rightSubstring
  }
    
  let addressDisplay = truncateMiddle(address, 13)

  return (
    <Paper display={account.isConnected ? "block" : "none"} withBorder shadow="lg" radius="lg" p="lg">
      <Flex direction="column" gap="sm">
        <Flex direction="row" justify="space-between">
          <Text>Chain</Text>
          <Text>{chainLabel} ({chainId})</Text>
        </Flex>
        <Flex direction="row" justify="space-between">
          <Text>Wallet</Text>
          <Text>{addressDisplay}</Text>
        </Flex>
        <Flex direction="row" justify="space-between">
          <Text>Balance</Text>
          <Text>{balance.data?.formatted} ETH</Text>
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
          <Text>Staked</Text>
          <Text>{stakedBalance} ETH</Text>
        </Flex>
      </Flex>
    </Paper>
  )
}
