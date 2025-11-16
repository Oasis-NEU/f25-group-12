import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './Components/Header'
import Home from './Pages/Home'
import About from './Pages/About'
import SignIn from './Pages/SignIn'
import SignUp from './Pages/SignUp'
import Profile from './Pages/Profile'
import ProtectedRoute from './Components/ProtectedRoute'
import CreateIssue from './Pages/CreateIssue'
import CreateProperty from './Pages/CreateProperty'
import EditIssue from './Pages/EditIssue'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/edit-issue/:issueId" element={<EditIssue />} />

            
            {/* Protected Profile Route */}
            {/* We can and SHOULD and more protected routes as needed. */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-issue" 
              element={
                <ProtectedRoute>
                  <CreateIssue />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/create-property" 
              element={
                <ProtectedRoute>
                  <CreateProperty />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App