import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import SiteEnhancements from './siteEnhancements.jsx'
import MotionDataViz from './motionDataViz.jsx'
import './site-overrides.css'
import './motion-viz.css'
import './results-only-viz.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <SiteEnhancements />
    <MotionDataViz />
  </React.StrictMode>,
)
