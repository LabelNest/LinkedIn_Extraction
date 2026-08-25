import {
  EnrichmentApiResponse,
  EnrichmentResultItem,
  HistoryRecord
} from '../types';

export const DEFAULT_API_BASE_URL =
  'http://127.0.0.1:8000';

export const STORAGE_KEY_API_URL =
  'labelnest_api_base_url';

export const STORAGE_KEY_LOCAL_HISTORY =
  'labelnest_local_history_v1';


// ============================================================
// API BASE URL
// ============================================================

export function getApiBaseUrl(): string {

  if (typeof window !== 'undefined') {

    const saved =
      localStorage.getItem(
        STORAGE_KEY_API_URL
      );

    if (saved) {
      return saved.trim();
    }
  }

  return DEFAULT_API_BASE_URL;
}


export function setApiBaseUrl(
  url: string
): void {

  if (typeof window !== 'undefined') {

    localStorage.setItem(
      STORAGE_KEY_API_URL,
      url.trim()
    );
  }
}


export function resetApiBaseUrl(): string {

  if (typeof window !== 'undefined') {

    localStorage.removeItem(
      STORAGE_KEY_API_URL
    );
  }

  return DEFAULT_API_BASE_URL;
}


// ============================================================
// LOCAL HISTORY
// ============================================================

export function getLocalHistory(): HistoryRecord[] {

  if (typeof window === 'undefined') {
    return [];
  }

  try {

    const data =
      localStorage.getItem(
        STORAGE_KEY_LOCAL_HISTORY
      );

    return data
      ? JSON.parse(data)
      : [];

  } catch (e) {

    console.error(
      'Failed to parse local history:',
      e
    );

    return [];
  }
}


export function saveToLocalHistory(

  url: string,

  result: EnrichmentResultItem

): void {

  if (typeof window === 'undefined') {
    return;
  }

  try {

    const current =
      getLocalHistory();


    const targetName =

      result.data?.person?.full_name ||

      result.data?.person?.name ||

      result.data?.company?.name ||

      result.data?.company?.company_name ||

      url;


    const newRecord: HistoryRecord = {

      id:
        `hist_${Date.now()}_` +
        Math.random()
          .toString(36)
          .substring(2, 7),

      timestamp:
        Date.now(),

      url:
        url,

      type:
        result.type ||
        (
          result.data?.company
            ? 'company'
            : 'person'
        ),

      status:
        result.status ||
        'success',

      targetName:
        targetName,

      response:
        result
    };


    const filtered =
      current.filter(

        item =>

          item.url.toLowerCase() !==
          url.toLowerCase()

      );


    const updated =
      [newRecord, ...filtered]
        .slice(0, 30);


    localStorage.setItem(

      STORAGE_KEY_LOCAL_HISTORY,

      JSON.stringify(updated)

    );

  } catch (e) {

    console.error(
      'Failed to save local history:',
      e
    );
  }
}


export function clearLocalHistory(): void {

  if (typeof window !== 'undefined') {

    localStorage.removeItem(
      STORAGE_KEY_LOCAL_HISTORY
    );
  }
}


// ============================================================
// BACKEND HEALTH CHECK
// ============================================================

export async function checkBackendHealth(

  customBaseUrl?: string

): Promise<{

  connected: boolean;

  message?: string;

}> {

  const baseUrl =
    customBaseUrl ||
    getApiBaseUrl();


  const controller =
    new AbortController();


  const timeoutId =
    setTimeout(

      () =>
        controller.abort(),

      4000

    );


  try {

    const response =
      await fetch(

        `${baseUrl}/`,

        {

          method:
            'GET',

          signal:
            controller.signal,

          headers: {

            'Accept':
              'application/json, text/plain, */*'

          }

        }

      );


    clearTimeout(
      timeoutId
    );


    if (

      response.ok ||

      response.status === 404 ||

      response.status === 405

    ) {

      return {

        connected:
          true,

        message:
          'Backend reachable'

      };

    }


    return {

      connected:
        true,

      message:
        `Status: ${response.status}`

    };


  } catch (err: any) {

    clearTimeout(
      timeoutId
    );


    return {

      connected:
        false,

      message:

        err.name === 'AbortError'

          ? 'Health check timed out'

          : 'Backend unreachable'

    };

  }

}


