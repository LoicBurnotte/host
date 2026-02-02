import { Link } from 'react-router-dom'

export const Homepage = () => {
  return (
    <div>
      <h1>Homepage</h1>
      <Link to="/about">About</Link>
    </div>
  )
}
