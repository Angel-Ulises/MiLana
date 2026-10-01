import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import SiteEnhancements from './siteEnhancements.jsx'
import MotionDataViz from './motionDataViz.jsx'
import FinanceExpansion from './financeExpansion.jsx'
import CareerPages, { esRutaCarreras } from './careerPages.jsx'
import './site-overrides.css'
import './motion-viz.css'
import './results-only-viz.css'
import './finance-expansion.css'
import './career-pages.css'

const carrera = esRutaCarreras()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {carrera ? (
      <CareerPages />
    ) : (
      <>
        <App />
        <SiteEnhancements />
        <MotionDataViz />
        <FinanceExpansion />
      </>
    )}
  </React.StrictMode>,
)
