# Firebase Development Guardrails

These rules prevent common integration issues, memory crashes, and page-redirection race conditions when working with Firebase compat SDKs.

## Firestore Latency Compensation
When initiating critical Firestore mutations (like document deletion) on a page with a real-time listener (`onSnapshot`):
1. **Never redirect immediately** in `onSnapshot` if the document is deleted locally.
2. Use an `isDeleting` flag to bypass `onSnapshot` redirects during deletion.
3. Only trigger the redirect after the mutation promise resolves (`delete().then(...)`), ensuring the browser does not unload the page and abort the network request mid-flight.

## Optional Compat SDK Guarding
When initializing Firebase services globally:
1. Always check if the module function is defined before initializing:
   ```javascript
   const storage = (typeof firebase.storage === 'function') ? firebase.storage() : null;
   ```
2. Do not assume all compat modules (Storage, Messaging, Functions) are loaded on every HTML page.

## Firestore Security Rules & Global Impact
1. Never use JS keywords (`const`, `let`, `var`) inside Firestore helper functions in `.rules` files.
2. Use direct inline expressions or chain nested expressions.
3. Remember that rules compile on the server; compilation failures will block database writes globally across all client environments (CDN, Localhost, and `file:///`).

## Local File Protocol Testing (file:///)
1. Testing via `file:///` is valid for core Javascript and DB transaction tests, but watch out for false-positive warnings.
2. Chrome blocks CORS manifest loading on `file:///` by default. This is harmless to database operations.
3. Ensure runtime variables are fully guarded so JavaScript does not crash at startup under any protocol.
