import React, { useEffect, useState } from 'react';
import { Alert } from 'antd';
import PropTypes from 'prop-types';

const SafeAlert = ({
  message = "Alert",
  description,
  type = "info",
  closable = true,
  autoDismiss = null,
  onClose = () => {},
  style = {},
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onClose]);

  const getDescription = () => {
    if (typeof description === 'string') return description;
    if (description instanceof Error) return description.message;
    try {
      return JSON.stringify(description);
    } catch {
      return 'An unknown error occurred.';
    }
  };

  if (!visible) return null;

  return (
    <Alert
      message={message}
      description={getDescription()}
      type={type}
      showIcon
      closable={closable}
      onClose={() => {
        setVisible(false);
        onClose();
      }}
      style={{ marginBottom: 16, ...style }}
    />
  );
};

SafeAlert.propTypes = {
  message: PropTypes.string,
  description: PropTypes.any,
  type: PropTypes.oneOf(['success', 'info', 'warning', 'error']),
  closable: PropTypes.bool,
  autoDismiss: PropTypes.number,
  onClose: PropTypes.func,
  style: PropTypes.object,
};

export default SafeAlert;
