import { AppShell, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import Footer from './components/Footer'
import Header from './components/Header'
import Main from './components/Main'
import Web3Provider from './providers/Web3Provider'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './App.css'


export default function App() {
  return (
    <MantineProvider>
      <Web3Provider>
        <Notifications position="top-center"/>
        <AppShell
          header={{ height: 80 }}
          footer={{ height: 80 }}
          padding="md"
        >
          <AppShell.Header>
            <Header/>
          </AppShell.Header>
          <AppShell.Main>
            <Main/>
          </AppShell.Main>
          <AppShell.Footer>
            <Footer/>
          </AppShell.Footer>
        </AppShell>
      </Web3Provider>
    </MantineProvider>
  )
}
