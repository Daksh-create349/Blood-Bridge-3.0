interface ImportMetaEnv {
  readonly VITE_EMAILJS_SERVICE_ID: string
  readonly VITE_EMAILJS_TEMPLATE_ID: string
  readonly VITE_EMAILJS_PUBLIC_KEY: string
  readonly API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Declare module to fix "Cannot find module" error
declare module '@emailjs/browser' {
  export const send: (
    serviceId: string,
    templateId: string,
    templateParams: Record<string, any>,
    publicKey: string
  ) => Promise<any>;
}
