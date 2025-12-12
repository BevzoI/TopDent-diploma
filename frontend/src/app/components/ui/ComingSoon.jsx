import Img from "./Img";

export default function ComingSoon() {

  return (
    <div className="coming-soon">
        <Img src="./img/in-progress.png" alt="Coming Soon" className="coming-soon__img" />
        <h2 className="coming-soon__text">Tato sekce je momentálně ve vývoji. <br />Brzy bude dostupná.</h2>
    </div>
  )
}