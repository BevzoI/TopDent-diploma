import { useEffect } from "react";
import { ButtonSection } from "../components/ui";
import { useOutletContext } from "react-router-dom";
import { pagesList } from "../data/Pages";

export default function Home() {
    const { setHeaderData } = useOutletContext();
    
    useEffect(() => {
        setHeaderData({
            title: "TopDentTeam"
        });
    }, [setHeaderData]);

  return (
    <>
      {pagesList.map(({ icon, text, to }, i) => (
        <ButtonSection
          key={i}
          icon={icon}
          text={text}
          to={to}
        />
      ))}
    </>
  );
}
