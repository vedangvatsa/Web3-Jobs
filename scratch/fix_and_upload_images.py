import json
import os
import subprocess
import requests

def upload_to_catbox(file_path):
    with open(file_path, 'rb') as f:
        files = {'fileToUpload': f}
        data = {'reqtype': 'fileupload'}
        response = requests.post('https://catbox.moe/user/api.php', data=data, files=files)
        response.raise_for_status()
        return response.text.strip()

def main():
    schedule_path = 'scripts/social/content-schedule.json'
    with open(schedule_path, 'r') as f:
        schedule = json.load(f)

    os.makedirs('scratch/images', exist_ok=True)
    
    updated_count = 0
    for post in schedule:
        if post.get('id', '').startswith('viral_') and 'imageUrl' in post:
            url = post['imageUrl']
            if 'i.redd.it' in url or 'catbox.moe' not in url:
                print(f"Processing image for {post['id']}: {url}")
                # 1. Download
                filename = url.split('/')[-1]
                local_path = f"scratch/images/{filename}"
                
                # Check if it's already downloaded (to speed up retries)
                if not os.path.exists(local_path):
                    r = requests.get(url)
                    with open(local_path, 'wb') as f:
                        f.write(r.content)
                
                # 2. Run fix-ig-ratio.py
                print(f"  Running fix-ig-ratio on {local_path}...")
                subprocess.run(['python3', 'scripts/social/fix-ig-ratio.py', local_path], check=True)
                
                # The script appends '_ig' to the filename
                name, ext = os.path.splitext(local_path)
                ig_path = f"{name}_ig{ext}"
                
                if os.path.exists(ig_path):
                    print(f"  Uploading {ig_path} to catbox...")
                    # 3. Upload to catbox
                    new_url = upload_to_catbox(ig_path)
                    print(f"  New URL: {new_url}")
                    
                    # 4. Update JSON
                    post['imageUrl'] = new_url
                    updated_count += 1
                else:
                    print(f"  Error: {ig_path} was not created!")

    if updated_count > 0:
        with open(schedule_path, 'w') as f:
            json.dump(schedule, f, indent=2)
        print(f"\nSuccessfully padded and uploaded {updated_count} images.")
    else:
        print("\nNo images needed processing.")

if __name__ == "__main__":
    main()
