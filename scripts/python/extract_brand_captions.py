#!/usr/bin/env python3
"""
extract_brand_captions.py
=========================
Pull the caption-grounding bundle for ONE shop slug from the influencer-caption
MariaDB (XAMPP), as a single JSON blob ready to feed into v2 brand-content
generation.

This is the reusable version of the ad-hoc SQL we ran by hand while building the
v2 pilot pages. The queries + how to turn the output into a BrandContent object
are documented in:
  ../../src/app/company-codes-v2/brand-content/CONTENT-GENERATION.md

Connection: shells out to the XAMPP `mysql` client over the unix socket (verified
to work on this machine; the server is NOT on TCP 3306). No mysql.connector needed.
Override the binary/socket/db via env vars MYSQL_BIN / MYSQL_SOCKET / MYSQL_DB.

Usage:
  python3 extract_brand_captions.py nakdfashion
  python3 extract_brand_captions.py hellofresh.nl --sample 40 --out hellofresh.json
  python3 extract_brand_captions.py ginatricot --pretty

Output (stdout): JSON with
  slug, mode (grounded|self-authored), captions_total, distinct_creators,
  discount_pattern[], top_creators[], caption_sample[], related_shops[]
"""

import argparse
import json
import os
import re
import subprocess
import sys

MYSQL_BIN = os.environ.get("MYSQL_BIN", "/Applications/XAMPP/xamppfiles/bin/mysql")
MYSQL_SOCKET = os.environ.get("MYSQL_SOCKET", "/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock")
MYSQL_DB = os.environ.get("MYSQL_DB", "py_diski_influencers")

# Caption count at/above which we caption-ground; below it, self-author the copy.
GROUNDED_THRESHOLD = 15

# Slugs look like: nakdfashion, about-you, hellofresh.nl, bodyandfit.com.
# Validate to keep the (string-interpolated) SQL safe.
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9._-]*$")


def run_query(sql):
    """Run SQL via the mysql CLI (batch mode = tab-separated, header row first).
    Returns a list of dict rows."""
    proc = subprocess.run(
        [MYSQL_BIN, "-uroot", f"--socket={MYSQL_SOCKET}", MYSQL_DB, "--batch", "-e", sql],
        capture_output=True, text=True,
    )
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr)
        raise SystemExit(
            f"\nmysql query failed (rc={proc.returncode}). "
            f"Is XAMPP/MariaDB running, and is the socket at {MYSQL_SOCKET}?"
        )
    lines = [ln for ln in proc.stdout.split("\n") if ln != ""]
    if not lines:
        return []
    headers = lines[0].split("\t")
    return [dict(zip(headers, ln.split("\t"))) for ln in lines[1:]]


def both_tables_union(select_expr, where_extra=""):
    """UNION ALL the instagram + tiktok tables for a given slug (filled in by caller)."""
    return (
        f"SELECT {select_expr} FROM instagram WHERE ai_canonical='{{slug}}'{where_extra} "
        f"UNION ALL "
        f"SELECT {select_expr} FROM tiktok WHERE ai_canonical='{{slug}}'{where_extra}"
    )


