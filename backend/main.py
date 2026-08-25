from typing import List, Optional
import threading
import uuid

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.linkedin import build_linkedin_identity

from services.mindcase import (
    start_profile_job,
    start_company_job,
    start_company_employees_job,
    poll_mindcase_job
)

from services.sarvam import sarvam_structure
from services.cleaner import clean_recursive
from services.database import (
    save_enrichment_to_database,
    save_employees_to_database
)


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="LabelNest LinkedIn Enrichment API",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class EnrichRequest(BaseModel):
    urls: List[str]

    # Frontend will send the request ID that it received
    # from /api/enrich/start
    request_id: Optional[str] = None


# ============================================================
# CANCELLATION STATE
# ============================================================

active_cancellations = {}

active_cancellations_lock = threading.Lock()


def create_cancellation_event(request_id: str):

    event = threading.Event()

    with active_cancellations_lock:

        active_cancellations[request_id] = event

    return event


def get_cancellation_event(request_id: str):

    with active_cancellations_lock:

        return active_cancellations.get(request_id)


def remove_cancellation_event(request_id: str):

    with active_cancellations_lock:

        active_cancellations.pop(request_id, None)


def is_request_cancelled(request_id: str) -> bool:

    event = get_cancellation_event(request_id)

    if event is None:

        return False

    return event.is_set()


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():

    return {
        "status": "running",
        "service": "LabelNest LinkedIn Enrichment API"
    }


# ============================================================
# START ENRICHMENT
#
# IMPORTANT:
# This endpoint creates the request ID BEFORE the long
# enrichment process starts.
# ============================================================

@app.post("/api/enrich/start")
def start_enrichment():

    request_id = str(uuid.uuid4())

    create_cancellation_event(
        request_id
    )

    print(
        "\n" + "=" * 80
    )

    print(
        "🚀 ENRICHMENT REQUEST CREATED"
    )

    print(
        "Request ID:",
        request_id
    )

    print(
        "=" * 80
    )

    return {

        "status": "started",

        "request_id": request_id

    }


# ============================================================
# STOP ENRICHMENT
# ============================================================

@app.post("/api/enrich/stop/{request_id}")
def stop_enrichment(request_id: str):

    event = get_cancellation_event(
        request_id
    )

    if event is None:

        return {

            "status": "not_found",

            "message":
                "No active enrichment request found."

        }

    event.set()

    print(
        "\n🛑 STOP REQUEST RECEIVED"
    )

    print(
        "Request ID:",
        request_id
    )

    return {

        "status": "cancelled",

        "request_id":
            request_id,

        "message":
            "Enrichment cancellation requested."

    }


# ============================================================
# ENRICH LINKEDIN DATA
# ============================================================