// ============================================================
// START ENRICHMENT
//
// Creates request ID BEFORE long-running enrichment starts.
//
// Flow:
//
// Frontend
//    ↓
// /api/enrich/start
//    ↓
// request_id
//    ↓
// /api/enrich
// ============================================================

export async function startEnrichment(

  customBaseUrl?: string

): Promise<{

  status: string;

  request_id: string;

}> {

  const baseUrl =

    (

      customBaseUrl ||

      getApiBaseUrl()

    ).replace(/\/+$/, '');


  const endpoint =
    `${baseUrl}/api/enrich/start`;


  try {

    const response =
      await fetch(

        endpoint,

        {

          method:
            'POST',

          headers: {

            'Accept':
              'application/json'

          }

        }

      );


    const responseText =
      await response.text();


    let data: any = null;


    try {

      data =
        responseText
          ? JSON.parse(responseText)
          : null;

    } catch {

      throw new Error(

        `Invalid JSON response received from backend ` +
        `(HTTP ${response.status}).`

      );

    }


    if (!response.ok) {

      throw new Error(

        data?.detail ||

        data?.error ||

        data?.message ||

        `Unable to start enrichment ` +
        `(HTTP ${response.status}).`

      );

    }


    if (!data?.request_id) {

      throw new Error(

        'Backend did not return a request_id.'

      );

    }


    return data;


  } catch (err: any) {

    if (

      err.message &&

      err.message.includes(
        'Failed to fetch'
      )

    ) {

      throw new Error(

        'Unable to reach the backend while ' +
        'starting enrichment.'

      );

    }


    throw err;
  }
}


// ============================================================
// ENRICH LINKEDIN
//
// NOW SUPPORTS MULTIPLE URLS.
//
// Example:
//
// urls = [
//   "https://www.linkedin.com/in/person1",
//   "https://www.linkedin.com/in/person2",
//   "https://www.linkedin.com/company/company1"
// ]
//
// Backend receives:
//
// {
//   "urls": [...],
//   "request_id": "..."
// }
// ============================================================

export async function enrichLinkedIn(

  urls: string[],

  signal?: AbortSignal,

  customBaseUrl?: string,

  requestId?: string

): Promise<EnrichmentApiResponse> {


  const baseUrl =

    (

      customBaseUrl ||

      getApiBaseUrl()

    ).replace(/\/+$/, '');


  const endpoint =
    `${baseUrl}/api/enrich`;


  // ============================================================
  // CLEAN URLS
  // ============================================================

  const cleanedUrls =

    urls

      .map(
        url => url.trim()
      )

      .filter(
        url => url.length > 0
      );


  // ============================================================
  // VALIDATE
  // ============================================================

  if (
    cleanedUrls.length === 0
  ) {

    throw new Error(
      'Please provide at least one LinkedIn URL.'
    );

  }


  console.log(
    `🚀 Sending ${cleanedUrls.length} LinkedIn URLs to backend`
  );


  try {

    // ==========================================================
    // SEND REQUEST
    // ==========================================================

    const response =
      await fetch(

        endpoint,

        {

          method:
            'POST',

          headers: {

            'Content-Type':
              'application/json',

            'Accept':
              'application/json'

          },

          body:

            JSON.stringify({

              // ==================================================
              // ALL URLS
              // ==================================================

              urls:
                cleanedUrls,


              // ==================================================
              // REQUEST ID
              // ==================================================

              request_id:
                requestId || undefined

            }),

          signal:
            signal

        }

      );


    // ==========================================================
    // READ RESPONSE
    // ==========================================================

    const responseText =
      await response.text();


    let data: any;


    try {

      data =
        responseText
          ? JSON.parse(responseText)
          : null;

    } catch {

      throw new Error(

        `Invalid JSON response received from backend ` +
        `(HTTP ${response.status}).`

      );

    }


    // ==========================================================
    // BACKEND ERROR
    // ==========================================================

    if (!response.ok) {

      const errorMsg =

        data?.detail ||

        data?.error ||

        data?.message ||

        `The enrichment service returned an error ` +
        `(HTTP ${response.status}).`;


      throw new Error(
        errorMsg
      );

    }


    // ==========================================================
    // SAVE ALL RESULTS TO LOCAL HISTORY
    // ==========================================================

    if (

      data?.results &&

      Array.isArray(
        data.results
      )

    ) {

      data.results.forEach(

        (
          result: EnrichmentResultItem,
          index: number
        ) => {

          if (!result) {
            return;
          }


          // Try to match result with
          // original URL by index.

          const originalUrl =

            cleanedUrls[index] ||

            (result as any).url ||

            '';


          if (originalUrl) {

            saveToLocalHistory(

              originalUrl,

              result

            );

          }

        }

      );

    }


    // ==========================================================
    // RETURN RESPONSE
    // ==========================================================

    return data as EnrichmentApiResponse;


  } catch (err: any) {

    // ==========================================================
    // FRONTEND REQUEST ABORTED
    // ==========================================================

    if (

      err.name === 'AbortError' ||

      signal?.aborted

    ) {

      const abortErr =
        new Error(
          'Enrichment stopped.'
        );


      abortErr.name =
        'AbortError';


      throw abortErr;

    }


    // ==========================================================
    // BACKEND UNREACHABLE
    // ==========================================================

    if (

      err.message &&

      err.message.includes(
        'Failed to fetch'
      )

    ) {

      throw new Error(

        `Unable to reach the LabelNest backend at ${baseUrl}. ` +

        `Ensure your FastAPI backend is running on ` +

        `http://127.0.0.1:8000 and CORS is enabled.`

      );

    }


    throw err;

  }

}


