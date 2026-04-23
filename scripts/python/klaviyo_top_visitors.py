import requests
import csv
from datetime import datetime

API_KEY = "pk_adb68a194f5d092f2f54b272edf1902386"
EXCLUDE_EMAIL = "lennart@diski.nl"
TOP_N = 15
OUTPUT_FILE = "top_visitors.csv"


HEADERS = {
    "Authorization": f"Klaviyo-API-Key {API_KEY}",
    "revision": "2024-10-15",
    "Accept": "application/json",
}


def fetch_all_profiles():
    profiles = []
    url = "https://a.klaviyo.com/api/profiles/"
    params = {"page[size]": 100}

    while url:
        resp = requests.get(url, headers=HEADERS, params=params)
        resp.raise_for_status()
        data = resp.json()
        profiles.extend(data["data"])
        url = data.get("links", {}).get("next")
        params = {}

    return profiles


def get_site_visits(profile):
    props = profile.get("attributes", {}).get("properties", {})
    return props.get("site_visits", 0)


def format_count_map(count_map):
    if not count_map:
        return ""
    top = sorted(count_map.items(), key=lambda x: -x[1])[:10]
    return ", ".join(f"{k} ({v}x)" for k, v in top)


def format_date(raw):
    try:
        return datetime.strptime(raw[:10], "%Y-%m-%d").strftime("%-d %B %Y")
    except Exception:
        return raw or ""


def main():
    print("Fetching profiles from Klaviyo...")
    profiles = fetch_all_profiles()
    print(f"Total profiles fetched: {len(profiles)}")

    profiles = [
        p for p in profiles
        if p.get("attributes", {}).get("email", "").lower() != EXCLUDE_EMAIL.lower()
    ]

    top = sorted(profiles, key=get_site_visits, reverse=True)[:TOP_N]

    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Rank", "Email", "Site Visits", "Unlocked", "Visited Companies", "Searched Terms", "Subscription Company"])

        for rank, profile in enumerate(top, start=1):
            attrs = profile.get("attributes", {})
            props = attrs.get("properties", {})

            writer.writerow([
                rank,
                attrs.get("email", ""),
                props.get("site_visits", 0),
                format_date(props.get("unlock_date", "")),
                format_count_map(props.get("visited_companies", {})),
                format_count_map(props.get("searched_terms", {})),
                props.get("company", ""),
            ])

    print(f"Saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
