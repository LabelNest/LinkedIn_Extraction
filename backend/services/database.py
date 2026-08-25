import os
import json
import hashlib

import psycopg2
from dotenv import load_dotenv


# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv()


# ============================================================
# CONFIGURATION
# ============================================================

DATABASE_URL = os.getenv("DATABASE_URL")

TENANT_ID = os.getenv("TENANT_ID")

CREATED_BY = "vs_mindcase_website_enrich"


# ============================================================
# VALIDATE CONFIGURATION
# ============================================================

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured"
    )

if not TENANT_ID:
    raise RuntimeError(
        "TENANT_ID is not configured"
    )


# ============================================================
# DATABASE CONNECTION
# ============================================================

def get_connection():

    return psycopg2.connect(
        DATABASE_URL
    )


# ============================================================
# CACHE KEY
# ============================================================

def generate_cache_key(
    agent,
    input_params
):

    normalized = json.dumps(
        input_params,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False
    )

    hash_value = hashlib.sha256(
        normalized.encode("utf-8")
    ).hexdigest()

    return f"{agent}:{hash_value}"


# ============================================================
# BUILD DATABASE ROW
# ============================================================

def build_database_row(
    data_type,
    canonical_url,
    final_data,
    job_id
):

    # ========================================================
    # PERSON
    # ========================================================

    if data_type == "person":

        agent = "linkedin/profiles"

        input_params = {
            "linkedin_url": canonical_url
        }

        raw_response = {
            "person": final_data.get("person")
        }

        return {
            "tenant_id": TENANT_ID,
            "provider": "mindcase",
            "agent": agent,

            "cache_key": generate_cache_key(
                agent,
                input_params
            ),

            "input_params": input_params,

            "raw_response": raw_response,

            "row_count": 1,

            "job_id": job_id,

            "entity_type": "vs_person",

            "created_by": CREATED_BY
        }


    # ========================================================
    # COMPANY
    # ========================================================

    if data_type == "company":

        agent = "linkedin/companies"

        input_params = {
            "linkedin_url": canonical_url
        }

        company_data = final_data.get(
            "company"
        )

        return {
            "tenant_id": TENANT_ID,
            "provider": "mindcase",
            "agent": agent,

            "cache_key": generate_cache_key(
                agent,
                input_params
            ),

            "input_params": input_params,

            "raw_response": {
                "company": company_data
            },

            "row_count": 1,

            "job_id": job_id,

            "entity_type": "vs_company",

            "created_by": CREATED_BY
        }


    raise ValueError(
        f"Unsupported data type: {data_type}"
    )


# ============================================================
# BUILD EMPLOYEE DATABASE ROW
# ============================================================

def build_employee_database_row(
    company_url,
    employee_data,
    employee_job_id
):

    agent = "linkedin/company-employees"

    input_params = {
        "company_url": company_url
    }

    employees = []

    if isinstance(
        employee_data,
        dict
    ):

        employees = employee_data.get(
            "employees",
            []
        )

    elif isinstance(
        employee_data,
        list
    ):

        employees = employee_data


    return {
        "tenant_id": TENANT_ID,
        "provider": "mindcase",
        "agent": agent,

        "cache_key": generate_cache_key(
            agent,
            input_params
        ),

        "input_params": input_params,

        "raw_response": {
            "employees": employees
        },

        "row_count": len(employees),

        "job_id": employee_job_id,

        "entity_type": "vs_company",

        "created_by": CREATED_BY
    }


# ============================================================
# INSERT ONE ROW
# ============================================================

