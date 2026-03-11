#!/usr/bin/env python3
"""Admin CLI for isaacchacko.com API."""

import argparse
import json
import os
import sys
import httpx

# ── Config ────────────────────────────────────────────────────────────────────

BASE_URL = os.environ.get("API_URL", "http://localhost:3001")
ADMIN_KEY = os.environ.get("ADMIN_API_KEY", "")

# Try reading from .env if not set
if not ADMIN_KEY:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("ADMIN_API_KEY="):
                    ADMIN_KEY = line.split("=", 1)[1].strip().strip('"').strip("'")


def headers():
    return {"X-Admin-Key": ADMIN_KEY}


def pp(data):
    """Pretty print JSON."""
    print(json.dumps(data, indent=2, default=str))


def error(msg):
    print(f"Error: {msg}", file=sys.stderr)
    sys.exit(1)


# ── Guestbook ─────────────────────────────────────────────────────────────────


def guestbook_list(args):
    r = httpx.get(
        f"{BASE_URL}/guestbook/",
        params={"page": args.page, "per_page": args.per_page},
        headers=headers() if args.admin else {},
    )
    pp(r.json())


def guestbook_approve(args):
    r = httpx.patch(f"{BASE_URL}/guestbook/{args.id}/approve", headers=headers())
    if r.status_code == 200:
        pp(r.json())
    else:
        error(f"{r.status_code}: {r.text}")


def guestbook_delete(args):
    r = httpx.delete(
        f"{BASE_URL}/guestbook/{args.id}",
        params={"entry_id": args.id},
        headers=headers(),
    )
    if r.status_code == 204:
        print(f"Deleted guestbook entry {args.id}")
    else:
        error(f"{r.status_code}: {r.text}")


# ── Library ───────────────────────────────────────────────────────────────────


def library_list(args):
    params = {"page": args.page, "per_page": args.per_page, "sort": args.sort}
    if args.type:
        params["item_type"] = args.type
    if args.tag:
        params["tag"] = args.tag
    r = httpx.get(f"{BASE_URL}/library/", params=params)
    pp(r.json())


def library_get(args):
    r = httpx.get(f"{BASE_URL}/library/{args.id}")
    if r.status_code == 200:
        pp(r.json())
    else:
        error(f"{r.status_code}: {r.text}")


def library_add(args):
    body = {
        "title": args.title,
        "item_type": args.type,
    }
    if args.url:
        body["url"] = args.url
    if args.note:
        body["note"] = args.note
    if args.rating is not None:
        body["rating"] = args.rating
    if args.cover:
        body["cover_image_url"] = args.cover
    if args.tags:
        body["tags"] = [t.strip() for t in args.tags.split(",")]
    else:
        body["tags"] = []

    r = httpx.post(f"{BASE_URL}/library/", json=body, headers=headers())
    if r.status_code == 201:
        pp(r.json())
    else:
        error(f"{r.status_code}: {r.text}")


def library_update(args):
    body = {}
    if args.title:
        body["title"] = args.title
    if args.url:
        body["url"] = args.url
    if args.note:
        body["note"] = args.note
    if args.type:
        body["item_type"] = args.type
    if args.rating is not None:
        body["rating"] = args.rating
    if args.cover:
        body["cover_image_url"] = args.cover
    if args.tags:
        body["tags"] = [t.strip() for t in args.tags.split(",")]

    r = httpx.patch(f"{BASE_URL}/library/{args.id}", json=body, headers=headers())
    if r.status_code == 200:
        pp(r.json())
    else:
        error(f"{r.status_code}: {r.text}")


def library_delete(args):
    r = httpx.delete(f"{BASE_URL}/library/{args.id}", headers=headers())
    if r.status_code == 204:
        print(f"Deleted library item {args.id}")
    else:
        error(f"{r.status_code}: {r.text}")


def library_tags(args):
    r = httpx.get(f"{BASE_URL}/library/tags")
    pp(r.json())


def library_suggestions(args):
    r = httpx.get(f"{BASE_URL}/library/suggestions", headers=headers())
    pp(r.json())


