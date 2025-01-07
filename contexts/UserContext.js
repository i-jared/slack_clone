import { createContext } from 'react'

export const UserContext = createContext({
  user: null,
  session: null,
})

export default UserContext 