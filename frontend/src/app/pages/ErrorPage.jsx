import { Link } from "react-router-dom";
import { Img } from "../components/ui";

export default function ErrorPage() {
  return (
    <div className="error-page">
      <Img src="/img/error-404.png" alt="Error 404 - Page Not Found" className="page-error-img" />
      <h2 className="page-error-title mb-20">Stránka ve vývoji</h2>
      <Link to="/" className="btn">Zpět na hlavní stránku</Link>
    </div>
  )
}
