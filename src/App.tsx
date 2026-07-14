import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from '@/routes'
import MobileBlocker from '@/components/layout/MobileBlocker'

export default function App() {
  return (
    <>
      <MobileBlocker />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  )
}
