import React from 'react';
import PropTypes from 'prop-types';

import { uploadAsset, uploadAssetSizes } from '../../utils/assets';
import { NotificationConsumer } from '../notifications';

const NotifyUploading = ({ progress }) => (
  <>
    Uploading asset
    <progress className="notify-progress" value={progress} />
  </>
);
const NotifyError = () => 'File upload failed. Try again in a few minutes?';

async function uploadWrapper(notifications, upload) {
  let result = null;
  let progress = 0;
  const {
    updateNotification,
    removeNotification,
  } = notifications.createPersistentNotification(
    <NotifyUploading progress={progress} />,
    'notifyUploading',
  );
  try {
    result = await upload(({ lengthComputable, loaded, total }) => {
      if (lengthComputable) {
        progress = loaded / total;
      } else {
        progress = (progress + 1) / 2;
      }
      updateNotification(<NotifyUploading progress={progress} />);
    });
  } catch (e) {
    notifications.createErrorNotification(<NotifyError />);
    throw e;
  } finally {
    removeNotification();
    notifications.createNotification('Image uploaded!');
  }
  return result;
}

const Uploader = ({ children }) => (
  <NotificationConsumer>
    {notifications => children({
      uploadAsset: (blob, policy, key) => uploadWrapper(notifications, cb => uploadAsset(blob, policy, key, cb)),
      uploadAssetSizes: (blob, policy, sizes) => uploadWrapper(notifications, cb => uploadAssetSizes(blob, policy, sizes, cb)),
    })
    }
  </NotificationConsumer>
);
Uploader.propTypes = {
  children: PropTypes.func.isRequired,
};
export default Uploader;
