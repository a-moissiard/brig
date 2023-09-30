import { FtpServersApi } from '../../api/ftpServers/FtpServersApi';
import { setProgress, setTransferCompleted } from '../../redux/features/transferActivity/transferActivitySlice';
import { AppDispatch } from '../../redux/store';
import { EVENT_TYPE, IProgressEventData } from '../../types/sse/EventTypes';

export class ProgressTracking {
    public static setupProgressTracking(dispatch: AppDispatch): void {
        void FtpServersApi.trackProgress((event): void => {
            if (event.event === EVENT_TYPE.PROGRESS) {
                const eventData = JSON.parse(event.data) as IProgressEventData;
                dispatch(setProgress({
                    currentFileName: eventData.name,
                    currentFileBytes: eventData.bytes,
                    currentFileProgress: eventData.progress,
                }));
            } else if (event.event === EVENT_TYPE.TRANSFER_COMPLETED) {
                dispatch(setTransferCompleted());
            }
        });
    };
}
