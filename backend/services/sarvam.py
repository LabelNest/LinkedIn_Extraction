import os
import json
import re

from sarvamai import SarvamAI


SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")

if not SARVAM_API_KEY:
    raise ValueError("SARVAM_API_KEY is not set")

sarvam_client = SarvamAI(
    api_subscription_key=SARVAM_API_KEY
)

SARVAM_PROMPT = """
You are a LinkedIn data verification and structuring system.

The source data comes from Mindcase.

IMPORTANT:
- Do NOT invent information.
- Preserve information that exists in the source.
- Use null when information is unavailable.
- Remove obvious malformed or garbage values.
- Normalize names, company names, job titles and dates.
- Preserve BOTH current and historical employment.
- Return ONLY valid JSON.
- Do NOT return markdown.
- Do NOT repeat large image URLs.
- Do NOT include photo, coverPhoto, companyLogo or schoolLogo fields.
- Keep LinkedIn profile/company URLs only.
- Keep the response compact.

For a PERSON, return:

{
  "full_name": "",
  "linkedin_url": "",
  "headline": "",
  "about": "",
  "location": {
    "city": "",
    "state": "",
    "country": ""
  },
  "current_positions": [],
  "historical_positions": [],
  "education": [],
  "skills": [],
  "certifications": []
}

For a COMPANY, return:

{
  "company_name": "",
  "linkedin_url": "",
  "website": "",
  "industry": "",
  "description": "",
  "headquarters": "",
  "employee_count": null
}

For COMPANY_EMPLOYEES, return:

{
  "employees": [
    {
      "full_name": "",
      "linkedin_url": "",
      "headline": "",
      "current_position": "",
      "company_name": "",
      "location": ""
    }
  ]
}
"""

import json
import re


