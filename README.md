# বাড়ি ভাড়া ম্যানেজার – Free PWA

এটি বিনামূল্যের পরীক্ষামূলক, মোবাইল-ইনস্টলযোগ্য PWA। কোনো Node.js/Termux প্রয়োজন নেই।

## ফিচার
- বাড়ি/ইউনিট যোগ
- ভাড়াটিয়া ও স্থানীয় লগইন
- মাসিক ভাড়া/বিদ্যুৎ/গ্যাস/পানি/অন্যান্য বিল
- পেমেন্ট ও বকেয়া হিসাব
- হিসাব প্রিন্ট/PDF
- JSON ব্যাকআপ ও পুনরুদ্ধার
- PWA হোম স্ক্রিন ইনস্টল ও app-shell caching

## GitHub Pages-এ বিনামূল্যে প্রকাশ
1. ZIP Extract করুন।
2. GitHub-এ নতুন **Public** repository বানান।
3. এই ফোল্ডারের সব ফাইল ও `assets` ফোল্ডার repository-র root-এ upload করুন।
4. Repository → Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save।
5. প্রকাশিত `https://USERNAME.github.io/REPOSITORY/` URL Android Chrome-এ খুলুন।
6. Chrome ⋮ → Install app / Add to Home screen।

## ডেমো অ্যাডমিন
মোবাইল: `01700000000`
পাসওয়ার্ড: `ChangeMe123!`
প্রথমেই Settings থেকে পরিবর্তন করুন।

## অত্যন্ত গুরুত্বপূর্ণ সীমাবদ্ধতা
- সব তথ্য শুধু যে browser/device-এ প্রবেশ করানো হয়েছে তার localStorage-এ থাকে।
- ভাড়াটিয়া নিজের ফোনে লগইন করলে অ্যাডমিনের ডেটা দেখতে পাবে না। এই সংস্করণ cloud sync বা multi-device tenant portal নয়।
- Browser data clear করলে তথ্য মুছে যেতে পারে। নিয়মিত Settings থেকে JSON backup ডাউনলোড করে নিরাপদে রাখুন।
- এটি পরীক্ষামূলক MVP; সংবেদনশীল ব্যক্তিগত তথ্য বা আসল আর্থিক হিসাবের একমাত্র রেকর্ড হিসেবে ব্যবহার করবেন না।
- PDF-এর জন্য হিসাব পাতায় browser Print → Save as PDF ব্যবহার করুন।
