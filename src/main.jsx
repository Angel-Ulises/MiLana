import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import SiteEnhancements from './siteEnhancements.jsx'
import MotionDataViz from './motionDataViz.jsx'
import FinanceExpansion from './financeExpansion.jsx'
import CareerPages, { esRutaCarreras } from './careerPages.jsx'
import CareerProfessionPages, { esRutaProfesion } from './careerProfessionPages.jsx'
import OccupationComparePage, { esRutaOcupaciones } from './occupationComparePage.jsx'
import OccupationEntry from './occupationEntry.jsx'
import CareerComparePage, { esRutaCompararCarreras } from './careerComparePage.jsx'
import StateComparePage, { esRutaCompararEstados } from './stateComparePage.jsx'
import StatePages, { esRutaEstado } from './statePages.jsx'
import StateEntry from './stateEntry.jsx'
import StateHousing from './stateHousing.jsx'
import StateOccupations from './stateOccupations.jsx'
import StateCompareEntry from './stateCompareEntry.jsx'
import SavedStateContext from './savedStateContext.jsx'
import FinancePages, { esRutaFinanzas } from './financePages.jsx'
import AdvisorPage, { esRutaAsesor } from './advisorPage.jsx'
import AdvisorEntry from './advisorEntry.jsx'
import InvestmentReadinessPage, { esRutaInversionEducativa } from './investmentReadinessPage.jsx'
import InvestmentInstrumentComparePage, { esRutaCompararInstrumentos } from './investmentInstrumentComparePage.jsx'
import CetesReferencePage, { esRutaCetesReferencia } from './cetesReferencePage.jsx'
import CnbvFundsPage, { esRutaFondosCNBV } from './cnbvFundsPage.jsx'
import InvestmentEntry from './investmentEntry.jsx'
import InvestmentCompareEntry from './investmentCompareEntry.jsx'
import EconomyPages, { esRutaEconomia } from './economyPages.jsx'
import EconomyNavigation from './economyNavigation.jsx'
import CareerMotion from './careerMotion.jsx'
import RouteMotion from './routeMotion.jsx'
import JourneyCompanion from './journeyCompanion.jsx'
import './site-overrides.css'
import './motion-viz.css'
import './results-only-viz.css'
import './finance-expansion.css'
import './finance-expansion-v2.css'
import './career-pages.css'
import './career-integration.css'
import './career-profession-pages.css'
import './occupation-compare.css'
import './career-compare.css'
import './state-pages.css'
import './state-labor.css'
import './state-housing.css'
import './state-occupations.css'
import './state-compare.css'
import './state-compare-entry.css'
import './saved-state-context.css'
import './state-entry.css'
import './finance-pages.css'
import './advisor-page.css'
import './investment-readiness.css'
import './investment-decision.css'
import './investment-debt-context.css'
import './investment-instrument-compare.css'
import './cetes-reference.css'
import './cnbv-funds.css'
import './economy-pages.css'
import './route-motion.css'
import './ecosystem-compact.css'
import './connected-journeys.css'

const profesion = esRutaProfesion()
const ocupaciones = esRutaOcupaciones()
const compararCarreras = esRutaCompararCarreras()
const compararEstados = esRutaCompararEstados()
const estados = esRutaEstado()
const carrera = esRutaCarreras()
const fondosCNBV = esRutaFondosCNBV()
const cetesReferencia = esRutaCetesReferencia()
const compararInstrumentos = esRutaCompararInstrumentos()
const inversion = esRutaInversionEducativa()
const asesor = esRutaAsesor()
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
      ) : ocupaciones ? (
        <>
          <OccupationComparePage />
          <RouteMotion />
        </>
      ) : compararCarreras ? (
        <>
          <CareerComparePage />
          <RouteMotion />
        </>
      ) : compararEstados ? (
        <>
          <StateComparePage />
          <RouteMotion />
        </>
      ) : estados ? (
        <>
          <StatePages />
          <RouteMotion />
        </>
      ) : carrera ? (
        <>
          <CareerPages />
          <CareerMotion />
        </>
      ) : fondosCNBV ? (
        <>
          <CnbvFundsPage />
          <RouteMotion />
        </>
      ) : cetesReferencia ? (
        <>
          <CetesReferencePage />
          <RouteMotion />
        </>
      ) : compararInstrumentos ? (
        <>
          <InvestmentInstrumentComparePage />
          <RouteMotion />
        </>
      ) : inversion ? (
        <>
          <InvestmentReadinessPage />
          <RouteMotion />
        </>
      ) : asesor ? (
        <>
          <AdvisorPage />
          <RouteMotion />
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
      <OccupationEntry />
      <StateEntry />
      <StateHousing />
      <StateOccupations />
      <StateCompareEntry />
      <SavedStateContext />
      <AdvisorEntry />
      <InvestmentEntry />
      <InvestmentCompareEntry />
      <EconomyNavigation />
      <JourneyCompanion />
    </>
  </React.StrictMode>,
)
