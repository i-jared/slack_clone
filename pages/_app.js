import { UserContextProvider } from '../lib/UserContext'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <UserContextProvider>
      <Component {...pageProps} />
    </UserContextProvider>
  )
}

export default MyApp
