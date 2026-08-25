import re
from urllib.parse import urlparse


def build_linkedin_identity(original_url):

    if not original_url:
        return None

    original_url = str(original_url).strip()

    # Extract URL from Markdown: [text](URL)
    markdown_match = re.search(
        r'\]\((https?://[^)]+)\)',
        original_url
    )

    if markdown_match:
        original_url = markdown_match.group(1)

    # Add scheme if missing
    working_url = original_url

    if not re.match(
        r"^https?://",
        working_url,
        re.IGNORECASE
    ):
        working_url = "https://" + working_url

    parsed = urlparse(working_url)

    host = parsed.netloc.lower()
    path = parsed.path

    # Validate LinkedIn
    if "linkedin.com" not in host:
        return None

    # Clean path
    path = re.sub(r"/+", "/", path)
    path = path.rstrip("/")

    # Identify entity
    if path.lower().startswith("/in/"):

        url_type = "profile"
        entity_type = "person"

        public_identifier = path.split(
            "/in/",
            1
        )[1]

    elif path.lower().startswith("/company/"):

        url_type = "company"
        entity_type = "firm"

        public_identifier = path.split(
            "/company/",
            1
        )[1]

    else:
        return None

    # Remove query/hash
    public_identifier = public_identifier.split("?")[0]
    public_identifier = public_identifier.split("#")[0]
    public_identifier = public_identifier.rstrip("/")

    # Canonical URL
    canonical_url = (
        f"https://www.linkedin.com"
        f"{path.split('?')[0]}"
    )

    return {
        "original_url": original_url,
        "canonical_url": canonical_url,
        "url_type": url_type,
        "linkedin_entity_type": entity_type,
        "public_identifier": public_identifier,
        "root_url": "https://www.linkedin.com",
        "redirect_or_alias": (
            host
            if host != "www.linkedin.com"
            else None
        ),
        "url_confidence": 1.0,
        "linkedin_id": None
    }