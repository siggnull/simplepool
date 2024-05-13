import { useAccount } from 'wagmi'
import { Center } from '@mantine/core'
import ControlPanel from './ControlPanel'

export default function Main() {
    const account = useAccount()

    return (
      <Center>
        {account.isConnected && <ControlPanel/>}
      </Center>
    )
}