def library_approve(args):
    r = httpx.post(
        f"{BASE_URL}/library/suggestions/{args.id}/approve", headers=headers()
    )
    if r.status_code == 200:
        pp(r.json())
    else:
        error(f"{r.status_code}: {r.text}")


def library_reject(args):
    r = httpx.post(
        f"{BASE_URL}/library/suggestions/{args.id}/reject", headers=headers()
    )
    if r.status_code == 204:
        print(f"Rejected suggestion {args.id}")
    else:
        error(f"{r.status_code}: {r.text}")


# ── Photos ────────────────────────────────────────────────────────────────────


def photos_list(args):
    r = httpx.get(
        f"{BASE_URL}/photos/",
        params={"page": args.page, "per_page": args.per_page},
    )
    pp(r.json())


def photos_get(args):
    r = httpx.get(f"{BASE_URL}/photos/{args.id}")
    if r.status_code == 200:
        pp(r.json())
    else:
        error(f"{r.status_code}: {r.text}")


def photos_upload(args):
    if not os.path.exists(args.file):
        error(f"File not found: {args.file}")

    with open(args.file, "rb") as f:
        files = {"file": (os.path.basename(args.file), f)}
        data = {}
        if args.caption:
            data["caption"] = args.caption
        r = httpx.post(f"{BASE_URL}/photos/", files=files, data=data, headers=headers())

    if r.status_code == 201:
        pp(r.json())
    else:
        error(f"{r.status_code}: {r.text}")


def photos_caption(args):
    r = httpx.patch(
        f"{BASE_URL}/photos/{args.id}",
        json={"caption": args.caption},
        headers=headers(),
    )
    if r.status_code == 200:
        pp(r.json())
    else:
        error(f"{r.status_code}: {r.text}")


def photos_delete(args):
    r = httpx.delete(f"{BASE_URL}/photos/{args.id}", headers=headers())
    if r.status_code == 204:
        print(f"Deleted photo {args.id}")
    else:
        error(f"{r.status_code}: {r.text}")


# ── Analytics ─────────────────────────────────────────────────────────────────


def analytics_summary(args):
    r = httpx.get(
        f"{BASE_URL}/analytics/summary",
        params={"days": args.days},
        headers=headers(),
    )
    pp(r.json())


def analytics_events(args):
    r = httpx.get(
        f"{BASE_URL}/analytics/events",
        params={"page": args.page, "per_page": args.per_page},
        headers=headers(),
    )
    pp(r.json())


# ── Spotify ───────────────────────────────────────────────────────────────────


def spotify_now(args):
    r = httpx.get(f"{BASE_URL}/spotify/now-playing")
    pp(r.json())


# ── Status ────────────────────────────────────────────────────────────────────


def status_get(args):
    r = httpx.get(f"{BASE_URL}/status/")
    pp(r.json())


def status_set(args):
    r = httpx.post(f"{BASE_URL}/status/", json={"text": args.text}, headers=headers())
    if r.status_code == 201:
        pp(r.json())
    else:
        error(f"{r.status_code}: {r.text}")


# ── Parser ────────────────────────────────────────────────────────────────────


