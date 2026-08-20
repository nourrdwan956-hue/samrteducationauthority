const fs = require('fs');
const path = 'src/context/AppContext.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetRegex = /\/\/ Add to user enrolled courses\s*const updatedUser = \{/;

const replacement = `if (finalPrice > 0) {
      const currentBalance = currentUser.walletBalance || 0;
      if (currentBalance < finalPrice) {
        addToast('error', 'رصيد المحفظة غير كافٍ', 'يرجى شحن محفظتك أو التواصل مع المعلم للحصول على كود خصم.');
        return { success: false, message: 'رصيد المحفظة غير كافٍ.' };
      }
    }

    // Add to user enrolled courses
    const updatedUser = {
      ...currentUser,
      walletBalance: Math.max(0, (currentUser.walletBalance || 0) - finalPrice),`;

content = content.replace(targetRegex, replacement);
fs.writeFileSync(path, content);
console.log('Fixed enrollInCourse wallet deduction');