def insert_database_row(
    row,
    is_cancelled=None
):

    insert_sql = """

    INSERT INTO public.an_web_scrape_cache (

        tenant_id,
        provider,
        agent,
        cache_key,
        input_params,
        raw_response,
        row_count,
        job_id,
        entity_type,
        created_by

    )

    VALUES (

        %s,
        %s,
        %s,
        %s,
        %s::jsonb,
        %s::jsonb,
        %s,
        %s,
        %s,
        %s

    )

    RETURNING id;

    """


    conn = None
    cursor = None

    try:

        # ====================================================
        # CHECK CANCELLATION BEFORE CONNECTING TO NEON
        # ====================================================

        if is_cancelled and is_cancelled():

            print(
                "🛑 Neon save skipped - enrichment cancelled"
            )

            return None


        conn = get_connection()

        cursor = conn.cursor()


        # ====================================================
        # CHECK CANCELLATION BEFORE INSERT
        # ====================================================

        if is_cancelled and is_cancelled():

            print(
                "🛑 Neon INSERT skipped - enrichment cancelled"
            )

            conn.rollback()

            return None


        # ====================================================
        # INSERT
        # ====================================================

        cursor.execute(

            insert_sql,

            (

                row["tenant_id"],

                row["provider"],

                row["agent"],

                row["cache_key"],

                json.dumps(
                    row["input_params"],
                    ensure_ascii=False
                ),

                json.dumps(
                    row["raw_response"],
                    ensure_ascii=False
                ),

                row["row_count"],

                row["job_id"],

                row["entity_type"],

                row["created_by"]

            )

        )


        # ====================================================
        # CHECK CANCELLATION AFTER INSERT
        # ====================================================

        if is_cancelled and is_cancelled():

            print(
                "🛑 Cancellation detected after Neon INSERT"
            )

            conn.rollback()

            print(
                "↩️ Neon transaction rolled back"
            )

            return None


        inserted_id = cursor.fetchone()[0]

        conn.commit()


        print(
            "✅ Neon insert successful | ID:",
            inserted_id
        )

        return str(inserted_id)


    except Exception as e:

        if conn:

            conn.rollback()

        print(
            "❌ Neon insert failed:",
            str(e)
        )

        raise


    finally:

        if cursor:

            cursor.close()

        if conn:

            conn.close()


# ============================================================
# SAVE PERSON / COMPANY
# ============================================================

def save_enrichment_to_database(

    data_type,

    canonical_url,

    final_data,

    job_id,

    is_cancelled=None

):

    # ========================================================
    # CHECK CANCELLATION BEFORE BUILDING ROW
    # ========================================================

    if is_cancelled and is_cancelled():

        print(
            "🛑 Main Neon save skipped - enrichment cancelled"
        )

        return None


    row = build_database_row(

        data_type,

        canonical_url,

        final_data,

        job_id

    )


    return insert_database_row(
        row,
        is_cancelled=is_cancelled
    )


# ============================================================
# SAVE COMPANY EMPLOYEES
# ============================================================

def save_employees_to_database(

    company_url,

    employee_data,

    employee_job_id,

    is_cancelled=None

):

    # ========================================================
    # CHECK CANCELLATION BEFORE BUILDING ROW
    # ========================================================

    if is_cancelled and is_cancelled():

        print(
            "🛑 Employee Neon save skipped - enrichment cancelled"
        )

        return None


    row = build_employee_database_row(

        company_url,

        employee_data,

        employee_job_id

    )


    return insert_database_row(
        row,
        is_cancelled=is_cancelled
    )


# ============================================================
# MAIN FUNCTION USED BY main.py
# ============================================================

def save_to_neon(

    data_type,

    canonical_url,

    final_data,

    job_id,

    employee_data=None,

    employee_job_id=None,

    is_cancelled=None

):

    """
    Save the main person/company enrichment to Neon.

    If company employee data is provided,
    save that as a separate cache row as well.

    Cancellation is checked before and during
    the database transaction.
    """

    inserted_ids = []


    # ========================================================
    # CHECK CANCELLATION
    # ========================================================

    if is_cancelled and is_cancelled():

        print(
            "🛑 Neon save skipped - enrichment cancelled"
        )

        return inserted_ids


    # ========================================================
    # PERSON / COMPANY
    # ========================================================

    main_id = save_enrichment_to_database(

        data_type,

        canonical_url,

        final_data,

        job_id,

        is_cancelled=is_cancelled

    )


    if main_id is not None:

        inserted_ids.append(
            main_id
        )


    # ========================================================
    # CHECK CANCELLATION BEFORE EMPLOYEES
    # ========================================================

    if is_cancelled and is_cancelled():

        print(
            "🛑 Employee Neon save skipped - enrichment cancelled"
        )

        return inserted_ids


    # ========================================================
    # COMPANY EMPLOYEES
    # ========================================================

    if (
        data_type == "company"
        and employee_data is not None
        and employee_job_id
    ):

        employee_id = save_employees_to_database(

            canonical_url,

            employee_data,

            employee_job_id,

            is_cancelled=is_cancelled

        )


        if employee_id is not None:

            inserted_ids.append(
                employee_id
            )


    return inserted_ids


# ============================================================
# TEST CONNECTION
# ============================================================

def test_database_connection():

    conn = None
    cursor = None

    try:

        conn = get_connection()

        cursor = conn.cursor()

        cursor.execute(
            "SELECT 1;"
        )

        result = cursor.fetchone()

        print(
            "✅ Neon database connected:",
            result
        )

        return True

    except Exception as e:

        print(
            "❌ Neon database connection failed:",
            str(e)
        )

        return False

    finally:

        if cursor:

            cursor.close()

        if conn:

            conn.close()