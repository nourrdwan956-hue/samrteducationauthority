import re

with open('src/components/SuperAdminDashboard.tsx', 'r') as f:
    text = f.read()

# The inserted block text:
block_regex = r'        <button \n          onClick=\{\(\) => setActiveTab\(\'pending_approvals\'\)\}.*?        </button> \n'

cleaned = re.sub(block_regex, '', text, flags=re.DOTALL)

with open('src/components/SuperAdminDashboard.tsx', 'w') as f:
    f.write(cleaned)
print(len(cleaned))