@app.post("/api/enrich")
def enrich(request: EnrichRequest):

    results = []

    if not request.urls:

        raise HTTPException(
            status_code=400,
            detail="No LinkedIn URLs provided"
        )


    # ========================================================
    # REQUEST ID
    # ========================================================

    # Use the request ID created by /api/enrich/start.
    #
    # Fallback:
    # If somebody directly calls /api/enrich without a request
    # ID, create one here so the API still works.

    request_id = (
        request.request_id
        or str(uuid.uuid4())
    )


    # ========================================================
    # GET / CREATE CANCELLATION EVENT
    # ========================================================

    cancellation_event = get_cancellation_event(
        request_id
    )


    if cancellation_event is None:

        cancellation_event = create_cancellation_event(
            request_id
        )


    print(
        "\n" + "=" * 80
    )

    print(
        "NEW ENRICHMENT REQUEST"
    )

    print(
        "Request ID:",
        request_id
    )

    print(
        "=" * 80
    )


    try:

        # ====================================================
        # PROCESS EACH URL
        # ====================================================

        for index, original_url in enumerate(
            request.urls,
            1
        ):

            # =================================================
            # CHECK STOP
            # =================================================

            if cancellation_event.is_set():

                print(
                    "🛑 Enrichment stopped before processing URL"
                )

                return {

                    "status":
                        "cancelled",

                    "request_id":
                        request_id,

                    "count":
                        len(results),

                    "results":
                        results

                }


            url = original_url.strip()


            print(
                "\n" + "=" * 80
            )

            print(
                f"PROCESSING {index}/{len(request.urls)}"
            )

            print(
                "URL:",
                url
            )

            print(
                "Request ID:",
                request_id
            )


            # ====================================================
            # LINKEDIN IDENTITY
            # ====================================================

            identity = build_linkedin_identity(
                url
            )


            # ====================================================
            # CHECK STOP
            # ====================================================

            if cancellation_event.is_set():

                print(
                    "🛑 Enrichment stopped after LinkedIn identity"
                )

                return {

                    "status":
                        "cancelled",

                    "request_id":
                        request_id,

                    "count":
                        len(results),

                    "results":
                        results

                }


            if not identity:

                print(
                    "❌ Invalid LinkedIn URL"
                )

                results.append({

                    "url":
                        url,

                    "status":
                        "failed",

                    "error":
                        "Invalid or unsupported LinkedIn URL"

                })

                continue


            canonical_url = identity[
                "canonical_url"
            ]

            entity_type = identity[
                "linkedin_entity_type"
            ]


            # ====================================================
            # DETERMINE TYPE
            # ====================================================

            if entity_type == "person":

                data_type = "person"

            elif entity_type == "firm":

                data_type = "company"

            else:

                results.append({

                    "url":
                        url,

                    "status":
                        "failed",

                    "error":
                        "Unsupported LinkedIn entity type"

                })

                continue


            print(
                "TYPE:",
                data_type
            )

            print(
                "CANONICAL URL:",
                canonical_url
            )


            # ====================================================
            # MINDCASE
            # ====================================================

            try:

                # ==============================================
                # CHECK STOP
                # ==============================================

                if cancellation_event.is_set():

                    print(
                        "🛑 Stopped before Mindcase"
                    )

                    return {

                        "status":
                            "cancelled",

                        "request_id":
                            request_id,

                        "count":
                            len(results),

                        "results":
                            results

                    }


                # ==============================================
                # PERSON
                # ==============================================

                if data_type == "person":

                    print(
                        "→ Starting Mindcase profile job"
                    )

                    job = start_profile_job(
                        canonical_url
                    )

                    agent = "linkedin/profiles"


                # ==============================================
                # COMPANY
                # ==============================================

                elif data_type == "company":

                    print(
                        "→ Starting Mindcase company job"
                    )

                    job = start_company_job(
                        canonical_url
                    )

                    agent = "linkedin/companies"


                # ==============================================
                # CHECK STOP
                # ==============================================

                if cancellation_event.is_set():

                    print(
                        "🛑 Stopped after Mindcase job creation"
                    )

                    return {

                        "status":
                            "cancelled",

                        "request_id":
                            request_id,

                        "count":
                            len(results),

                        "results":
                            results

                    }


                # ==============================================
                # CHECK JOB ID
                # ==============================================

                if not job.get("job_id"):

                    raise Exception(
                        "Mindcase did not return a job_id"
                    )


                job_id = job["job_id"]

                print(
                    "Mindcase Job ID:",
                    job_id
                )


                # ==============================================
                # POLL MINDCASE
                # ==============================================

                print(
                    "→ Waiting for Mindcase result..."
                )


                mindcase_result = poll_mindcase_job(

                    job_id,

                    is_cancelled=
                        cancellation_event.is_set

                )


                # ==============================================
                # CHECK CANCELLATION
                # ==============================================

                if (

                    cancellation_event.is_set()

                    or

                    mindcase_result.get(
                        "status"
                    ) == "cancelled"

                ):

                    print(
                        "🛑 Mindcase processing cancelled"
                    )

                    return {

                        "status":
                            "cancelled",

                        "request_id":
                            request_id,

                        "count":
                            len(results),

                        "results":
                            results

                    }


                # ==============================================
                # CHECK RESULT
                # ==============================================

                mindcase_data = (
                    mindcase_result.get(
                        "data",
                        []
                    )
                )


                if not mindcase_data:

                    print(
                        "⚠️ No data returned from Mindcase"
                    )

                    results.append({

                        "url":
                            url,

                        "canonical_url":
                            canonical_url,

                        "type":
                            data_type,

                        "status":
                            "no_data",

                        "data":
                            None

                    })

                    continue


                print(
                    "✅ Mindcase data received"
                )

                print(
                    "Rows:",
                    mindcase_result.get(
                        "row_count",
                        0
                    )
                )


                # ==============================================
                # CHECK STOP BEFORE SARVAM
                # ==============================================

                if cancellation_event.is_set():

                    print(
                        "🛑 Stopped before Sarvam"
                    )

                    return {

                        "status":
                            "cancelled",

                        "request_id":
                            request_id,

                        "count":
                            len(results),

                        "results":
                            results

                    }


                # ==============================================
                # SARVAM
                # ==============================================

                print(
                    "→ Sending Mindcase data to Sarvam"
                )


                structured = sarvam_structure(

                    data_type,

                    mindcase_data

                )


                # ==============================================
                # CHECK STOP AFTER SARVAM
                # ==============================================

                if cancellation_event.is_set():

                    print(
                        "🛑 Stopped after Sarvam"
                    )

                    return {

                        "status":
                            "cancelled",

                        "request_id":
                            request_id,

                        "count":
                            len(results),

                        "results":
                            results

                    }


                # ==============================================
                # SARVAM FAILED
                # ==============================================

                if structured is None:

                    print(
                        "❌ Sarvam returned no result"
                    )

                    results.append({

                        "url":
                            url,

                        "canonical_url":
                            canonical_url,

                        "type":
                            data_type,

                        "status":
                            "sarvam_failed",

                        "data":
                            None

                    })

                    continue


                # ==============================================
                # CLEAN DATA
                # ==============================================

                cleaned_data = clean_recursive(
                    structured
                )


                # ==============================================
                # CHECK STOP AFTER CLEANING
                # ==============================================

                if cancellation_event.is_set():

                    print(
                        "🛑 Stopped after cleaning"
                    )

                    return {

                        "status":
                            "cancelled",

                        "request_id":
                            request_id,

                        "count":
                            len(results),

                        "results":
                            results

                    }


                # ==============================================
                # FINAL MAIN DATA
                # ==============================================

                final_data = {

                    "company":
                        cleaned_data
                        if data_type == "company"
                        else None,

                    "person":
                        cleaned_data
                        if data_type == "person"
                        else None,

                    "employees":
                        None

                }


                # ==============================================
                # SAVE MAIN RESULT TO NEON
                # ==============================================

                try:

                    if cancellation_event.is_set():

                        print(
                            "🛑 Stopped before Neon save"
                        )

                        return {

                            "status":
                                "cancelled",

                            "request_id":
                                request_id,

                            "count":
                                len(results),

                            "results":
                                results

                        }


                    print(
                        "→ Saving result to Neon"
                    )


                    db_result = (
                        save_enrichment_to_database(

                            data_type=
                                data_type,

                            canonical_url=
                                canonical_url,

                            final_data=
                                final_data,

                            job_id=
                                job_id,

                            is_cancelled=
                                cancellation_event.is_set

                        )
                    )


                    print(
                        "✅ Result saved to Neon"
                    )


                except Exception as e:

                    print(
                        "⚠️ Neon database save failed:",
                        str(e)
                    )

                    db_result = {

                        "status":
                            "failed",

                        "error":
                            str(e)

                    }


                # =================================================
                # COMPANY → EMPLOYEES
                # =================================================

                employee_data = None

                employee_job_id = None


                if data_type == "company":

                    # =============================================
                    # CHECK STOP
                    # =============================================

                    if cancellation_event.is_set():

                        print(
                            "🛑 Stopped before employee processing"
                        )

                        return {

                            "status":
                                "cancelled",

                            "request_id":
                                request_id,

                            "count":
                                len(results),

                            "results":
                                results

                        }


                    print(
                        "\n→ Starting Mindcase company-employees job"
                    )


                    employee_job = (
                        start_company_employees_job(
                            canonical_url
                        )
                    )


                    # =============================================
                    # CHECK STOP
                    # =============================================

                    if cancellation_event.is_set():

                        print(
                            "🛑 Stopped after employee job creation"
                        )

                        return {

                            "status":
                                "cancelled",

                            "request_id":
                                request_id,

                            "count":
                                len(results),

                            "results":
                                results

                        }


                    if employee_job.get("job_id"):

                        employee_job_id = (
                            employee_job["job_id"]
                        )

                        print(
                            "Employee Job ID:",
                            employee_job_id
                        )


                        employee_result = (
                            poll_mindcase_job(

                                employee_job_id,

                                is_cancelled=
                                    cancellation_event.is_set

                            )
                        )


                        # =========================================
                        # CHECK CANCELLATION
                        # =========================================

                        if (

                            cancellation_event.is_set()

                            or

                            employee_result.get(
                                "status"
                            ) == "cancelled"

                        ):

                            print(
                                "🛑 Employee processing cancelled"
                            )

                            return {

                                "status":
                                    "cancelled",

                                "request_id":
                                    request_id,

                                "count":
                                    len(results),

                                "results":
                                    results

                            }


                        employee_raw_data = (
                            employee_result.get(
                                "data",
                                []
                            )
                        )


                        if employee_raw_data:

                            print(
                                "✅ Employee data received"
                            )

                            print(
                                "Employee Rows:",
                                employee_result.get(
                                    "row_count",
                                    0
                                )
                            )


                            # =====================================
                            # CHECK STOP BEFORE EMPLOYEE SARVAM
                            # =====================================

                            if cancellation_event.is_set():

                                print(
                                    "🛑 Stopped before employee Sarvam"
                                )

                                return {

                                    "status":
                                        "cancelled",

                                    "request_id":
                                        request_id,

                                    "count":
                                        len(results),

                                    "results":
                                        results

                                }


                            # =====================================
                            # SARVAM EMPLOYEE STRUCTURING
                            # =====================================

                            print(
                                "→ Sending employee data to Sarvam"
                            )


                            employee_data = (
                                sarvam_structure(

                                    "company_employees",

                                    employee_raw_data

                                )
                            )


                            # =====================================
                            # CHECK STOP
                            # =====================================

                            if cancellation_event.is_set():

                                print(
                                    "🛑 Stopped after employee Sarvam"
                                )

                                return {

                                    "status":
                                        "cancelled",

                                    "request_id":
                                        request_id,

                                    "count":
                                        len(results),

                                    "results":
                                        results

                                }


                            if employee_data:

                                print(
                                    "✅ Employee Sarvam processing completed"
                                )


                                # =================================
                                # CLEAN EMPLOYEE DATA
                                # =================================

                                employee_data = clean_recursive(
                                    employee_data
                                )


                                # =================================
                                # CHECK STOP
                                # =================================

                                if cancellation_event.is_set():

                                    print(
                                        "🛑 Stopped before employee Neon save"
                                    )

                                    return {

                                        "status":
                                            "cancelled",

                                        "request_id":
                                            request_id,

                                        "count":
                                            len(results),

                                        "results":
                                            results

                                    }


                                # =================================
                                # SAVE EMPLOYEES TO NEON
                                # =================================

                                try:

                                    print(
                                        "→ Saving employee data to Neon"
                                    )


                                    employee_db_result = (
                                        save_employees_to_database(

                                            company_url=
                                                canonical_url,

                                            employee_data=
                                                employee_data,

                                            employee_job_id=
                                                employee_job_id,

                                            is_cancelled=
                                                cancellation_event.is_set

                                        )
                                    )


                                    print(
                                        "✅ Employee data saved to Neon"
                                    )


                                except Exception as e:

                                    print(
                                        "⚠️ Employee database save failed:",
                                        str(e)
                                    )

                                    employee_db_result = {

                                        "status":
                                            "failed",

                                        "error":
                                            str(e)

                                    }


                            else:

                                print(
                                    "⚠️ Employee Sarvam returned no result"
                                )


                        else:

                            print(
                                "⚠️ No employee data returned"
                            )


                    else:

                        print(
                            "⚠️ Mindcase did not return employee job ID"
                        )


                # =================================================
                # FINAL RESULT
                # =================================================

                final_data = {

                    "company":
                        cleaned_data
                        if data_type == "company"
                        else None,

                    "person":
                        cleaned_data
                        if data_type == "person"
                        else None,

                    "employees":
                        employee_data
                        if data_type == "company"
                        else None

                }


                # =================================================
                # SUCCESS
                # =================================================

                print(
                    "✅ Processing completed"
                )


                results.append({

                    "url":
                        url,

                    "canonical_url":
                        canonical_url,

                    "type":
                        data_type,

                    "status":
                        "success",

                    "data":
                        final_data

                })


            # ====================================================
            # ERROR HANDLING
            # ====================================================

            except Exception as e:

                print(
                    "❌ Processing failed:",
                    str(e)
                )


                if cancellation_event.is_set():

                    print(
                        "🛑 Processing cancelled"
                    )

                    return {

                        "status":
                            "cancelled",

                        "request_id":
                            request_id,

                        "count":
                            len(results),

                        "results":
                            results

                    }


                results.append({

                    "url":
                        url,

                    "canonical_url":
                        canonical_url,

                    "type":
                        data_type,

                    "status":
                        "failed",

                    "error":
                        str(e)

                })


        # ========================================================
        # FINAL SUMMARY
        # ========================================================

        if cancellation_event.is_set():

            print(
                "\n🛑 PROCESSING CANCELLED"
            )

            return {

                "status":
                    "cancelled",

                "request_id":
                    request_id,

                "count":
                    len(results),

                "results":
                    results

            }


        print(
            "\n" + "=" * 80
        )

        print(
            "PROCESSING COMPLETE"
        )

        print(
            "Total:",
            len(results)
        )

        print(
            "Success:",
            sum(
                r["status"] == "success"
                for r in results
            )
        )

        print(
            "Failed:",
            sum(
                r["status"] == "failed"
                for r in results
            )
        )

        print(
            "No Data:",
            sum(
                r["status"] == "no_data"
                for r in results
            )
        )

        print(
            "=" * 80
        )


        # ========================================================
        # API RESPONSE
        # ========================================================

        return {

            "status":
                "completed",

            "request_id":
                request_id,

            "count":
                len(results),

            "results":
                results

        }


    finally:

        # ========================================================
        # CLEAN REQUEST FROM ACTIVE CANCELLATIONS
        # ========================================================

        remove_cancellation_event(
            request_id
        )

        print(
            "Cancellation state removed for:",
            request_id
        )