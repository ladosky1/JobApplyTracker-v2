**JOB APPLY TRACKER(Fullstack Version)**

A job application tracking system that evolved from a frontend only interface into a fullstack application with authentication, persistent storage and backend driven logic.

**Project Evolution**
This project initially started as a frontend only app using mock data and local state.
It was later rebuilt into a fullStack system, introducing:

*Backend Api*
*Database Persistence*
*Authentication system*
*User-specific data handling*

This reflects a real world progression from UI prototype to production oriented application.

**Tech Stack**

*FRONTEND*

--React(vite)
--Context API(state management)
--React Router
--Tailwind CSS
--Axios

*Backend*

--Node.js
--Express.js
--MongoDB + Mongoose(database)

*Other Tools*

--JWT(Authorization Bearer)
--REST API architecture
--react-hot-toast(UI feedback)

**Authentication System**

The application uses JWT-based authentication with Authorization Bearer tokens.

Implementation:
--User logs in or register >>> backend returns a JWT
--Token is stored on the client
--Every Request includes: (Authorization: Bearer <token>)
--Backend middleware verifies token before granting access

*Features*

--Secure login & registration
--Protected API Routes
--Persistent user session(clients-managed)
--Logout clears token

**Core Features**
*User*
--Register Account
--Login/Logout
--Session Persistence

*Job Management*
--Add job applications
--Update job status(Applied, Interview, Rejected, Offer)
--Delete jobs
--Categorize jobs(Technology, Hospitaly, Retail)
--Add notes per jobs

*Filtering & Search*
--Filter by status
--filter by category
--Search by company

**Architecture**
*Context-based State Management*
--AuthContext >>> handles authentication states
--JobContext >>> handles job CRUD operation

clear separation between authentication logic and application data.

**API Logic**
--Centralized Axios Instance
--Authorization header injection
--Clean separation between frontend and backend

**Async Handling & UX feedback**
--Custom asynchandler utility
--Centralized toast notificatons:
	-Success
	-Loading
	-Error
Reduces repetitive try/catch logic and improves UX consistency

**Authentication Engineering Decision**
*Cookie Vs Bearer Token Authentication*

I initially implemented cookie-based authentication but encountered cross-platform inconsistencies on my mobile browser(iOS). Instead of forcing a fragile setup, I switched to Bearer Token authentication, which provided:

--Predictable behaviour across device
--simpler debugging
--More reliable auth flow
--Cleaner frontend-backend contract

*Cons: Token require manual storage and management on client*

**Key Takeaways**

--Moving from frontend to fullstack introduces real complexity:
	--Async flows
	--state consistency
	--authentication lifecycle
--Proper Architecture matters early
--debugging backend issues is as critical as UI development
--Clean error handling significantly improves user experience

*Demo*
https://jobapplytracker-v2.netlify.app/

**Future Improvements**

--Token expiration handling
--Password policy enforcements(Require 8+ characters at least 1 number and 1 alphabet to prevent weak accounts)
--Email Verifictaion(send confirmation link on signup to verify ownership and reduce spam accounts)
--Forgot Password flow
--Interview Reminders
--Analytics Dashboard
--Export CSV/Excel

**Author** 

Oladoja Basit 

**Final Note**
This project demonstrates the transition from building static interfaces to designing a functional fullstack system with real world constraints and trade-off.



