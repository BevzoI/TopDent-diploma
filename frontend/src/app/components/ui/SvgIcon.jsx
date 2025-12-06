// ./img/icons/sprite.svg

export default function SvgIcon({ icon, className = '' }) {
  return (
	<svg className={`icon icon-${icon} ${className}`}>
		<use href={`/img/sprite.svg#icon-${icon}`}></use>
	</svg>
  )
}
