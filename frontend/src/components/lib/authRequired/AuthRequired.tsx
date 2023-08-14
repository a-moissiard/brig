import { Container } from '@mui/material';
import { FunctionComponent, ReactElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { IUser } from '../../../types/users/UsersTypes';
import { AuthFacade } from '../../../utils/auth/AuthFacade';
import { BRIG_FRONT_ERROR_CODE, BrigFrontError } from '../../../utils/error/BrigFrontError';
import Loader from '../loader/Loader';

import './authRequired.scss';

interface AuthRequiredProps {
    user: IUser | undefined;
    setUser: React.Dispatch<React.SetStateAction<IUser | undefined>>;
    children: ReactElement;
}

const AuthRequired: FunctionComponent<AuthRequiredProps> = ({
    user,
    setUser,
    children,
}) => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();
        AuthFacade.getLoggedUser({ signal: controller.signal })
            .then((loggedUser) => {
                setLoading(false);
                setUser(loggedUser);
            })
            .catch((e) => {
                if (e instanceof BrigFrontError && e.code === BRIG_FRONT_ERROR_CODE.REQUEST_401) {
                    navigate('/auth');
                } else {
                    navigate('/error');
                }
            });
        
        return () => controller.abort();
    }, []);
    
    return (
        <>
            {loading && (<Container maxWidth='xs' className='loaderContainer'>
                <Loader loading={loading} size={100} />
            </Container>)}
            {user ? children : <></>}
        </>
    );
};

export default AuthRequired;
