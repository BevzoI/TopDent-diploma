import { Link } from 'react-router-dom';
import { Button, Heading, HeadingGroup } from 'rsuite';
import ArrowLeftLineIcon from "@rsuite/icons/ArrowLeftLine";

export default function PageHeader({
	className = "",
	headingClass = "",
	backButtonClass = "",
	headingLevel = 3,
	title = "",
	backTo = "/",
	showBack = true,
	children
}) {
	return (
		<HeadingGroup className={`page-header ${className}`}>
		{showBack && (
			<Button
			as={Link}
			to={backTo}
			className={`header-prev ${backButtonClass}`}
			startIcon={<ArrowLeftLineIcon />}
			appearance="subtle"
			>
			Vrátit se zpět
			</Button>
		)}

		<Heading level={headingLevel} className={headingClass}>
			{title}
		</Heading>

		{children}
		</HeadingGroup>
	);
}
