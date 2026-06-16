import os
import re

search_dir = r"C:\Users\Administrator\.gemini\antigravity\scratch\vivastore"
ignore_dirs = {".next", "node_modules", ".git", "dist", "build"}
ignore_files = {"package-lock.json", "search_branding.py"}

terms = [
    (re.compile(r"Thanh\s+Hương", re.IGNORECASE), "Thanh Huong (VN)"),
    (re.compile(r"Thanh\s+Huong", re.IGNORECASE), "Thanh Huong (ASCII)"),
    (re.compile(r"Hoàng\s+Hải\s+Store", re.IGNORECASE), "Hoang Hai Store (VN)"),
    (re.compile(r"Hoang\s+Hai\s+Store", re.IGNORECASE), "Hoang Hai Store (ASCII)"),
    (re.compile(r"hhsneaker", re.IGNORECASE), "hhsneaker"),
    (re.compile(r"thanhhuongstore", re.IGNORECASE), "thanhhuongstore"),
    (re.compile(r"vivastore", re.IGNORECASE), "vivastore"),
]

matches = []

for root, dirs, files in os.walk(search_dir):
    # Prune ignored directories
    dirs[:] = [d for d in dirs if d not in ignore_dirs]
    
    for file in files:
        if file in ignore_files:
            continue
            
        file_path = os.path.join(root, file)
        ext = os.path.splitext(file)[1].lower()
        if ext not in {".ts", ".tsx", ".js", ".json", ".md", ".css", ".html", ".env", ".example"}:
            continue
            
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                
            found_labels = []
            for pattern, label in terms:
                if pattern.search(content):
                    found_labels.append(label)
            
            if found_labels:
                rel_path = os.path.relpath(file_path, search_dir)
                matches.append((rel_path, found_labels))
        except Exception as e:
            pass

print(f"Found {len(matches)} files containing target terms:")
for rel_path, labels in sorted(matches):
    print(f" - {rel_path} (Contains: {', '.join(labels)})")
