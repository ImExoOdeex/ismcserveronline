// import { PassThrough } from "stream";
// import type { EntryContext } from "@remix-run/node";
// import { Response } from "@remix-run/node";
// import { RemixServer } from "@remix-run/react";
// import isbot from "isbot";
// import { renderToPipeableStream } from "react-dom/server";

// const ABORT_DELAY = 5000;

// export default function handleRequest(
//   request: Request,
//   responseStatusCode: number,
//   responseHeaders: Headers,
//   remixContext: EntryContext
// ) {
//   return isbot(request.headers.get("user-agent"))
//     ? handleBotRequest(
//         request,
//         responseStatusCode,
//         responseHeaders,
//         remixContext
//       )
//     : handleBrowserRequest(
//         request,
//         responseStatusCode,
//         responseHeaders,
//         remixContext
//       );
// }

// function handleBotRequest(
//   request: Request,
//   responseStatusCode: number,
//   responseHeaders: Headers,
//   remixContext: EntryContext
// ) {
//   return new Promise((resolve, reject) => {
//     let didError = false;

//     const { pipe, abort } = renderToPipeableStream(
//       <RemixServer context={remixContext} url={request.url} />,
//       {
//         onAllReady() {
//           const body = new PassThrough();

//           responseHeaders.set("Content-Type", "text/html");

//           resolve(
//             new Response(body, {
//               headers: responseHeaders,
//               status: didError ? 500 : responseStatusCode,
//             })
//           );

//           pipe(body);
//         },
//         onShellError(error: unknown) {
//           reject(error);
//         },
//         onError(error: unknown) {
//           didError = true;

//           console.error(error);
//         },
//       }
//     );

//     setTimeout(abort, ABORT_DELAY);
//   });
// }

// function handleBrowserRequest(
//   request: Request,
//   responseStatusCode: number,
//   responseHeaders: Headers,
//   remixContext: EntryContext
// ) {
//   return new Promise((resolve, reject) => {
//     let didError = false;

//     const { pipe, abort } = renderToPipeableStream(
//       <RemixServer context={remixContext} url={request.url} />,
//       {
//         onShellReady() {
//           const body = new PassThrough();

//           responseHeaders.set("Content-Type", "text/html");

//           resolve(
//             new Response(body, {
//               headers: responseHeaders,
//               status: didError ? 500 : responseStatusCode,
//             })
//           );

//           pipe(body);
//         },
//         onShellError(err: unknown) {
//           reject(err);
//         },
//         onError(error: unknown) {
//           didError = true;

//           console.error(error);
//         },
//       }
//     );

//     setTimeout(abort, ABORT_DELAY);
//   });
// }

import { renderToPipeableStream, renderToString } from 'react-dom/server'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import { RemixServer } from '@remix-run/react'
import isbot from "isbot";
import { PassThrough } from "stream";
import type { EntryContext } from '@remix-run/node' // Depends on the runtime you choose

import { ServerStyleContext } from './context'
import createEmotionCache from './createEmotionCache'

const ABORT_DELAY = 5000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return isbot(request.headers.get("user-agent"))
    ? handleBotRequest(
      request,
      responseStatusCode,
      responseHeaders,
      remixContext
    )
    : handleBrowserRequest(
      request,
      responseStatusCode,
      responseHeaders,
      remixContext
    );
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let didError = false;

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

    const { pipe, abort } = renderToPipeableStream(
      markup
      ,
      {
        onShellReady() {
          const body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(`<!DOCTYPE html>${markup}`, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(err: unknown) {
          reject(err);
        },
        onError(error: unknown) {
          didError = true;

          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onAllReady() {
          const body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(null, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          didError = true;

          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}