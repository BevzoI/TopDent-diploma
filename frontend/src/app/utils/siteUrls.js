export const siteUrls = {
    home: "/",

    news: "/news",
    addNews: "/news/add",
    editNews: (id) => `/news/edit/${id}`,

    contacts: "/contacts",
    addContacts: "/contacts/add",
    editContacts: (id) => `/contacts/edit/${id}`,

    chat: "/chat",
    addChat: "/chat/create",
    viewChat: (id) => `/chat/${id}`,
    editChat: (id) => `/chat/edit/${id}`,

    courses: "/courses",
    addCourse: "/courses/add",
    editCourse: (id) => `/courses/edit/${id}`,
    viewCourseChoice: (id) => `/courses/choice/${id}`,
};

export const filePath = {
    avatars: "/img/avatars/",
}