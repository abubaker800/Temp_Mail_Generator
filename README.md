Temp-Mail Generator
A modern, fast, and secure temporary email generator built with React and Tailwind CSS. This application leverages the Mail.tm API to provide users with fully functional, disposable email addresses to protect their primary inbox from spam.

✨ Features
Instant Email Generation: Automatically generates a unique temporary email address upon page load.

Real-time Inbox: Features an auto-polling system that checks for new messages every 5 seconds.

Message Preview: View full HTML or text content of incoming emails securely.

Secure Content: Uses DOMPurify to safely render email content and prevent XSS attacks.

Modern UI: A beautiful, responsive glassmorphism design with dark mode and animated gradients.

One-Click Copy: Quickly copy your temporary address to the clipboard.

🚀 Technologies Used
React: Frontend framework for the user interface.

Tailwind CSS: For styling and responsive design.

Lucide React: For sleek, consistent iconography.

Mail.tm API: Backend service for email account creation and message retrieval.

DOMPurify: For sanitizing HTML email bodies.

Vite: Build tool for a fast development experience.

🛠️ Installation & Setup
1:-Clone the repository:
    Bash
        git clone https://github.com/abubaker800/Temp-Mail-Generator.git
        cd ghost-mail
2:- Install dependencies:
     Bash
        npm install
3:- Run the development server:
    Bash
        npm run dev
          
📖 How it Works
The app interacts with the Mail.tm open API to:

Fetch available domains.

Create a randomized account with a secure password.

Authenticate and retrieve a JWT token for private access to the inbox.

Poll the /messages endpoint to display incoming mail in the sidebar.
