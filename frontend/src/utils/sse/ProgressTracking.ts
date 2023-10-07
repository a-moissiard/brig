import { FtpServersApi } from '../../api/ftpServers/FtpServersApi';
import { setProgress, setTransferStatus } from '../../redux/features/transferActivity/transferActivitySlice';
import { AppDispatch } from '../../redux/store';
import { EVENT_TYPE, IProgressEventData } from '../../types/sse/EventTypes';
import { TRANSFER_STATUS } from '../../types/status';

export class ProgressTracking {
    public static setupProgressTracking(dispatch: AppDispatch): void {
        void FtpServersApi.trackProgress((event): void => {
            if (event.event === EVENT_TYPE.PROGRESS) {
                const eventData = JSON.parse(event.data) as IProgressEventData;
                dispatch(setProgress({
                    fileName: eventData.name,
                    fileBytes: eventData.bytes,
                    fileProgress: eventData.progress,
                }));
            } else if (event.event === EVENT_TYPE.TRANSFER_COMPLETED) {
                dispatch(setTransferStatus(TRANSFER_STATUS.COMPLETED));
            }
        });
    };
}
