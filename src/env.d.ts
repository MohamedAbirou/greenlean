/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_ML_SERVICE_URL: string
  // add other env vars here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
