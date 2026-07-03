import os
import glob

hooks_dir = r"C:\Users\venka\Downloads\Stock builder\frontend\src\hooks"

for file in glob.glob(os.path.join(hooks_dir, "*.ts")):
    with open(file, "r") as f:
        content = f.read()
    
    if "fetch(" in content:
        if "fetchWithAuth" not in content:
            content = "import { fetchWithAuth } from '@/lib/api';\n" + content
        content = content.replace("await fetch(", "await fetchWithAuth(")
        
        with open(file, "w") as f:
            f.write(content)
        print(f"Updated {file}")
