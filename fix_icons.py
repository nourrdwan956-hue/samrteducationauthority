with open('src/components/StudentSignUpPage.tsx', 'r') as f:
    text = f.read()

import_statement = "import { useApp } from '../context/AppContext';"

if "Camera" not in text[:text.find(';') + 500]:
    text = text.replace(
        "ShieldCheck,",
        "ShieldCheck, Camera, Loader2,"
    )

with open('src/components/StudentSignUpPage.tsx', 'w') as f:
    f.write(text)
print("Icons patched.")
