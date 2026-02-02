import { useState } from 'react'
import { Router } from './Router'
import { headerLinks } from './routes'
import { Header } from './components/Header'

const App = () => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Header links={headerLinks} />
      <div className="card">
        <Router />
        <h1>Vite + React</h1>
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
      </div>
    </div>
  )
}

export default App
