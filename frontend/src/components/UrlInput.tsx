import React, {
  useEffect,
  useRef
} from 'react';

import {
  Search,
  Sparkles,
  RotateCcw,
  History,
  Link as LinkIcon,
  Clipboard,
  Building2,
  User,
  Square,
  X
} from 'lucide-react';


interface UrlInputProps {

  /*
   * IMPORTANT
   *
   * We keep url as a STRING so your existing App.tsx
   * does not need to be completely rewritten.
   *
   * Internally the URLs are stored like:
   *
   * URL 1
   * URL 2
   * URL 3
   *
   * separated by \n
   */

  url: string;

  setUrl: (url: string) => void;

  onEnrich: () => void;

  onStop: () => void;

  onClear: () => void;

  onOpenHistory: () => void;

  loading: boolean;
}


/* ============================================================
   LINKEDIN URL REGEX
   ============================================================

   Supports:

   https://www.linkedin.com/in/...
   https://linkedin.com/in/...
   http://www.linkedin.com/in/...
   http://linkedin.com/in/...

   www.linkedin.com/in/...
   linkedin.com/in/...

   Also:

   /company/
   /school/

   ============================================================ */

const LINKEDIN_URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company|school)\/[a-zA-Z0-9._%\-]+/gi;


/* ============================================================
   NORMALIZE LINKEDIN URL
   ============================================================

   Examples:

   www.linkedin.com/in/suhas
   ↓
   https://www.linkedin.com/in/suhas

   linkedin.com/in/suhas
   ↓
   https://linkedin.com/in/suhas

   https://www.linkedin.com/in/suhas
   ↓
   https://www.linkedin.com/in/suhas

   ============================================================ */

const normalizeLinkedInUrl = (
  value: string
): string => {

  let normalized =
    value.trim();


  /*
   * Remove punctuation accidentally
   * copied along with URL.
   *
   * Example:
   *
   * linkedin.com/in/suhas,
   *
   * becomes:
   *
   * linkedin.com/in/suhas
   */

  normalized =
    normalized.replace(
      /[),.;!?]+$/g,
      ''
    );


  /*
   * Remove trailing slash.
   */

  normalized =
    normalized.replace(
      /\/+$/,
      ''
    );


  /*
   * Add HTTPS if protocol is missing.
   */

  if (
    !/^https?:\/\//i.test(
      normalized
    )
  ) {

    normalized =
      `https://${normalized}`;

  }


  return normalized;

};


/* ============================================================
   EXTRACT LINKEDIN URLS
   ============================================================

   Supports:

   1. New lines

      URL1
      URL2

   2. Spaces

      URL1 URL2 URL3

   3. Commas

      URL1, URL2, URL3

   4. Tabs

      URL1    URL2

   5. Mixed formats

      URL1
      URL2 URL3, URL4

   6. 100+ URLs

   7. Duplicate removal

   ============================================================ */

const extractLinkedInUrls = (
  text: string
): string[] => {

  if (
    !text.trim()
  ) {

    return [];

  }


  /*
   * IMPORTANT:
   *
   * Regex uses /g, therefore reset
   * lastIndex before matching.
   */

  LINKEDIN_URL_REGEX.lastIndex = 0;


  const matches =
    text.match(
      LINKEDIN_URL_REGEX
    );


  if (
    !matches
  ) {

    return [];

  }


  /*
   * Normalize every URL.
   */

  const cleanedUrls =
    matches.map(
      item =>

        normalizeLinkedInUrl(
          item
        )

    );


  /*
   * Remove duplicates while
   * preserving original order.
   */

  return [
    ...new Set(
      cleanedUrls
    )
  ];

};


/* ============================================================
   URL VALIDATION
   ============================================================ */

const isValidLinkedInUrl = (
  value: string
): boolean => {

  LINKEDIN_URL_REGEX.lastIndex = 0;

  return LINKEDIN_URL_REGEX.test(
    value.trim()
  );

};


