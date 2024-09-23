import { FtpServersApi } from '../../api/ftpServers/FtpServersApi';
import { setActivity, setProgress, setTransferStatus } from '../../redux/features/transferActivity/transferActivitySlice';
import { AppDispatch } from '../../redux/store';
import { EVENT_TYPE, IProgressEventData } from '../../types/sse/EventTypes';
import { TRANSFER_STATUS } from '../../types/status';

export class ProgressTracking {
    public static setupProgressTracking(dispatch: AppDispatch): void {
        void FtpServersApi.trackActivity(
            {
                [EVENT_TYPE.TRANSFER_STARTED]: (): void => {
                    FtpServersApi.getTransferActivity()
                        .then((transferActivity) => {
                            if (transferActivity) {
                                dispatch(setActivity({
                                    ...transferActivity,
                                    status: TRANSFER_STATUS.IN_PROGRESS,
                                    refreshNeeded: false,
                                }));
                            }
                        }).catch(() => {});
                },
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
                    FtpServersApi.getTransferActivity()
                        .then((transferActivity) => {
                            if (transferActivity) {
                                dispatch(setActivity({
                                    ...transferActivity,
                                    status: TRANSFER_STATUS.CANCELED,
                                    refreshNeeded: true,
                                }));
                            }
                        }).catch(() => {});
                },
            },
        );
    };
}
