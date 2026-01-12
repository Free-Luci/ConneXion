ConneXion:-
ConneXion is a social media platform built to connect users through posts, images, and real-time interaction, similar to Instagram. The platform allows users to create profiles, share posts, follow others, like and comment on posts, and interact in real time with other users.
Demo Link:-
Features:-
•	User Authentication: Signup, login, and JWT-based authentication.
•	Profile Management: Users can edit their profile, including bio, profile picture, and more.
•	Post Creation: Users can create posts with captions and images.
•	Image Uploads: Post and profile images are uploaded using Cloudinary, with image processing using Sharp.
•	Likes & Comments: Users can like and comment on posts.
•	Follow System: Users can follow and unfollow others.
•	Real-time Notifications: Socket.IO is used for real-time notifications (e.g., new likes or comments).

Getting Started
To run the project locally, follow these instructions.
Prerequisites
•	Node.js (version >= 14)
•	MongoDB (local or remote)
•	Cloudinary account for image storage

Installation
1.	Clone the repository:
git clone
cd ConneXion
2.	Install the required dependencies:
npm install
3.	Set up environment variables. Create a .env file in the root directory and add the following
PORT=3000
MONGO_URI=<Your MongoDB URI>
CLOUDINARY_NAME=<Your Cloudinary Cloud Name>
CLOUDINARY_API_KEY=<Your Cloudinary API Key>
CLOUDINARY_API_SECRET=<Your Cloudinary API Secret>
JWT_SECRET=<Your JWT Secret>
4.	Start the development server: 
npm run dev
5.	Open the application at http://localhost:3000.
   
Setup Instructions:-
1.	Set up MongoDB and Cloudinary.
2.	Clone the repository and install dependencies.
3.	Run the development server as described in the Installation section.
   
Usage:-
Once set up, users can:
•	Create and manage their profiles.
•	Create posts with captions and images.
•	Like and comment on posts.
•	Follow other users to see their posts in the feed.
•	Receive real-time notifications for interactions like likes and comments.





