import { useState, useEffect } from "react";
import { Button, Badge } from "rsuite";
import CheckIcon from "@rsuite/icons/Check";

import { useAuthContext } from "../context/AuthContext";
import { apiRequest, apiUrl } from "../utils/apiData";

export default function AnswerButtons({
  type,          // 'poll' | 'events' | 'courses'
  itemId,        // pollId / eventId / courseId
  initialAnswers = [],
  yesLabel = "Ano",
  noLabel = "Ne",
}) {
  const { user } = useAuthContext();
  const userId = user?._id;

  const [selected, setSelected] = useState(null);

  // Load initial state
  useEffect(() => {
    const answer = initialAnswers.find(a => a.userId === userId);
    if (answer) {
      setSelected(answer.value);
    }
  }, [initialAnswers, userId]);

  const sendAnswer = async (value) => {
    setSelected(value);

    await apiRequest(
      `${apiUrl[type]}/${itemId}/answer`,
      "PATCH",
      { userId, value }
    );
  };

  // Badge wrapper
  const WithBadge = ({ active, children }) => {
    if (!active) return children;
    return (
      <Badge
        compact
        color="green"
        placement="bottomEnd"
        content={<CheckIcon />}
      >
        {children}
      </Badge>
    );
  };

  return (
    <div className="d-flex gap-8 mt-12">
      <WithBadge active={selected === "yes"}>
        <Button
          appearance={selected === "yes" ? "primary" : "ghost"}
          color="green"
          onClick={() => sendAnswer("yes")}
        >
          {yesLabel}
        </Button>
      </WithBadge>

      <WithBadge active={selected === "no"}>
        <Button
          appearance={selected === "no" ? "primary" : "ghost"}
          color="red"
          onClick={() => sendAnswer("no")}
        >
          {noLabel}
        </Button>
      </WithBadge>
    </div>
  );
}
