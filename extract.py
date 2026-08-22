import json

with open('/tmp/sourcemap.json', 'r') as f:
    data = json.load(f)

source = data['sourcesContent'][0]

with open('src/components/SuperAdminDashboard.tsx', 'w') as f:
    f.write(source)
