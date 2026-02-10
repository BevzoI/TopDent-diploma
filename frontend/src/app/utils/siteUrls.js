
export const siteUrls = {
    home: "/",
    comingSoon: "/coming-soon",

    weekend: "/weekend",
    addWeekend: "/weekend/add",
    editWeekend: (id) => `/weekend/edit/${id}`,

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

    poll: "/poll",
    addPoll: "/poll/add",
    editPoll: (id) => `/poll/edit/${id}`,
    pollAnswers: (id) => `/poll/answers/${id}`,

    events: "/events",
    addEvent: "/events/add",
    editEvent: (id) => `/events/edit/${id}`,
    eventAnswers: (id) => `/events/answers/${id}`,
    
};

export const filePath = {
    avatars: "/img/avatars/",
}