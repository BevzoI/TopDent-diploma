import { useEffect } from "react";
import { ButtonSection } from "../components/ui";
import { useOutletContext } from "react-router-dom";

export default function Home() {
    const { setHeaderData } = useOutletContext();
    
    useEffect(() => {
        setHeaderData({
            title: "TopDentTeam"
        });
    }, [setHeaderData]);

  const buttons = [
    { icon: "icon-1",  text: "Omluvenky",        to: "/omluvenky" },
    { icon: "icon-2",  text: "Nástěnka",         to: "/news" },
    { icon: "icon-3",  text: "Zprávy",           to: "/zpravy" },
    { icon: "icon-4",  text: "Dotazníky",        to: "/dotazniky" },
    // { icon: "icon-5",  text: "Dovolená",         to: "/dovolena" },
    // { icon: "icon-6",  text: "Výplatní páska",   to: "/vyplatni-paska" },
    { icon: "icon-7",  text: "Kurzy",            to: "/kurzy" },
    { icon: "icon-8",  text: "Kontakty",         to: "/contacts" },
    // { icon: "icon-9",  text: "Fotogalerie",      to: "/fotogalerie" },
    { icon: "icon-10", text: "Akce",             to: "/akce" },
    { icon: "icon-11", text: "Přidat",           to: "/pridat" },
  ];

  return (
    <>
      {buttons.map(({ icon, text, to }, i) => (
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
