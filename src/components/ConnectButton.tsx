import Button from '@mui/material/Button';
import { useConnectWallet } from '@web3-onboard/react'

function ConnectButton() {
    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()

    function getButtonText() {
        if (connecting) {
            return 'Connecting...'
        }

        if (wallet) {
            return 'Disconnect Wallet'
        }

        return 'Connect Wallet'
    }

    function onClick() {
        if (wallet) {
            disconnect(wallet)
        } else {
            connect()
        }
    }


    return (
        <Button variant="outlined" color="inherit" onClick={onClick}>{getButtonText()}</Button>
    )
}

export default ConnectButton