def build_parser():
    parser = argparse.ArgumentParser(description="isaacchacko.com admin CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    # ── guestbook ──
    gb = sub.add_parser("guestbook", aliases=["gb"])
    gb_sub = gb.add_subparsers(dest="action", required=True)

    gb_list = gb_sub.add_parser("list")
    gb_list.add_argument("--page", type=int, default=1)
    gb_list.add_argument("--per-page", type=int, default=20)
    gb_list.add_argument("--admin", action="store_true", help="Show unapproved entries")
    gb_list.set_defaults(func=guestbook_list)

    gb_approve = gb_sub.add_parser("approve")
    gb_approve.add_argument("id", type=int)
    gb_approve.set_defaults(func=guestbook_approve)

    gb_del = gb_sub.add_parser("delete")
    gb_del.add_argument("id", type=int)
    gb_del.set_defaults(func=guestbook_delete)

    # ── library ──
    lib = sub.add_parser("library", aliases=["lib"])
    lib_sub = lib.add_subparsers(dest="action", required=True)

    lib_list = lib_sub.add_parser("list")
    lib_list.add_argument("--page", type=int, default=1)
    lib_list.add_argument("--per-page", type=int, default=20)
    lib_list.add_argument("--type", help="Filter by item_type")
    lib_list.add_argument("--tag", help="Filter by tag")
    lib_list.add_argument(
        "--sort", default="recent", choices=["recent", "alpha", "rating"]
    )
    lib_list.set_defaults(func=library_list)

    lib_get = lib_sub.add_parser("get")
    lib_get.add_argument("id", type=int)
    lib_get.set_defaults(func=library_get)

    lib_add = lib_sub.add_parser("add")
    lib_add.add_argument("--title", required=True)
    lib_add.add_argument(
        "--type",
        required=True,
        choices=["book", "article", "song", "album", "podcast", "other"],
    )
    lib_add.add_argument("--url")
    lib_add.add_argument("--note")
    lib_add.add_argument("--rating", type=float)
    lib_add.add_argument("--cover")
    lib_add.add_argument("--tags", help="Comma-separated tags")
    lib_add.set_defaults(func=library_add)

    lib_update = lib_sub.add_parser("update")
    lib_update.add_argument("id", type=int)
    lib_update.add_argument("--title")
    lib_update.add_argument("--type")
    lib_update.add_argument("--url")
    lib_update.add_argument("--note")
    lib_update.add_argument("--rating", type=float)
    lib_update.add_argument("--cover")
    lib_update.add_argument("--tags", help="Comma-separated tags")
    lib_update.set_defaults(func=library_update)

    lib_del = lib_sub.add_parser("delete")
    lib_del.add_argument("id", type=int)
    lib_del.set_defaults(func=library_delete)

    lib_tags = lib_sub.add_parser("tags")
    lib_tags.set_defaults(func=library_tags)

    lib_suggestions = lib_sub.add_parser("suggestions")
    lib_suggestions.set_defaults(func=library_suggestions)

    lib_approve = lib_sub.add_parser("approve")
    lib_approve.add_argument("id", type=int)
    lib_approve.set_defaults(func=library_approve)

    lib_reject = lib_sub.add_parser("reject")
    lib_reject.add_argument("id", type=int)
    lib_reject.set_defaults(func=library_reject)

    # ── photos ──
    ph = sub.add_parser("photos", aliases=["ph"])
    ph_sub = ph.add_subparsers(dest="action", required=True)

    ph_list = ph_sub.add_parser("list")
    ph_list.add_argument("--page", type=int, default=1)
    ph_list.add_argument("--per-page", type=int, default=20)
    ph_list.set_defaults(func=photos_list)

    ph_get = ph_sub.add_parser("get")
    ph_get.add_argument("id", type=int)
    ph_get.set_defaults(func=photos_get)

    ph_upload = ph_sub.add_parser("upload")
    ph_upload.add_argument("file", help="Path to image file")
    ph_upload.add_argument("--caption")
    ph_upload.set_defaults(func=photos_upload)

    ph_caption = ph_sub.add_parser("caption")
    ph_caption.add_argument("id", type=int)
    ph_caption.add_argument("caption")
    ph_caption.set_defaults(func=photos_caption)

    ph_del = ph_sub.add_parser("delete")
    ph_del.add_argument("id", type=int)
    ph_del.set_defaults(func=photos_delete)

    # ── analytics ──
    an = sub.add_parser("analytics", aliases=["an"])
    an_sub = an.add_subparsers(dest="action", required=True)

    an_summary = an_sub.add_parser("summary")
    an_summary.add_argument("--days", type=int, default=7)
    an_summary.set_defaults(func=analytics_summary)

    an_events = an_sub.add_parser("events")
    an_events.add_argument("--page", type=int, default=1)
    an_events.add_argument("--per-page", type=int, default=50)
    an_events.set_defaults(func=analytics_events)

    # ── spotify ──
    sp = sub.add_parser("spotify", aliases=["sp"])
    sp.set_defaults(func=spotify_now)

    # ── status ──
    st = sub.add_parser("status", aliases=["st"])
    st_sub = st.add_subparsers(dest="action")

    st_set = st_sub.add_parser("set")
    st_set.add_argument("text")
    st_set.set_defaults(func=status_set)

    st.set_defaults(func=status_get)

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    if hasattr(args, "func"):
        args.func(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
