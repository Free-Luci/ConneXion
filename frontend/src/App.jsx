import "./App.css";
import Signup from "./components/Signup";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Home from "./components/Home";
import Login from "./components/Login";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfille";
import ChatPage from "./components/ChatPage";
import ProtectedRoutes from "./components/ProtectedRoutes";

import { io } from "socket.io-client";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOnlineUsers } from "./redux/chatSlice";
import { setLikeNotification } from "./redux/rtnSlice";

/* ---------------- ROUTES ---------------- */

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <MainLayout />
      </ProtectedRoutes>
    ),
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoutes>
            <Home />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/profile/:id",
        element: (
          <ProtectedRoutes>
            <Profile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/account/edit",
        element: (
          <ProtectedRoutes>
            <EditProfile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/chat",
        element: (
          <ProtectedRoutes>
            <ChatPage />
          </ProtectedRoutes>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

/* ---------------- APP ---------------- */

function App() {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  // 🔐 socket references (StrictMode safe)
  const socketRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    // 🚫 Prevent double initialization (StrictMode)
    if (initializedRef.current) return;
    initializedRef.current = true;

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      query: { userId: user._id },
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;
    window.socket = socket; // optional global access

    /* ---------- SOCKET EVENTS ---------- */

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("notification", (notification) => {
      dispatch(setLikeNotification(notification));
    });

    socket.on("disconnect", (reason) => {
      console.warn("❌ Socket disconnected:", reason);
    });

    /* ---------- CLEANUP ---------- */
    return () => {
      socket.disconnect();
      socketRef.current = null;
      window.socket = null;
      initializedRef.current = false;
    };
  }, [user, dispatch]);

  return <RouterProvider router={browserRouter} />;
}

export default App;
