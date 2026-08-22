with open('src/context/AppContext.tsx', 'r') as f:
    text = f.read()

# 1. Update signup to use pending_review
text = text.replace(
    "accountStatus: 'active',",
    "accountStatus: 'pending_review',"
)

# 2. Update login to block pending_review
login_check = """
    if (user.accountStatus === 'pending_review') {
      return { success: false, message: 'حسابك قيد المراجعة. سيتم تفعيل حسابك من قبل الإدارة قريباً (خلال 1-6 ساعات).' };
    }
    if (user.accountStatus === 'suspended') {
"""
if "user.accountStatus === 'pending_review'" not in text:
    text = text.replace(
        "if (user.accountStatus === 'suspended') {",
        login_check
    )

with open('src/context/AppContext.tsx', 'w') as f:
    f.write(text)

print("AppContext.tsx updated.")