// ============================================================
// STOP ENRICHMENT
//
// Sends:
//
// POST /api/enrich/stop/{request_id}
//
// This tells the backend to cancel the active request.
// ============================================================

export async function stopEnrichment(

  requestId: string,

  customBaseUrl?: string

): Promise<any> {


  if (!requestId) {

    throw new Error(

      'No active enrichment request found.'

    );

  }


  const baseUrl =

    (

      customBaseUrl ||

      getApiBaseUrl()

    ).replace(/\/+$/, '');


  const endpoint =

    `${baseUrl}/api/enrich/stop/` +

    `${encodeURIComponent(requestId)}`;


  try {

    const response =
      await fetch(

        endpoint,

        {

          method:
            'POST',

          headers: {

            'Accept':
              'application/json'

          }

        }

      );


    const responseText =
      await response.text();


    let data: any = null;


    try {

      data =

        responseText

          ? JSON.parse(responseText)

          : null;

    } catch {

      data = null;

    }


    if (!response.ok) {

      throw new Error(

        data?.detail ||

        data?.error ||

        data?.message ||

        `Unable to stop enrichment ` +
        `(HTTP ${response.status}).`

      );

    }


    return data;


  } catch (err: any) {

    if (

      err.message &&

      err.message.includes(
        'Failed to fetch'
      )

    ) {

      throw new Error(

        'Unable to reach the backend while ' +
        'stopping enrichment.'

      );

    }


    throw err;

  }

}


// ============================================================
// HISTORY
// ============================================================

export async function getHistory(

  signal?: AbortSignal,

  customBaseUrl?: string

): Promise<{

  source:
    'backend' | 'local';

  items:
    any[];

}> {


  const baseUrl =

    (

      customBaseUrl ||

      getApiBaseUrl()

    ).replace(/\/+$/, '');


  const endpoint =
    `${baseUrl}/api/history`;


  try {

    const response =
      await fetch(

        endpoint,

        {

          method:
            'GET',

          headers: {

            'Accept':
              'application/json'

          },

          signal:
            signal

        }

      );


    if (response.ok) {

      const data =
        await response.json();


      const items =

        Array.isArray(data)

          ? data

          : data?.results ||

            data?.history ||

            [];


      return {

        source:
          'backend',

        items:
          items

      };

    }


  } catch {

    // Backend history endpoint
    // not available yet.
    // Fall back to local history.

  }


  return {

    source:
      'local',

    items:
      getLocalHistory()

  };

}


// ============================================================
// API SERVICE
// ============================================================

export const apiService = {

  enrichLinkedIn,

  startEnrichment,

  stopEnrichment,

  getHistory,

  checkBackendHealth,

  getApiBaseUrl,

  setApiBaseUrl,

  resetApiBaseUrl,

  getLocalHistory,

  saveToLocalHistory,

  clearLocalHistory

};