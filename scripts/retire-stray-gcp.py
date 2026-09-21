#!/usr/bin/env python3
"""
Audit and disable legacy GCP deploy paths.

- web3-jobs-aggregator: disable Cloud Build triggers for cloudbuild.yaml / Cloud Run web3-jobs
- web3-job-board-aggregator: list resources (often 403 without cross-project IAM)

Usage:
  python3 scripts/retire-stray-gcp.py           # audit only
  python3 scripts/retire-stray-gcp.py --apply   # disable matching triggers on production project
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

PRODUCTION = "web3-jobs-aggregator"
LEGACY = "web3-job-board-aggregator"

DEFAULT_KEY = os.path.expanduser(
    os.environ.get(
        "GOOGLE_APPLICATION_CREDENTIALS",
        "~/Downloads/web3-jobs-aggregator-cdc8cf2ff03c.json",
    )
)


def get_access_token(key_path: str) -> str:
    key = json.load(open(key_path))
    open("/tmp/gcp_retire_key.pem", "w").write(key["private_key"])
    now = int(time.time())
    header = (
        __import__("base64")
        .urlsafe_b64encode(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
        .decode()
        .rstrip("=")
    )
    payload = (
        __import__("base64")
        .urlsafe_b64encode(
            json.dumps(
                {
                    "iss": key["client_email"],
                    "aud": key["token_uri"],
                    "iat": now,
                    "exp": now + 3600,
                    "scope": "https://www.googleapis.com/auth/cloud-platform",
                }
            ).encode()
        )
        .decode()
        .rstrip("=")
    )
    to_sign = f"{header}.{payload}"
    open("/tmp/gcp_retire_sign.txt", "w").write(to_sign)
    sig = subprocess.check_output(
        ["openssl", "dgst", "-sha256", "-sign", "/tmp/gcp_retire_key.pem", "/tmp/gcp_retire_sign.txt"]
    )
    sig_b64 = __import__("base64").urlsafe_b64encode(sig).decode().rstrip("=")
    assertion = f"{to_sign}.{sig_b64}"
    data = urllib.parse.urlencode(
        {"grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer", "assertion": assertion}
    ).encode()
    req = urllib.request.Request(key["token_uri"], data=data)
    res = json.loads(urllib.request.urlopen(req).read())
    return res["access_token"]


def api_get(token: str, url: str) -> dict | list | None:
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    try:
        return json.loads(urllib.request.urlopen(req).read())
    except urllib.error.HTTPError as e:
        print(f"  GET {url} → HTTP {e.code}: {e.read().decode()[:500]}")
        return None


def api_patch(token: str, url: str, body: dict) -> bool:
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        url,
        data=data,
        method="PATCH",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        urllib.request.urlopen(req).read()
        return True
    except urllib.error.HTTPError as e:
        print(f"  PATCH failed HTTP {e.code}: {e.read().decode()[:500]}")
        return False


def is_legacy_deploy_trigger(trigger: dict) -> bool:
    name = (trigger.get("name") or "").lower()
    filename = (trigger.get("filename") or "").lower()
    desc = (trigger.get("description") or "").lower()
    if "cloudbuild.yaml" in filename:
        return True
    if "web3-jobs" in name and "apphosting" not in name and "firebase" not in name:
        return True
    if "cloud run" in desc and "web3-jobs" in desc:
        return True
    # Known duplicate pattern from prior audit
    if name.startswith("rmgpgab-web3-jobs"):
        return True
    return False


def audit_triggers(token: str, project: str, apply: bool) -> None:
    print(f"\n=== Cloud Build triggers: {project} ===")
    data = api_get(token, f"https://cloudbuild.googleapis.com/v1/projects/{project}/triggers")
    if not data:
        return
    triggers = data.get("triggers") or []
    if not triggers:
        print("  (none)")
        return
    for t in triggers:
        tid = t.get("id", "?")
        name = t.get("name", "?")
        disabled = t.get("disabled", False)
        filename = t.get("filename", "—")
        legacy = is_legacy_deploy_trigger(t)
        flag = "LEGACY" if legacy else "ok"
        print(f"  [{flag}] id={tid} disabled={disabled} file={filename} name={name}")
        if apply and legacy and not disabled:
            ok = api_patch(
                token,
                f"https://cloudbuild.googleapis.com/v1/projects/{project}/triggers/{tid}?updateMask=disabled",
                {"disabled": True},
            )
            print(f"    → disabled={ok}")


def audit_cloud_run(token: str, project: str, region: str) -> None:
    print(f"\n=== Cloud Run services: {project} ({region}) ===")
    url = (
        f"https://run.googleapis.com/v2/projects/{project}/locations/{region}/services"
    )
    data = api_get(token, url)
    if not data:
        return
    for svc in data.get("services") or []:
        print(f"  {svc.get('name', '?').split('/')[-1]} — {svc.get('terminalCondition', {}).get('state', '?')}")


def main() -> int:
    apply = "--apply" in sys.argv
    key_path = DEFAULT_KEY
    if not os.path.isfile(key_path):
        print(f"Missing service account key: {key_path}")
        print("Set GOOGLE_APPLICATION_CREDENTIALS or place key at default path.")
        return 1

    token = get_access_token(key_path)
    print(f"Mode: {'APPLY (disable legacy triggers)' if apply else 'AUDIT ONLY'}")

    audit_triggers(token, PRODUCTION, apply)
    audit_cloud_run(token, PRODUCTION, "asia-south1")
    audit_cloud_run(token, PRODUCTION, "us-central1")

    audit_triggers(token, LEGACY, apply)
    audit_cloud_run(token, LEGACY, "us-central1")

    if not apply:
        print("\nRe-run with --apply to disable LEGACY triggers on projects you can access.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
