import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import SiteEnhancements from './siteEnhancements.jsx'
import MotionDataViz from './motionDataViz.jsx'
import FinanceExpansion from './financeExpansion.jsx'
import CareerPages, { esRutaCarreras } from './careerPages.jsx'
import CareerProfessionPages, { esRutaProfesion } from './careerProfessionPages.jsx'
import FinancePages, { esRutaFinanzas } from './financePages.jsx'
import CareerMotion from './careerMotion.jsx'
import './site-overrides.css'
import './motion-viz.css'
import './results-only-viz.css'
import './finance-expansion.css'
import './career-pages.css'
import './career-integration.css'
import './career-profession-pages.css'
import './finance-pages.css'

const profesion = esRutaProfesion()
const carrera = esRutaCarreras()
const finanzas = esRutaFinanzas()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {profesion ? (
      <CareerProfessionPages />
    ) : carrera ? (
      <>
        <CareerPages />
        <CareerMotion />
      </>
    ) : finanzas ? (
      <FinancePages />
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
