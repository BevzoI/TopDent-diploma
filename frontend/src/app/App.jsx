import { lazy } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import BodyClass from "./components/layout/BodyClass";
import AppInit from "./components/layout/AppInit";
import AuthContext from "./context/AuthContext";
import ComingSoonPage from "./pages/ComingSoonPage";

// 🔥 ДОДАЛИ
const InvitePage = lazy(() => import("./pages/InvitePage"));

const Home = lazy(() => import("./pages/Home"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const Weekend = lazy(() => import("./pages/weekend/Weekend"));
const WeekendForm = lazy(() => import("./pages/weekend/WeekendForm"));
const News = lazy(() => import("./pages/news/News"));
const NewsForm = lazy(() => import("./pages/news/NewsForm"));
const Contacts = lazy(() => import("./pages/contacts/Contacts"));
const ContactsForm = lazy(() => import("./pages/contacts/ContactsForm"));
const ChatList = lazy(() => import("./pages/chat/ChatList"));
const ChatView = lazy(() => import("./pages/chat/ChatView"));
const ChatForm = lazy(() => import("./pages/chat/ChatForm"));
const CoursesList = lazy(() => import("./pages/courses/CoursesList"));
const CourseForm = lazy(() => import("./pages/courses/CourseForm"));
const CourseChoice = lazy(() => import("./pages/courses/CourseChoice"));
const PollList = lazy(() => import("./pages/poll/PollList"));
const PollForm = lazy(() => import("./pages/poll/PollForm"));
const PollAnswers = lazy(() => import("./pages/poll/PollAnswers"));
const EventList = lazy(() => import("./pages/events/EventList"));
const EventForm = lazy(() => import("./pages/events/EventForm"));
const EventAnswers = lazy(() => import("./pages/events/EventAnswers"));

function AppRoutes() {
  return (
    <Routes>

      {/* 🔥 INVITE ROUTE БЕЗ LAYOUT */}
      <Route path="/invite/:token" element={<InvitePage />} />

      {/* 🔒 ВСЕ ІНШЕ ЧЕРЕЗ LAYOUT */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />

        <Route path="weekend">
          <Route index element={<Weekend />} />
          <Route path="add" element={<WeekendForm />} />
          <Route path="edit/:id" element={<WeekendForm />} />
        </Route>

        <Route path="news">
          <Route index element={<News />} />
          <Route path="add" element={<NewsForm />} />
          <Route path="edit/:id" element={<NewsForm />} />
        </Route>

        <Route path="contacts">
          <Route index element={<Contacts />} />
          <Route path="add" element={<ContactsForm />} />
          <Route path="edit/:id" element={<ContactsForm />} />
        </Route>

        <Route path="chat">
          <Route index element={<ChatList />} />
          <Route path=":id" element={<ChatView />} />
          <Route path="create" element={<ChatForm />} />
          <Route path="edit/:id" element={<ChatForm />} />
        </Route>

        <Route path="courses">
          <Route index element={<CoursesList />} />
          <Route path="choice/:id" element={<CourseChoice />} />
          <Route path="add" element={<CourseForm />} />
          <Route path="edit/:id" element={<CourseForm />} />
        </Route>

        <Route path="poll">
          <Route index element={<PollList />} />
          <Route path="answers/:id" element={<PollAnswers />} />
          <Route path="add" element={<PollForm />} />
          <Route path="edit/:id" element={<PollForm />} />
        </Route>

        <Route path="events">
          <Route index element={<EventList />} />
          <Route path="add" element={<EventForm />} />
          <Route path="edit/:id" element={<EventForm />} />
          <Route path="answers/:id" element={<EventAnswers />} />
        </Route>

        <Route path="coming-soon" element={<ComingSoonPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthContext>
        <BodyClass />
        <AppInit>
          <AppRoutes />
        </AppInit>
      </AuthContext>
    </BrowserRouter>
  );
}