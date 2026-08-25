import os
import time
import requests
from dotenv import load_dotenv


# Load .env
load_dotenv()


MINDSCASE_API_KEY = os.getenv("MINDSCASE_API_KEY")


if not MINDSCASE_API_KEY:
    raise RuntimeError(
        "MINDSCASE_API_KEY is not configured. "
        "Please add it to backend/.env"
    )


MINDSCASE_HEADERS = {
    "Authorization": f"Bearer {MINDSCASE_API_KEY}",
    "Content-Type": "application/json"
}


# ============================================================
# PROFILE
# ============================================================

def start_profile_job(linkedin_url):

    endpoint = (
        "https://api.mindcase.co/"
        "v1/data/linkedin/profiles/run"
    )

    payload = {
        "params": {
            "queries": [linkedin_url]
        }
    }

    response = requests.post(
        endpoint,
        headers=MINDSCASE_HEADERS,
        json=payload,
        timeout=300
    )

    response.raise_for_status()

    return response.json()


# ============================================================
# COMPANY
# ============================================================

def start_company_job(linkedin_url):

    endpoint = (
        "https://api.mindcase.co/"
        "v1/data/linkedin/companies/run"
    )

    payload = {
        "params": {
            "companies": [linkedin_url]
        }
    }

    response = requests.post(
        endpoint,
        headers=MINDSCASE_HEADERS,
        json=payload,
        timeout=300
    )

    response.raise_for_status()

    return response.json()


# ============================================================
# COMPANY EMPLOYEES
# ============================================================

def start_company_employees_job(company_url):

    endpoint = (
        "https://api.mindcase.co/"
        "v1/data/linkedin/company-employees/run"
    )

    payload = {
        "params": {
            "companies": company_url,
            "locations": [],
            "jobTitles": [],
            "yearsAtCompany": [],
            "yearsOfExperience": [],
            "companyHeadcount": [],
            "pastJobTitles": [],
            "seniorityLevels": [],
            "functions": [],
            "industries": []
        }
    }

    response = requests.post(
        endpoint,
        headers=MINDSCASE_HEADERS,
        json=payload,
        timeout=300
    )

    response.raise_for_status()

    return response.json()


# ============================================================
# POLL JOB
# ============================================================

def poll_mindcase_job(job_id, is_cancelled=None):

    endpoint = (
        f"https://api.mindcase.co/"
        f"v1/jobs/{job_id}/results"
    )

    while True:

        # ====================================================
        # CHECK CANCELLATION BEFORE POLLING
        # ====================================================

        if is_cancelled and is_cancelled():

            print(
                "🛑 Mindcase polling cancelled by user"
            )

            return {
                "status": "cancelled",
                "job_id": job_id,
                "data": [],
                "row_count": 0
            }


        response = requests.get(
            endpoint,
            headers=MINDSCASE_HEADERS,
            timeout=60
        )

        response.raise_for_status()

        result = response.json()

        status = result.get("status")

        print(
            "Mindcase status:",
            status,
            "| Rows:",
            result.get("row_count", 0)
        )


        # ====================================================
        # COMPLETED
        # ====================================================

        if status == "completed":

            return result


        # ====================================================
        # MINDCASE FAILED / CANCELLED
        # ====================================================

        if status in ["failed", "cancelled"]:

            return result


        # ====================================================
        # CHECK CANCELLATION BEFORE WAITING
        # ====================================================

        if is_cancelled and is_cancelled():

            print(
                "🛑 Mindcase polling cancelled by user"
            )

            return {
                "status": "cancelled",
                "job_id": job_id,
                "data": [],
                "row_count": 0
            }


        # ====================================================
        # WAIT BEFORE NEXT POLL
        # ====================================================

        time.sleep(2)