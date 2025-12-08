import { lazy } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import BodyClass from "./components/layout/BodyClass";
import AppInit from "./components/layout/AppInit";
import AuthContext from "./context/AuthContext";

const Home = lazy(() => import("./pages/Home"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const Omluvenky = lazy(() => import("./pages/Omluvenky"));
const Vyplatnipaska = lazy(() => import("./pages/VyplatniPaska"));
const News = lazy(() => import("./pages/news/News"));
const NewsForm = lazy(() => import("./pages/news/NewsForm"));
const UserEdit = lazy(() => import("./pages/UserEdit"));
const Contacts = lazy(() => import("./pages/contacts/Contacts"));
const ContactsForm = lazy(() => import("./pages/contacts/ContactsForm"));

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="omluvenky" element={<Omluvenky />} />
        <Route path="vyplatni-paska" element={<Vyplatnipaska />} />
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
        {/* <Route path="zpravy" element={<zpravy />} /> */}
        {/* <Route path="dotazniky" element={<dotazniky />} /> */}
        {/* <Route path="dovolena" element={<dovolena />} /> */}
        {/* <Route path="kurzy" element={<kurzy />} /> */}
        {/* <Route path="fotogalerie" element={<fotogalerie />} /> */}
        {/* <Route path="akce" element={<akce />} /> */}
        {/* <Route path="pridat" element={<pridat />} /> */}

        <Route path="*" element={<ErrorPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <>
      <BrowserRouter>
        <AuthContext>
          <BodyClass />
          <AppInit>
            <AppRoutes />
          </AppInit>
        </AuthContext>
      </BrowserRouter>
    </>
  );
}