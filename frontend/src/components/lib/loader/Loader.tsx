import { FunctionComponent } from 'react';
import { PuffLoader } from 'react-spinners';

interface ILoaderProps {
    loading: boolean;
    size: number;
}

const Loader: FunctionComponent<ILoaderProps> = ({ loading, size }) =>
    <PuffLoader
        loading={loading}
        size={size}
        color='white'
    />;

export default Loader;