export const UrlInput: React.FC<UrlInputProps> = ({

  url,

  setUrl,

  onEnrich,

  onStop,

  onClear,

  onOpenHistory,

  loading

}) => {


  /* ==========================================================
     INPUT REFERENCES
     ========================================================== */

  const inputRefs =
    useRef<
      (HTMLInputElement | null)[]
    >([]);


  /* ==========================================================
     CONVERT CURRENT STRING TO ARRAY
     ========================================================== */

  const getStoredUrls = (): string[] => {

    return url

      .split(/\r?\n/)

      .map(
        item =>
          item.trim()
      )

      .filter(
        item =>
          item.length > 0
      );

  };


  /* ==========================================================
     DISPLAY URLS
     ========================================================== */

  const storedUrls =
    getStoredUrls();


  /*
   * Always display at least
   * one input.
   */

  const displayUrls =
    storedUrls.length > 0
      ? storedUrls
      : [''];


  /* ==========================================================
     URL COUNT
     ========================================================== */

  const urlCount =
    storedUrls.length;


  /* ==========================================================
     COMPANY DETECTION
     ========================================================== */

  const hasCompany =
    storedUrls.some(
      item => {

        const lower =
          item.toLowerCase();

        return (

          lower.includes(
            '/company/'
          ) ||

          lower.includes(
            '/school/'
          )

        );

      }
    );


  /* ==========================================================
     PERSON DETECTION
     ========================================================== */

  const hasPerson =
    storedUrls.some(
      item =>

        item
          .toLowerCase()
          .includes('/in/')

    );


  /* ==========================================================
     UPDATE URL
     ========================================================== */

  const updateUrl = (

    index: number,

    value: string

  ) => {

    /*
     * Current displayed inputs.
     */

    const current =
      [...displayUrls];


    current[index] =
      value;


    /*
     * Detect whether user pasted
     * multiple LinkedIn URLs into
     * one input.
     */

    const extracted =
      extractLinkedInUrls(
        value
      );


    /*
     * If multiple URLs were detected,
     * split them into separate inputs.
     */

    if (
      extracted.length > 1
    ) {

      /*
       * Keep URLs before current input.
       */

      const before =
        current
          .slice(
            0,
            index
          )
          .filter(
            item =>
              item.trim().length > 0
          );


      /*
       * Keep URLs after current input.
       */

      const after =
        current
          .slice(
            index + 1
          )
          .filter(
            item =>
              item.trim().length > 0
          );


      /*
       * Combine everything.
       */

      const combined = [

        ...before,

        ...extracted,

        ...after

      ];


      /*
       * Remove duplicates.
       */

      const unique = [
        ...new Set(
          combined
        )
      ];


      /*
       * Keep an empty input
       * at the bottom.
       */

      unique.push('');


      setUrl(
        unique.join('\n')
      );


      /*
       * Focus empty input.
       */

      setTimeout(() => {

        inputRefs.current[
          unique.length - 1
        ]?.focus();

      }, 0);


      return;

    }


    /*
     * Single URL / normal typing.
     */

    setUrl(
      current.join('\n')
    );

  };


  /* ==========================================================
     ADD NEW INPUT
     ========================================================== */

  const addNewInput = (
    index: number
  ) => {

    const current =
      [...displayUrls];


    /*
     * Only add a field when
     * Enter is pressed on last field.
     */

    if (
      index !==
      current.length - 1
    ) {

      return;

    }


    /*
     * Do not add if empty.
     */

    if (
      !current[index]?.trim()
    ) {

      return;

    }


    /*
     * Normalize URL before
     * storing it.
     */

    current[index] =
      normalizeLinkedInUrl(
        current[index]
      );


    /*
     * Add empty field.
     */

    current.push('');


    setUrl(
      current.join('\n')
    );


    /*
     * Focus newly created field.
     */

    setTimeout(() => {

      inputRefs.current[
        index + 1
      ]?.focus();

    }, 0);

  };


  /* ==========================================================
     REMOVE URL
     ========================================================== */

  const removeUrl = (
    index: number
  ) => {

    const current =
      [...displayUrls];


    /*
     * Remove selected URL.
     */

    current.splice(
      index,
      1
    );


    /*
     * Always keep one input.
     */

    if (
      current.length === 0
    ) {

      current.push('');

    }


    /*
     * If last input contains URL,
     * add an empty input.
     */

    if (

      current[
        current.length - 1
      ].trim() !== ''

    ) {

      current.push('');

    }


    setUrl(
      current.join('\n')
    );


    /*
     * Focus nearest available input.
     */

    setTimeout(() => {

      const focusIndex =
        Math.min(
          index,
          current.length - 1
        );


      inputRefs.current[
        focusIndex
      ]?.focus();

    }, 0);

  };


  /* ==========================================================
     KEYBOARD HANDLER
     ========================================================== */

  const handleKeyDown = (

    e: React.KeyboardEvent<HTMLInputElement>,

    index: number

  ) => {


    /* ========================================================
       CTRL + ENTER
       ======================================================== */

    if (

      (e.ctrlKey ||
       e.metaKey) &&

      e.key === 'Enter'

    ) {

      e.preventDefault();


      if (
        !loading &&
        urlCount > 0
      ) {

        onEnrich();

      }


      return;

    }


    /* ========================================================
       NORMAL ENTER
       ======================================================== */

    if (

      e.key === 'Enter' &&

      !loading

    ) {

      e.preventDefault();


      const value =
        displayUrls[index]?.trim();


      /*
       * Don't create next field
       * if empty.
       */

      if (
        !value
      ) {

        return;

      }


      /*
       * Normalize first.
       *
       * This allows:
       *
       * www.linkedin.com/...
       *
       * linkedin.com/...
       */

      const normalized =
        normalizeLinkedInUrl(
          value
        );


      /*
       * Validate normalized URL.
       */

      if (
        isValidLinkedInUrl(
          normalized
        )
      ) {

        const current =
          [...displayUrls];


        current[index] =
          normalized;


        /*
         * Add next input.
         */

        if (
          index ===
          current.length - 1
        ) {

          current.push('');

        }


        setUrl(
          current.join('\n')
        );


        /*
         * Focus next input.
         */

        setTimeout(() => {

          inputRefs.current[
            index + 1
          ]?.focus();

        }, 0);

      }

    }

  };


  /* ==========================================================
     HANDLE PASTE
     ==========================================================

     User can paste:

     URL1

     OR

     URL1 URL2 URL3

     OR

     URL1, URL2, URL3

     OR

     100 URLs from Excel

     OR

     100 URLs from browser

     Everything is extracted.
     ========================================================== */

  const handlePaste = async (
    index: number =
      displayUrls.length - 1
  ) => {

    try {

      const clipboardText =
        await navigator.clipboard.readText();


      if (
        !clipboardText.trim()
      ) {

        return;

      }


      /*
       * Extract ALL LinkedIn URLs.
       */

      const extracted =
        extractLinkedInUrls(
          clipboardText
        );


      /*
       * No LinkedIn URL found.
       */

      if (
        extracted.length === 0
      ) {

        updateUrl(
          index,
          clipboardText.trim()
        );


        return;

      }


      /*
       * Existing URLs before
       * current input.
       */

      const before =
        displayUrls

          .slice(
            0,
            index
          )

          .filter(
            item =>
              item.trim()
                .length > 0
          )

          .map(
            item =>
              normalizeLinkedInUrl(
                item
              )
          );


      /*
       * Existing URLs after
       * current input.
       */

      const after =
        displayUrls

          .slice(
            index + 1
          )

          .filter(
            item =>
              item.trim()
                .length > 0
          )

          .map(
            item =>
              normalizeLinkedInUrl(
                item
              )
          );


      /*
       * Combine all URLs.
       */

      const combined = [

        ...before,

        ...extracted,

        ...after

      ];


      /*
       * Remove duplicates.
       */

      const uniqueUrls = [
        ...new Set(
          combined
        )
      ];


      /*
       * Add final empty input.
       */

      uniqueUrls.push('');


      /*
       * Save.
       */

      setUrl(
        uniqueUrls.join('\n')
      );


      /*
       * Focus empty field.
       */

      setTimeout(() => {

        inputRefs.current[
          uniqueUrls.length - 1
        ]?.focus();

      }, 0);

    }

    catch (error) {

      console.error(
        'Unable to read clipboard:',
        error
      );

    }

  };


  /* ==========================================================
     PERSON SAMPLE
     ========================================================== */

  const handlePersonSample =
    () => {

      if (
        loading
      ) {

        return;

      }


      setUrl(

        'https://www.linkedin.com/in/satyanadella\n'

      );


      setTimeout(() => {

        inputRefs.current[0]?.focus();

      }, 0);

    };


  /* ==========================================================
     COMPANY SAMPLE
     ========================================================== */

  const handleCompanySample =
    () => {

      if (
        loading
      ) {

        return;

      }


      setUrl(

        'https://www.linkedin.com/company/microsoft\n'

      );


      setTimeout(() => {

        inputRefs.current[0]?.focus();

      }, 0);

    };


  /* ==========================================================
     AUTO FOCUS
     ========================================================== */

  useEffect(() => {

    if (

      displayUrls.length === 1 &&

      displayUrls[0] === '' &&

      !loading

    ) {

      inputRefs.current[0]?.focus();

    }

  }, []);


  /* ==========================================================
     UI
     ========================================================== */

  return (

    <div className="w-full max-w-3xl mx-auto px-4 mt-2 mb-6">


      {/* ======================================================
          CARD
          ====================================================== */}

      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-2xl shadow-2xl relative overflow-hidden group">


        {/* ====================================================
            GLOW
            ==================================================== */}

        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />


        <div className="relative z-10 space-y-4">


          {/* ==================================================
              HEADER
              ================================================== */}

          <div className="flex items-center justify-between gap-3">


            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">

              <LinkIcon className="w-3.5 h-3.5 text-blue-400" />

              <span>
                LinkedIn URLs
              </span>

            </label>


            {/* =================================================
                URL COUNT
                ================================================= */}

            {urlCount > 0 && (

              <div className="flex items-center gap-2">


                <div className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-400 font-semibold">

                  {urlCount}

                  {' '}

                  URL{urlCount !== 1 ? 's' : ''}

                </div>


                {hasCompany && (

                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-400">

                    <Building2 className="w-3 h-3" />

                    <span>
                      Company
                    </span>

                  </div>

                )}


                {hasPerson && (

                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-400">

                    <User className="w-3 h-3" />

                    <span>
                      Profile
                    </span>

                  </div>

                )}

              </div>

            )}

          </div>


          {/* ==================================================
              URL INPUT AREA
              ================================================== */}

          <div className="relative bg-slate-950/50 border border-white/10 rounded-xl focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/40 transition-all overflow-hidden">


            {/* =================================================
                URL LIST
                ================================================= */}

            <div className="max-h-[360px] overflow-y-auto">


              {displayUrls.map(

                (
                  currentUrl,
                  index
                ) => (

                  <div

                    key={index}

                    className={

                      `relative flex items-center ${
                        index > 0
                          ? 'border-t border-white/5'
                          : ''
                      }`

                    }

                  >


                    {/* =========================================
                        SEARCH ICON
                        ========================================= */}

                    <div className="pl-4 text-slate-500 pointer-events-none flex-shrink-0">

                      <Search className="w-5 h-5" />

                    </div>


                    {/* =========================================
                        INPUT
                        =========================================

                        IMPORTANT:
                        type="text" instead of type="url".

                        This allows:

                        www.linkedin.com/...
                        linkedin.com/...

                        without browser URL validation
                        interfering.

                        Our own validation handles LinkedIn.
                        ========================================= */}

                    <input

                      ref={(
                        element
                      ) => {

                        inputRefs.current[
                          index
                        ] = element;

                      }}

                      type="text"

                      value={
                        currentUrl
                      }

                      onChange={(
                        e
                      ) => {

                        updateUrl(

                          index,

                          e.target.value

                        );

                      }}

                      onKeyDown={(
                        e
                      ) => {

                        handleKeyDown(

                          e,

                          index

                        );

                      }}

                      disabled={
                        loading
                      }

                      autoComplete="off"

                      placeholder={

                        index === 0

                          ? 'Paste LinkedIn URL...'

                          : 'Enter another LinkedIn URL...'

                      }

                      className="w-full bg-transparent border-none text-white placeholder-slate-500 py-3.5 pl-3 pr-12 text-sm focus:ring-0 focus:outline-none"

                    />


                    {/* =========================================
                        REMOVE
                        ========================================= */}

                    {currentUrl &&
                      !loading && (

                        <button

                          type="button"

                          onClick={() =>

                            removeUrl(
                              index
                            )

                          }

                          title="Remove URL"

                          className="absolute right-3 p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors"

                        >

                          <X className="w-4 h-4" />

                        </button>

                      )}

                  </div>

                )

              )}

            </div>


            {/* =================================================
                PASTE BUTTON
                ================================================= */}

            {!loading && (

              <button

                type="button"

                onClick={() =>

                  handlePaste(
                    displayUrls.length - 1
                  )

                }

                title="Paste one or multiple LinkedIn URLs"

                className="absolute right-3 top-3 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors flex items-center gap-1"

              >

                <Clipboard className="w-3 h-3" />

                <span className="hidden sm:inline">
                  Paste
                </span>

              </button>

            )}

          </div>


          {/* ==================================================
              HELPER TEXT
              ================================================== */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">


            <div className="text-[11px] text-slate-500">

              Press

              {' '}

              <span className="text-slate-400 font-medium">
                Enter
              </span>

              {' '}

              to add another URL.

              <span className="text-slate-600">
                {' '}•{' '}
              </span>

              Paste multiple URLs at once.

              <span className="text-slate-600">
                {' '}•{' '}
              </span>

              Supports 100+ URLs.

            </div>


            <div className="text-[11px] text-slate-500 font-mono">

              {urlCount > 0

                ? `${urlCount} URL${urlCount !== 1 ? 's' : ''} added`

                : 'No URLs added'

              }

            </div>

          </div>


          {/* ==================================================
              SAMPLES
              ================================================== */}

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">


            <span className="text-[11px] text-slate-400 font-medium">
              Try sample:
            </span>


            <button

              type="button"

              onClick={
                handlePersonSample
              }

              disabled={
                loading
              }

              className="px-2 py-0.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 font-mono text-[11px] transition-colors border border-blue-500/20 disabled:opacity-50"

            >

              in/satyanadella

            </button>


            <span className="text-slate-600">
              •
            </span>


            <button

              type="button"

              onClick={
                handleCompanySample
              }

              disabled={
                loading
              }

              className="px-2 py-0.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 font-mono text-[11px] transition-colors border border-indigo-500/20 disabled:opacity-50"

            >

              company/microsoft

            </button>

          </div>


          {/* ==================================================
              ACTION BUTTONS
              ================================================== */}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 border-t border-white/5">


            {/* =================================================
                ENRICH
                ================================================= */}

            <button

              id="enrich-profile-btn"

              type="button"

              onClick={
                onEnrich
              }

              disabled={

                loading ||

                urlCount === 0

              }

              className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all ${

                loading ||
                urlCount === 0

                  ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-white/5'

                  : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-[0.98]'

              }`}

            >

              {loading ? (

                <>

                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                  <span>

                    Enriching {urlCount} URL{urlCount !== 1 ? 's' : ''}...

                  </span>

                </>

              ) : (

                <>

                  <Sparkles className="w-4 h-4 text-blue-200" />

                  <span>
                    Enrich Profiles
                  </span>

                </>

              )}

            </button>


            {/* =================================================
                STOP
                ================================================= */}

            {loading && (

              <button

                id="stop-enrichment-btn"

                type="button"

                onClick={
                  onStop
                }

                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] ring-2 ring-rose-400/40 transition-all active:scale-[0.98] cursor-pointer animate-in fade-in zoom-in-95 duration-200"

                title="Stop active enrichment request"

              >

                <Square className="w-3.5 h-3.5 fill-current" />

                <span>
                  Stop Enrichment
                </span>

              </button>

            )}


            {/* =================================================
                CLEAR
                ================================================= */}

            <button

              id="clear-input-btn"

              type="button"

              onClick={
                onClear
              }

              className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 border border-white/5"

            >

              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />

              <span>
                Clear
              </span>

            </button>


            {/* =================================================
                HISTORY
                ================================================= */}

            <button

              id="view-history-btn"

              type="button"

              onClick={
                onOpenHistory
              }

              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-white/5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-all active:scale-[0.98]"

            >

              <History className="w-3.5 h-3.5 text-slate-400" />

              <span>
                View History
              </span>

            </button>

          </div>


          {/* ==================================================
              SHORTCUT
              ================================================== */}

          {!loading &&
            urlCount > 0 && (

              <div className="text-center text-[10px] text-slate-600">

                Press

                {' '}

                <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/5 text-slate-500 font-mono">

                  Ctrl + Enter

                </span>

                {' '}

                to start extraction.

              </div>

            )}

        </div>

      </div>

    </div>

  );

};