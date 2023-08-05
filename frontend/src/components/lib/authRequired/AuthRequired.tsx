import { Container } from '@mui/material';
import { FunctionComponent, ReactElement, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { AuthFacade } from '../../../utils/auth/AuthFacade';
import Loader from '../loader/Loader';

import './authRequired.scss';

interface AuthRequiredProps {
    children: ReactElement;
}

const AuthRequired: FunctionComponent<AuthRequiredProps> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [userIsLogged, setUserIsLogged] = useState<boolean>();
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();
        AuthFacade.isLoggedIn({ signal: controller.signal })
            .then((userIsLogged) => {
                setLoading(false);
                setUserIsLogged(userIsLogged);
            })
            .catch((e) => {
                navigate('/error');
            });
        
        return () => controller.abort();
    }, []);
    return (
        <>
            {loading && (<Container maxWidth='xs' className='loaderContainer'>
                <Loader loading={loading} size={100} />
            </Container>)}
            {userIsLogged === true ? children : userIsLogged === false ? <Navigate to={'/auth'} replace={true}/> : <></>}
        </>
    );
};

export default AuthRequired;
