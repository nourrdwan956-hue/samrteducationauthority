lines = []
with open('src/components/SuperAdminDashboard.tsx', 'r') as f:
    lines = f.readlines()

out = []
skip = False
for line in lines:
    if "onClick={() => setActiveTab('pending_approvals')}" in line:
        # we found a duplicate button start. We will skip lines until we find </button>
        # but wait, the <button was on the previous line!
        pass

# Actually, it's easier to just find the exact line numbers.
