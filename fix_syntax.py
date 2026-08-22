import re

with open('src/components/StudentSignUpPage.tsx', 'r') as f:
    text = f.read()

text = text.replace(
    ");\n        setEmailError(true);\n        );",
    ");\n        setEmailError(true);"
)

with open('src/components/StudentSignUpPage.tsx', 'w') as f:
    f.write(text)
