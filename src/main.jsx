import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import SiteEnhancements from './siteEnhancements.jsx'
import MotionDataViz from './motionDataViz.jsx'
import FinanceExpansion from './financeExpansion.jsx'
import CareerPages, { esRutaCarreras } from './careerPages.jsx'
import CareerProfessionPages, { esRutaProfesion } from './careerProfessionPages.jsx'
import FinancePages, { esRutaFinanzas } from './financePages.jsx'
import EconomyPages, { esRutaEconomia } from './economyPages.jsx'
import EconomyNavigation from './economyNavigation.jsx'
import CareerMotion from './careerMotion.jsx'
import RouteMotion from './routeMotion.jsx'
import './site-overrides.css'
import './motion-viz.css'
import './results-only-viz.css'
import './finance-expansion.css'
import './finance-expansion-v2.css'
import './career-pages.css'
import './career-integration.css'
import './career-profession-pages.css'
import './finance-pages.css'
import './economy-pages.css'
import './route-motion.css'

const profesion = esRutaProfesion()
const carrera = esRutaCarreras()
const finanzas = esRutaFinanzas()
const economia = esRutaEconomia()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <>
      {profesion ? (
        <>
          <CareerProfessionPages />
          <RouteMotion />
        </>
      ) : carrera ? (
        <>
          <CareerPages />
          <CareerMotion />
        </>
      ) : finanzas ? (
        <>
          <FinancePages />
          <RouteMotion />
        </>
      ) : economia ? (
        <>
          <EconomyPages />
          <RouteMotion />
        </>
      ) : (
        <>
          <App />
          <SiteEnhancements />
          <MotionDataViz />
          <FinanceExpansion />
        </>
      )}
      <EconomyNavigation />
    </>
  </React.StrictMode>,
)