def extract(slug, sample_size, creators_limit):
    # --- stats: total captions + distinct creators, across BOTH tables -------
    union_names = both_tables_union("influencer_name").format(slug=slug)
    stats = run_query(
        f"SELECT COUNT(*) AS total, COUNT(DISTINCT influencer_name) AS creators "
        f"FROM ({union_names}) t;"
    )
    total = int(stats[0]["total"]) if stats else 0
    creators = int(stats[0]["creators"]) if stats else 0

    # --- discount % pattern (from instagram ai_analysis JSON) ----------------
    discount_rows = run_query(
        "SELECT JSON_UNQUOTE(JSON_EXTRACT(ai_analysis,'$[0].percentage')) AS pct, "
        "COUNT(*) AS c FROM instagram "
        f"WHERE ai_canonical='{slug}' AND ai_analysis IS NOT NULL "
        "GROUP BY pct ORDER BY c DESC LIMIT 8;"
    )
    discount_pattern = [{"pct": r["pct"], "count": int(r["c"])} for r in discount_rows]

    # --- top creators (social proof / creators section), across both tables --
    union_names2 = both_tables_union("influencer_name").format(slug=slug)
    creator_rows = run_query(
        f"SELECT influencer_name AS name, COUNT(*) AS posts FROM ({union_names2}) t "
        f"GROUP BY name ORDER BY posts DESC LIMIT {creators_limit};"
    )
    top_creators = [{"name": r["name"], "posts": int(r["posts"])} for r in creator_rows]

    # --- caption sample (raw material to mine), across both tables -----------
    # Newlines/tabs are stripped in SQL so each row stays one parseable line.
    # NB: raw r"..." keeps \n / \t as the two chars MySQL needs.
    clean_caption = r"REPLACE(REPLACE(LEFT(caption,280),'\n',' '),'\t',' ')"
    union_caps = (
        f"SELECT influencer_name, {clean_caption} AS caption, post_date "
        f"FROM instagram WHERE ai_canonical='{slug}' AND caption IS NOT NULL AND CHAR_LENGTH(caption)>30 "
        f"UNION ALL "
        f"SELECT influencer_name, {clean_caption} AS caption, post_date "
        f"FROM tiktok WHERE ai_canonical='{slug}' AND caption IS NOT NULL AND CHAR_LENGTH(caption)>30"
    )
    caption_rows = run_query(
        f"SELECT influencer_name AS influencer, caption, DATE(post_date) AS date "
        f"FROM ({union_caps}) t ORDER BY post_date DESC LIMIT {sample_size};"
    )
    caption_sample = [
        {"influencer": r["influencer"], "date": r["date"], "caption": r["caption"]}
        for r in caption_rows
    ]

    # --- related shops via shared-influencer co-occurrence (instagram) -------
    related_rows = run_query(
        "SELECT ai_canonical AS slug, COUNT(DISTINCT influencer_name) AS shared "
        "FROM instagram "
        f"WHERE influencer_name IN (SELECT DISTINCT influencer_name FROM instagram WHERE ai_canonical='{slug}') "
        f"AND ai_canonical IS NOT NULL AND ai_canonical NOT IN ('{slug}','UNKNOWN') "
        "GROUP BY ai_canonical ORDER BY shared DESC LIMIT 16;"
    )
    related_shops = [{"slug": r["slug"], "shared_creators": int(r["shared"])} for r in related_rows]

    return {
        "slug": slug,
        "mode": "grounded" if total >= GROUNDED_THRESHOLD else "self-authored",
        "captions_total": total,
        "distinct_creators": creators,
        "discount_pattern": discount_pattern,
        "top_creators": top_creators,
        "caption_sample": caption_sample,
        "related_shops": related_shops,
    }


def main():
    ap = argparse.ArgumentParser(description="Extract caption-grounding bundle for a shop slug.")
    ap.add_argument("slug", help="shop slug, matching discounts.json / ai_canonical (e.g. nakdfashion)")
    ap.add_argument("--sample", type=int, default=30, help="number of captions to sample (default 30)")
    ap.add_argument("--creators", type=int, default=12, help="number of top creators (default 12)")
    ap.add_argument("--out", help="write JSON to this file instead of stdout")
    ap.add_argument("--pretty", action="store_true", help="pretty-print JSON")
    args = ap.parse_args()

    slug = args.slug.strip().lower()
    if not SLUG_RE.match(slug):
        raise SystemExit(f"Invalid slug {slug!r} (allowed: a-z 0-9 . _ -)")

    bundle = extract(slug, args.sample, args.creators)

    # A short human summary to stderr, so stdout stays clean JSON for piping.
    sys.stderr.write(
        f"[{slug}] mode={bundle['mode']} captions={bundle['captions_total']} "
        f"creators={bundle['distinct_creators']} related={len(bundle['related_shops'])}\n"
    )

    out = json.dumps(bundle, indent=2 if args.pretty else None, ensure_ascii=False)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(out)
        sys.stderr.write(f"wrote {args.out}\n")
    else:
        print(out)


if __name__ == "__main__":
    main()
