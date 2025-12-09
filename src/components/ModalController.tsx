import { UploadModal } from './modals/UploadModal';
import { ProgressModal } from './modals/ProgressModal';
import { PageSelectModal } from './modals/PageSelectModal';
import { CompressOptionsModal } from './modals/CompressOptionsModal';
import { WatermarkModal } from './modals/WatermarkModal';
import { RotateModal } from './modals/RotateModal';
import { SuccessModal } from './modals/SuccessModal';
import { ErrorModal } from './modals/ErrorModal';
import { AboutModal } from './modals/AboutModal';

export const ModalController = () => {
  return (
    <>
      <UploadModal />
      <ProgressModal />
      <PageSelectModal />
      <CompressOptionsModal />
      <WatermarkModal />
      <RotateModal />
      <SuccessModal />
      <ErrorModal />
      <AboutModal />
    </>
  );
};