def estimate_tokens(text):
    """
    Rough token estimate.
    Keeps chunks safely below Sarvam's 4096 output limit.
    """
    return max(1, len(text) // 4)


def split_list_by_tokens(items, max_tokens=2500):

    chunks = []
    current_chunk = []
    current_tokens = 0

    for item in items:

        item_text = json.dumps(
            item,
            ensure_ascii=False
        )

        item_tokens = estimate_tokens(item_text)

        if (
            current_chunk
            and current_tokens + item_tokens > max_tokens
        ):
            chunks.append(current_chunk)

            current_chunk = []
            current_tokens = 0

        current_chunk.append(item)
        current_tokens += item_tokens

    if current_chunk:
        chunks.append(current_chunk)

    return chunks


print("✅ Chunking helpers ready")


def create_sarvam_chunks(data_type, data):
    
  
    if not isinstance(data, list):
        data = [data]

   
    if data_type == "company_employees":

        return split_list_by_tokens(
            data,
            max_tokens=2500
        )


    if data_type == "company":

        return split_list_by_tokens(
            data,
            max_tokens=2500
        )

   
    if data_type == "person":

        chunks = []

        for person in data:

            person_text = json.dumps(
                person,
                ensure_ascii=False
            )

            
            if estimate_tokens(person_text) <= 2500:

                chunks.append([person])

                continue

            
            basic = {}
            employment = {}
            other = {}

            for key, value in person.items():

                key_lower = key.lower()

                
                if any(
                    word in key_lower
                    for word in [
                        "experience",
                        "employment",
                        "position",
                        "job"
                    ]
                ):

                    employment[key] = value

               
                elif any(
                    word in key_lower
                    for word in [
                        "education",
                        "skill",
                        "certification",
                        "course"
                    ]
                ):

                    other[key] = value

                
                else:

                    basic[key] = value

            if basic:

                chunks.append([basic])

            if employment:

                chunks.extend(
                    split_list_by_tokens(
                        [employment],
                        max_tokens=2500
                    )
                )

            if other:

                chunks.append([other])

        return chunks

   
    return split_list_by_tokens(
        data,
        max_tokens=2500
    )


print("✅ Sarvam logical chunking ready")


def merge_sarvam_results(data_type, results):
    
   
    if data_type == "person":

        merged = {
            "full_name": "",
            "linkedin_url": "",
            "headline": "",
            "about": "",
            "location": {
                "city": "",
                "state": "",
                "country": ""
            },
            "current_positions": [],
            "historical_positions": [],
            "education": [],
            "skills": [],
            "certifications": []
        }

        for result in results:

            if not isinstance(result, dict):
                continue

           
            for key in [
                "full_name",
                "linkedin_url",
                "headline",
                "about"
            ]:

                if not merged[key] and result.get(key):
                    merged[key] = result[key]

          
            location = result.get("location")

            if isinstance(location, dict):

                for key in [
                    "city",
                    "state",
                    "country"
                ]:

                    if (
                        not merged["location"][key]
                        and location.get(key)
                    ):
                        merged["location"][key] = location[key]

            
            for key in [
                "current_positions",
                "historical_positions",
                "education",
                "skills",
                "certifications"
            ]:

                values = result.get(key, [])

                if isinstance(values, list):
                    merged[key].extend(values)

        
        for key in [
            "current_positions",
            "historical_positions",
            "education",
            "skills",
            "certifications"
        ]:

            unique = []
            seen = set()

            for value in merged[key]:

                marker = json.dumps(
                    value,
                    sort_keys=True,
                    ensure_ascii=False
                )

                if marker not in seen:

                    seen.add(marker)
                    unique.append(value)

            merged[key] = unique

        return merged


    if data_type == "company":

        merged = {
            "company_name": "",
            "linkedin_url": "",
            "website": "",
            "industry": "",
            "description": "",
            "headquarters": "",
            "employee_count": None
        }

        for result in results:

            if not isinstance(result, dict):
                continue

            for key in merged:

                if (
                    merged[key] in ["", None]
                    and result.get(key) not in ["", None]
                ):

                    merged[key] = result[key]

        return merged


    if data_type == "company_employees":

        employees = []

        for result in results:

            if not isinstance(result, dict):
                continue

            values = result.get("employees", [])

            if isinstance(values, list):
                employees.extend(values)

       
        unique = []
        seen = set()

        for employee in employees:

            if not isinstance(employee, dict):
                continue

            marker = (
                employee.get("linkedin_url")
                or employee.get("full_name")
            )

            if marker and marker not in seen:

                seen.add(marker)
                unique.append(employee)

        return {
            "employees": unique
        }

    return results


print("✅ Sarvam merge function ready")

def sarvam_structure(data_type, data):
    
    chunks = create_sarvam_chunks(
        data_type,
        data
    )

    print(
        f"📦 {data_type}: {len(chunks)} chunk(s)"
    )

    chunk_results = []

    for i, chunk in enumerate(chunks, 1):

        print(
            f"   → Sarvam chunk "
            f"{i}/{len(chunks)}"
        )

        prompt = f"""
{SARVAM_PROMPT}

DATA TYPE:
{data_type}

SOURCE DATA CHUNK:
{json.dumps(chunk, ensure_ascii=False, indent=2)}

IMPORTANT:
- Return ONLY valid JSON.
- Return the COMPLETE JSON object.
- Do not return markdown.
- Do not invent information.
- Preserve information from the source.
- Use null when unavailable.
- Keep the response compact.
- Do not include image URLs.
"""

        try:

            response = sarvam_client.chat.completions(
                model="sarvam-105b",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                reasoning_effort=None,
                max_tokens=4096,
                request_options={
                    "timeout_in_seconds": 300,
                    "max_retries": 0
                }
            )

            result = (
                response
                .choices[0]
                .message
                .content
                .strip()
            )

            # Remove markdown fences
            result = re.sub(
                r"^```json\s*",
                "",
                result,
                flags=re.IGNORECASE
            )

            result = re.sub(
                r"^```\s*",
                "",
                result
            )

            result = re.sub(
                r"\s*```$",
                "",
                result
            )

            result = result.strip()

            parsed = json.loads(result)

            chunk_results.append(parsed)

            print("   ✅ Chunk valid JSON")

        except json.JSONDecodeError as e:

            print(
                "   ❌ Invalid JSON:",
                e
            )

        except Exception as e:

            print(
                "   ❌ Sarvam error:",
                e
            )

   
    if not chunk_results:

        return None

   
    if len(chunk_results) == 1:

        return chunk_results[0]

    
    print(
        f"🔗 Merging {len(chunk_results)} chunks..."
    )

    return merge_sarvam_results(
        data_type,
        chunk_results
    )


print("✅ Chunk-aware Sarvam function ready")
