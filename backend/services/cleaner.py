import re


def clean_url(value):

    if not value:
        return None

    value = str(value).strip()

    match = re.search(
        r'\((https?://[^)]+)\)',
        value
    )

    if match:
        value = match.group(1)

    match = re.search(
        r'https?://[^\s\])]+',
        value
    )

    if match:
        value = match.group(0)

    return value.rstrip(".,;")


def clean_recursive(obj):

    if isinstance(obj, dict):

        cleaned = {}

        for key, value in obj.items():

            if key.lower() in [
                "photo",
                "coverphoto",
                "companylogo",
                "schoollogo",
                "logo"
            ]:
                continue

            cleaned[key] = clean_recursive(value)

        return cleaned

    elif isinstance(obj, list):

        return [
            clean_recursive(item)
            for item in obj
        ]

    elif isinstance(obj, str):

        if "linkedin.com" in obj.lower():
            return clean_url(obj)

        return obj.strip()

    return obj