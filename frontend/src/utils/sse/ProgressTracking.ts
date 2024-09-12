import { FtpServersApi } from '../../api/ftpServers/FtpServersApi';
import { setProgress, setTransferStatus } from '../../redux/features/transferActivity/transferActivitySlice';
import { AppDispatch } from '../../redux/store';
import { EVENT_TYPE, IProgressEventData } from '../../types/sse/EventTypes';
import { TRANSFER_STATUS } from '../../types/status';

export class ProgressTracking {
    public static setupProgressTracking(dispatch: AppDispatch): void {
        void FtpServersApi.trackProgress(
            {
                [EVENT_TYPE.PROGRESS]: (event: MessageEvent): void => {
                    const eventData = JSON.parse(event.data) as IProgressEventData;
                    dispatch(setProgress({
                        sourceFilePath: eventData.path,
                        fileBytes: eventData.bytes,
                        fileProgress: eventData.progress,
                    }));
                },
                [EVENT_TYPE.TRANSFER_COMPLETED]: (): void => {
                    dispatch(setTransferStatus(TRANSFER_STATUS.COMPLETED));
                },
                [EVENT_TYPE.TRANSFER_CANCELED]: (): void => {
                    dispatch(setTransferStatus(TRANSFER_STATUS.CANCELED));
                },
            },
        );
    };
}
