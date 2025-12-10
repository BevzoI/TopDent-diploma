import { Link } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';

export default function ButtonAdd({link}) {
	const { user } = useAuthContext();

    return (
        <>
            {user?.role === "admin" && (
                <Link to={link} className="btn btn-icon btn-admin-action-add">
                    +
                </Link>
            )}
        </>
    );
}
