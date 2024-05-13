import { Group, Title } from '@mantine/core'
import { ConnectKitButton } from 'connectkit'

export default function Header() {
  return (
    <Group justify="space-between" h="100%" px="md">
      <Group>
        <Title order={2}>Simple Pool</Title>
      </Group>
      <ConnectKitButton/>
    </Group>
  )
}
