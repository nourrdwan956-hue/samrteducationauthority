with open('src/types.ts', 'r') as f:
    text = f.read()

text = text.replace(
    "accountStatus: 'active' | 'suspended' | 'banned';",
    "accountStatus: 'active' | 'suspended' | 'banned' | 'pending_review';"
)

if "photoUrl?: string;" not in text:
    text = text.replace(
        "nationalId?: string;",
        "nationalId?: string;\n  photoUrl?: string;"
    )
    if "photoUrl?: string;" not in text:
        text = text.replace(
            "name: string;",
            "name: string;\n  photoUrl?: string;"
        )

with open('src/types.ts', 'w') as f:
    f.write(text)

print("types.ts updated.")
