import { Link } from "react-router-dom";
import Img from "./Img";

export default function ButtonSection({
  icon = "home-1",
  text = "Omluvenky",
  to = "/",
  className = "",
}) {
  const rootClassName = `button-section ${className}`.trim();

  return (
    <Link className={rootClassName} to={to}>
      <div className="button-section__icon-hold">
        <Img
          src={`/img/icons/${icon}.png`}
          alt={icon}
          className="button-section__icon"
        />
      </div>
      <div className="button-section__text-hold">
        <span className="button-section__text">{text}</span>
      </div>
    </Link>
  );
}
