with open('src/context/AppContext.tsx', 'r') as f:
    text = f.read()

text = text.replace(
    "accountStatus: 'verified',",
    "accountStatus: 'pending_review',"
)

with open('src/context/AppContext.tsx', 'w') as f:
    f.write(text)
print("AppContext patched.")
