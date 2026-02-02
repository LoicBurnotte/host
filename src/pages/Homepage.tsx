import { useState } from 'react'
import { Link } from 'react-router-dom'

export const Homepage = () => {
  const [count, setCount] = useState(0)
  return (
    <div>
      <h1>Homepage</h1>
      <Link to="/about">About</Link>
      <h1>Vite + React</h1>
      <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
    </div>
  )
}
