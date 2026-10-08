import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  esRutaCarreras, esRutaProfesion, esRutaOcupaciones, esRutaCompararCarreras,
  esRutaCompararEstados, esRutaEstado, esRutaFondosCNBV, esRutaCetesReferencia,
  esRutaCompararInstrumentos, esRutaInversionEducativa, esRutaAsesor,
  esRutaFinanzas, esRutaEconomia, rutaConExtras,
} from './lib/routeMatcher.js'

// Cada página carga únicamente la sección que el visitante pidió.
// La detección de rutas permanece síncrona para conservar todas las prioridades.
const App = React.lazy(() => import('./App.jsx'))
const SiteEnhancements = React.lazy(() => import('./siteEnhancements.jsx'))
const MotionDataViz = React.lazy(() => import('./motionDataViz.jsx'))
const FinanceExpansion = React.lazy(() => import('./financeExpansion.jsx'))
const CareerPages = React.lazy(() => import('./careerPages.jsx'))
const CareerProfessionPages = React.lazy(() => import('./careerProfessionPages.jsx'))
const OccupationComparePage = React.lazy(() => import('./occupationComparePage.jsx'))
const OccupationEntry = React.lazy(() => import('./occupationEntry.jsx'))
const CareerComparePage = React.lazy(() => import('./careerComparePage.jsx'))
const StateComparePage = React.lazy(() => import('./stateComparePage.jsx'))
const StatePages = React.lazy(() => import('./statePages.jsx'))
const StateEntry = React.lazy(() => import('./stateEntry.jsx'))
const StateHousing = React.lazy(() => import('./stateHousing.jsx'))
const StateOccupations = React.lazy(() => import('./stateOccupations.jsx'))
const StateCompareEntry = React.lazy(() => import('./stateCompareEntry.jsx'))
const SavedStateContext = React.lazy(() => import('./savedStateContext.jsx'))
const FinancePages = React.lazy(() => import('./financePages.jsx'))
const AdvisorPage = React.lazy(() => import('./advisorPage.jsx'))
const AdvisorEntry = React.lazy(() => import('./advisorEntry.jsx'))
const InvestmentReadinessPage = React.lazy(() => import('./investmentReadinessPage.jsx'))
const InvestmentInstrumentComparePage = React.lazy(() => import('./investmentInstrumentComparePage.jsx'))
const CetesReferencePage = React.lazy(() => import('./cetesReferencePage.jsx'))
const CnbvFundsPage = React.lazy(() => import('./cnbvFundsPage.jsx'))
const InvestmentEntry = React.lazy(() => import('./investmentEntry.jsx'))
const InvestmentCompareEntry = React.lazy(() => import('./investmentCompareEntry.jsx'))
const EconomyPages = React.lazy(() => import('./economyPages.jsx'))
const EconomyNavigation = React.lazy(() => import('./economyNavigation.jsx'))
const CareerMotion = React.lazy(() => import('./careerMotion.jsx'))
const RouteMotion = React.lazy(() => import('./routeMotion.jsx'))
const JourneyCompanion = React.lazy(() => import('./journeyCompanion.jsx'))
import './route-loading.css'
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
import './economy-ux.css'
import './route-motion.css'
import './ecosystem-compact.css'
import './connected-journeys.css'
import './home-flow.css'
import './home-expansion-compact.css'
import './net-income-handoff.css'
import './finance-continuations.css'
import './finance-tool-first.css'
import './career-state-tool-first.css'
import './compare-profile-context.css'
import './occupation-profession-mobile.css'

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
const extras = rutaConExtras()

// Se reserva el espacio del contenido principal mientras llega su módulo.
// Los complementos cargan de forma independiente para no bloquear la página.
function PrimaryRoute() {
  return profesion ? (
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
  )
}

function RouteExtras() {
  return <>
    {extras.occupationEntry && <OccupationEntry />}
    {extras.stateEntry && <StateEntry />}
    {extras.stateHousing && <StateHousing />}
    {extras.stateOccupations && <StateOccupations />}
    {extras.stateCompareEntry && <StateCompareEntry />}
    {extras.savedStateContext && <SavedStateContext />}
    {extras.advisorEntry && <AdvisorEntry />}
    {extras.investmentEntry && <InvestmentEntry />}
    {extras.investmentCompareEntry && <InvestmentCompareEntry />}
    {extras.economyNavigation && <EconomyNavigation />}
    <JourneyCompanion />
  </>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <React.Suspense fallback={<main className="ml-route-loading" role="status" aria-label="Cargando sección"><span>Cargando contenido…</span></main>}>
      <PrimaryRoute />
    </React.Suspense>
    <React.Suspense fallback={null}>
      <RouteExtras />
    </React.Suspense>
  </React.StrictMode>,
)