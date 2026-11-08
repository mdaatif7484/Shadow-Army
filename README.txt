# SHADOW ARMY Website

## Open the website
1. Extract `shadow-army-complete.zip`.
2. Open the `shadow-army-complete` folder in VS Code.
3. Open `index.html` in your browser, or install the **Live Server** extension and choose **Open with Live Server**.

## Demo features
- Responsive black-and-red SHADOW ARMY design
- Member cards and search
- Bounty leaderboard
- Crew statistics
- Battle records
- Announcements
- Join application form
- Demo admin mode for adding, editing and deleting members, battles and announcements
- Browser localStorage saves the demo data

## Important limitations
This is a front-end demo, not a secure online crew management system.
- Admin Mode is only a visual demo switch. Anyone can turn it on.
- Data is stored only in the current browser on the current device.
- Join applications are not sent to a crew admin.
- Members cannot securely log in or prove their identity.

Before publishing this website for real crew use, connect Firebase Authentication and Cloud Firestore and configure Firestore Security Rules. Never put a Firebase service-account private key in front-end code.
