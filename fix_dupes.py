import re

with open('src/components/SuperAdminDashboard.tsx', 'r') as f:
    content = f.read()

# We will just remove the whole block of `<button onClick={() => setActiveTab('pending_approvals')} ... </button>` completely.
pattern = r'[ \t]*<button[ \t\n]*onClick=\{\(\) => setActiveTab\(\'pending_approvals\'\)\}[ \t\n]*.*?</button>[ \t\n]*'
new_content = re.sub(pattern, '\n', content, flags=re.DOTALL)

# And remove 'pending_approvals' from the type definition
new_content = new_content.replace(" | 'pending_approvals'", "")

with open('src/components/SuperAdminDashboard.tsx', 'w') as f:
    f.write(new_content)

print(f"Original: {len(content)}, New: {len(new_content)}")
