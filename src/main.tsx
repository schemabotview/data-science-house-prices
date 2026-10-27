import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Three stylesheets, in cascade order — the last one wins, and it is the only one this repo owns:
//   engine — @graphlearning/graphl-flow's node styles and the IBM Plex faces
//   shell  — the concept-app layout and surface
//   theme  — this repo's brand token
import '@graphlearning/graphl-flow/styles.css'
import '@graphlearning/shell/styles.css'
import './theme.css'
import { ConceptApp } from '@graphlearning/shell'
import { COURSES } from './content'
import { getScene } from './scenes'

// The whole app: router, section view, catalog and narration are @graphlearning/shell; this repo
// supplies its two registries and its name. audioBase must come from here (the shell is built
// separately and cannot read this app's import.meta.env).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConceptApp subject="Data science" courses={COURSES} getScene={getScene} audioBase={import.meta.env.BASE_URL} />
  </StrictMode>,
)
