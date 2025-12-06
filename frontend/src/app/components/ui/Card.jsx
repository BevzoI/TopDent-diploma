export default function Card() {
  return (
    <div className="card">
        <div className="card__header d-flex flex-between flex-items-center gap-4 mb-8">
            <div className="card__header-left">
                <div className="card__header-user">Od: Pendak Bohdan</div>
                <div className="card__header-date">29.10.2025 v 19:50</div>
            </div>
            <div className="card__header-right">
                <button className="btn btn-sm btn-yellow card__header-btn">Čeká na potvrzení</button>
            </div>
        </div>
        <div className="card__body d-flex flex-between flex-items-start gap-4">
            <div className="card__body-left">
                <div className="card__body-item">
                    <p className="card__body-item-label">V termínu:</p>
                    <p className="card__body-item-value">01.12.2025</p>
                </div>
                <div className="card__body-item">
                    <p className="card__body-item-label">Z důvodu:</p>
                    <p className="card__body-item-value">Prohlídká u doktora</p>
                </div>
                <div className="card__body-item">
                    <p className="card__body-item-label">Parametr:</p>
                    <p className="card__body-item-value">Celý den</p>
                </div>
            </div>
            <div className="card__body-right d-flex flex-column flex-align-start gap-8">
                <button className="btn btn-sm btn-green card__body-btn">Potvrdit</button>
                <button className="btn btn-sm btn-red card__body-btn">Odmítnout</button>
            </div>
        </div>
    </div>
  )
}
