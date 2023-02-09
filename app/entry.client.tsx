// import createEmotionCache from "@emotion/cache";
// import { CacheProvider } from "@emotion/react";
// import { RemixBrowser } from "@remix-run/react";
// import { startTransition, StrictMode } from "react";
// import { hydrateRoot } from "react-dom/client";

// const hydrate = () => {
//   const emotionCache = createEmotionCache({ key: "css" });

//   startTransition(() => {
//     hydrateRoot(
//       document,
//       <StrictMode>
//         <CacheProvider value={emotionCache}>
//           <RemixBrowser />
//         </CacheProvider>
//       </StrictMode>
//     );
//   });
// };

// if (typeof requestIdleCallback === "function") {
//   requestIdleCallback(hydrate);
// } else {
//   setTimeout(hydrate, 1);
// }

import React, { useState } from 'react'
import { hydrate } from 'react-dom'
import { CacheProvider } from '@emotion/react'
import { RemixBrowser } from '@remix-run/react'

import { ClientStyleContext } from './context'
import createEmotionCache, { defaultCache } from './createEmotionCache'

interface ClientCacheProviderProps {
  children: React.ReactNode;
}

function ClientCacheProvider({ children }: ClientCacheProviderProps) {
  const [cache, setCache] = useState(defaultCache)

  function reset() {
    setCache(createEmotionCache())
  }

  return (
    <ClientStyleContext.Provider value={{ reset }}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </ClientStyleContext.Provider>
  )
}

hydrate(
  <ClientCacheProvider>
    <RemixBrowser />
  </ClientCacheProvider>,
  document,
)