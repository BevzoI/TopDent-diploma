import User from "../models/User.js";
import Weekend from "../models/Weekend.js";
import News from "../models/News.js";
import Chat from "../models/Chat.js";
import Poll from "../models/Poll.js";
import Course from "../models/Course.js";
import Event from "../models/Event.js";

// GET /notifications/:userId
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Користувача не знайдено",
      });
    }

    //
    // WEEKEND — статус змінено після lastWeekendCheck
    //
    const weekend = await Weekend.exists({
      userId,
      updatedAt: { $gt: user.lastWeekendCheck || new Date(0) }
    });

    //
    // NEWS — є нові новини після lastNewsCheck
    //
    const news = await News.exists({
      publish: "show",
      createdAt: { $gt: user.lastNewsCheck || new Date(0) }
    });

    //
    // CHAT — нові повідомлення після lastChatCheck
    //
    const chat = await Chat.exists({
      members: userId,
      "messages.createdAt": { $gt: user.lastChatCheck || new Date(0) }
    });

    //
    // POLL — є показані опитування, де user ще не відповів
    //
    const poll = await Poll.exists({
      publish: "show",
      users: userId,
      "answers.userId": { $ne: userId }
    });

    //
    // COURSES — користувач не відповів на курс
    //
    const courses = await Course.exists({
      publish: "show",
      users: userId,
      "answers.userId": { $ne: userId }
    });

    //
    // EVENTS — користувач не відповів на подію
    //
    const events = await Event.exists({
      publish: "show",
      users: userId,
      "answers.userId": { $ne: userId }
    });

    //
    // SUCCESS RESPONSE
    //
    return res.json({
      status: "success",
      data: {
        weekend: Boolean(weekend),
        news: Boolean(news),
        chat: Boolean(chat),
        poll: Boolean(poll),
        courses: Boolean(courses),
        events: Boolean(events),
      },
    });

  } catch (error) {
    console.error("Notifications error:", error);

    return res.status(500).json({
      status: "error",
      message: "Не вдалося отримати оповіщення",
    });
  }
};
