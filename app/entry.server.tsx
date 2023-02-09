// import { PassThrough } from "stream";

// import type { EntryContext } from "@remix-run/node";
// import { Response } from "@remix-run/node";
// import { RemixServer } from "@remix-run/react";
// import { renderToPipeableStream } from "react-dom/server";
// import createEmotionCache from "@emotion/cache";
// import { CacheProvider as EmotionCacheProvider } from "@emotion/react";
// import createEmotionServer from "@emotion/server/create-instance";

// const ABORT_DELAY = 5000;

// const handleRequest = (
//   request: Request,
//   responseStatusCode: number,
//   responseHeaders: Headers,
//   remixContext: EntryContext
// ) => handleBrowserRequest(
//   request,
//   responseStatusCode,
//   responseHeaders,
//   remixContext
// );
// export default handleRequest;

// const handleBrowserRequest = (
//   request: Request,
//   responseStatusCode: number,
//   responseHeaders: Headers,
//   remixContext: EntryContext
// ) =>
//   new Promise((resolve, reject) => {
//     let didError = false;
//     const emotionCache = createEmotionCache({ key: "css" });

//     const { pipe, abort } = renderToPipeableStream(
//       <EmotionCacheProvider value={emotionCache}>
//         <RemixServer context={remixContext} url={request.url} />
//       </EmotionCacheProvider>,
//       {
//         onShellReady: () => {
//           const reactBody = new PassThrough();
//           const emotionServer = createEmotionServer(emotionCache);

//           const bodyWithStyles = emotionServer.renderStylesToNodeStream();
//           reactBody.pipe(bodyWithStyles);

//           responseHeaders.set("Content-Type", "text/html");

//           resolve(
//             new Response(bodyWithStyles, {
//               headers: responseHeaders,
//               status: didError ? 500 : responseStatusCode,
//             })
//           );

//           pipe(reactBody);
//         },
//         onShellError: (error: unknown) => {
//           reject(error);
//         },
//         onError: (error: unknown) => {
//           didError = true;

//           console.error(error);
//         },
//       }
//     );

//     setTimeout(abort, ABORT_DELAY);
//   });

import { renderToString } from 'react-dom/server'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import { RemixServer } from '@remix-run/react'
import type { EntryContext } from '@remix-run/node' // Depends on the runtime you choose

import { ServerStyleContext } from './context'
import createEmotionCache from './createEmotionCache'

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const cache = createEmotionCache()
  const { extractCriticalToChunks } = createEmotionServer(cache)

  const html = renderToString(
    <ServerStyleContext.Provider value={null}>
      <CacheProvider value={cache}>
        <RemixServer context={remixContext} url={request.url} />
      </CacheProvider>
    </ServerStyleContext.Provider>,
  )

  const chunks = extractCriticalToChunks(html)

  const markup = renderToString(
    <ServerStyleContext.Provider value={chunks.styles}>
      <CacheProvider value={cache}>
        <RemixServer context={remixContext} url={request.url} />
      </CacheProvider>
    </ServerStyleContext.Provider>,
  )

  responseHeaders.set('Content-Type', 'text/html')

  return new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}