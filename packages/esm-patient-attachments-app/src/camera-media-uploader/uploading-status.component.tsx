import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { showToast } from '@openmrs/esm-framework';
import styles from './uploading-status.scss';
import { FileUploaderItem, Button, ButtonSet, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';

interface UploadingStatusComponentProps {}

const UploadingStatusComponent: React.FC<UploadingStatusComponentProps> = () => {
  const { t } = useTranslation();
  const { filesToUpload, saveFile, closeModal, clearData, onCompletion } = useContext(CameraMediaUploaderContext);
  const [filesUploading, setFilesUploading] = useState([]);

  useEffect(() => {
    if (filesToUpload) {
      setFilesUploading(
        filesToUpload.map((file) => ({
          ...file,
          status: 'uploading',
        })),
      );
    }
  }, [filesToUpload, setFilesUploading]);

  useEffect(() => {
    Promise.all(
      filesToUpload.map((file, indx) =>
        saveFile(file)
          .then(() => {
            showToast({
              title: t('uploadComplete', 'Upload complete'),
              description: `${file.fileName} ${t('uploadedSuccessfully', 'uploaded successfully')}`,
              kind: 'success',
            });
            setFilesUploading((prevfilesToUpload) =>
              prevfilesToUpload.map((file, ind) =>
                ind === indx
                  ? {
                      ...file,
                      status: 'complete',
                    }
                  : file,
              ),
            );
          })
          .catch((err) => {
            showToast({
              title: `${t('uploading', 'Uploading')} ${file.fileName} ${t('failed', 'failed')}`,
              description: err,
              kind: 'error',
            });
          }),
      ),
    ).then(() => {
      true;
      onCompletion?.();
    });
  }, [onCompletion, saveFile, filesToUpload, t, setFilesUploading]);

  return (
    <div className={styles.cameraSection}>
      <ModalHeader className={styles.productiveHeading03}>{t('addAttachment', 'Add Attachment')}</ModalHeader>
      <ModalBody>
        <p className="cds--label-description">
          {t(
            'uploadWillContinueInTheBackground',
            'Files will be uploaded in the background. You can close this modal.',
          )}
        </p>

        <div className={styles.uploadingFilesSection}>
          {filesUploading.map((file, key) => (
            <FileUploaderItem key={key} name={file.fileName} status={file.status} size="lg" />
          ))}
        </div>
      </ModalBody>
      <ModalFooter>
        <ButtonSet className={styles.buttonSet}>
          <Button size="lg" kind="secondary" onClick={clearData}>
            {t('addMoreAttachments', 'Add more attachments')}
          </Button>
          <Button size="lg" kind="primary" onClick={closeModal}>
            {t('closeModal', 'Close')}
          </Button>
        </ButtonSet>
      </ModalFooter>
    </div>
  );
};

export default UploadingStatusComponent;
