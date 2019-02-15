import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import InputErrorMessage from './input-error-message';
import InputErrorIcon from './input-error-icon';
import useUniqueId from './hook-unique-id';

import styles from './text-input.styl';

const TYPES = [
  'email',
  'password',
  'search',
  'text',
];

const TextInput = ({className, error, onChange, opaque, postfix, prefix, search, ...props}) => {
  const uniqueId = useUniqueId();
  const outerClassName = classNames(styles.outer, className);
  const borderClassName = classNames(styles.inputBorder, {
    [styles.underline]: !opaque,
    [styles.opaque]: opaque,
  });
  const inputClassName = classNames(styles.inputPart, styles.input, {
    [styles.search]: search,
  });
  return (
    <label className={outerClassName} htmlFor={uniqueId}>
      <div className={borderClassName}>
        {!!prefix && <span className={styles.inputPart}>{prefix}</span>}
        <input id={uniqueId} className={inputClassName} onChange={evt => onChange(evt.target.value)} {...props}/>
        {!!error && <InputErrorIcon/>}
        {!!postfix && <span className={styles.inputPart}>{postfix}</span>}
      </div>
      {!!error && <InputErrorMessage error={error}/>}
    </label>
  );
};

TextInput.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.node,
  name: PropTypes.string,
  onChange: PropTypes.func,
  opaque: PropTypes.bool,
  placeholder: PropTypes.string,
  postfix: PropTypes.node,
  prefix: PropTypes.node,
  search: PropTypes.bool,
  type: PropTypes.oneOf(TYPES),
  value: PropTypes.string,
};

TextInput.defaultProps = {
  className: undefined,
  disabled: undefined,
  error: null,
  name: undefined,
  onChange: undefined,
  opaque: PropTypes.bool,
  placeholder: PropTypes.string,
  postfix: PropTypes.node,
  prefix: PropTypes.node,
  search: PropTypes.bool,
  type: PropTypes.oneOf(TYPES),
  value: PropTypes.string,
};

export default TextInput;