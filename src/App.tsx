import { Router } from './Router'
import { headerLinks } from './routes'
import { Header } from './components/Header'

const App = () => {
  return (
    <div>
      <Header links={headerLinks} />
      <div className="card">
        <Router />
      </div>
    </div>
  )
}

export default App
