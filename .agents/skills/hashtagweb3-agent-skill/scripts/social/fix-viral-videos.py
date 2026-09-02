import json

file_path = "scripts/social/content-schedule.json"
with open(file_path, "r") as f:
    schedule = json.load(f)

# Map video IDs to their public URLs
video_urls = {
    "post_viral_coinbase_pizza": "https://files.catbox.moe/dveosg.mp4",
    "post_viral_crypto_sweats": "https://files.catbox.moe/fqvqr7.mp4",
    "post_viral_self_help_singh": "https://files.catbox.moe/zs8lq5.mp4",
}

updated = 0
for post in schedule:
    pid = post.get("id", "")
    if pid in video_urls:
        post["videoUrl"] = video_urls[pid]
        # Remove the local path reference
        if "videoUrl" in post and post["videoUrl"].startswith("scripts/"):
            pass  # will be overwritten
        post["videoUrl"] = video_urls[pid]
        updated += 1

with open(file_path, "w") as f:
    json.dump(schedule, f, indent=2)

print(f"Updated {updated} video posts with public URLs")
