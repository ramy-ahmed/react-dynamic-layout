import React, { useRef, useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import ResizeBar from './ResizeBar';
import { resizeBarTypes } from '../utils/enums';
import useMouseMove from '../hooks/useMouseMove';
import useContextLayout from '../hooks/useContextLayout';

const Float = (props) => {
  const {
    layoutEventsRef: { current: layoutEvents },
  } = useContextLayout();

  const addEventListener = useMouseMove();
  const elementRef = useRef();
  const {
    closeLabel,
    initialTop,
    initialLeft,
    initialWidth,
    initialHeight,
    isOpen,
    children,
    isFixedSize,
  } = props;

  const [{ top, left }, setPosition] = useState({
    top: initialTop,
    left: initialLeft,
  });

  const [{ width, height }, setSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });

  const style = {
    top,
    left,
    width,
    height,
  };

  const move = useCallback((position) => {
    setPosition(position);
  }, []);

  const onMouseDown = useCallback(
    (event) => {
      const { clientX, clientY } = event;
      addEventListener(move, {
        offset: {
          left: clientX - left,
          top: clientY - top,
        },
      });
    },
    [addEventListener, move, top, left],
  );

  const onSizeChange = useCallback(
    (diff) => {
      const {
        left: diffLeft = 0,
        right: diffRight = 0,
        top: diffTop = 0,
        bottom: diffBottom = 0,
      } = diff;

      setPosition({
        left: left + diffLeft,
        top: top + diffTop,
      });

      setSize({
        width: width - diffLeft - diffRight,
        height: height - diffTop - diffBottom,
      });

      layoutEvents.fire('resize');
    },
    [width, height, top, left, layoutEvents],
  );

  useEffect(() => {
    if (isOpen) {
      layoutEvents.fire('resize');
    }
  }, [isOpen, layoutEvents]);

  const className = classNames({
    'rdl-float': true,
    'rdl-float--open': isOpen,
  });

  return (
    <div ref={elementRef} style={style} className={className}>
      <div className="rdl-float__drag-bar" onMouseDown={onMouseDown}>
        <button aria-label={closeLabel} className="rdl-float__close">
          <svg
            viewBox="0 0 10 10"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="0"
              y1="10"
              x2="10"
              y2="0"
              stroke="black"
              strokeWidth="2"
            />
            <line
              x1="0"
              y1="0"
              x2="10"
              y2="10"
              stroke="black"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>
      {!isFixedSize ? (
        <>
          <ResizeBar onSizeChange={onSizeChange} type={resizeBarTypes.NORTH} />
          <ResizeBar onSizeChange={onSizeChange} type={resizeBarTypes.SOUTH} />
          <ResizeBar onSizeChange={onSizeChange} type={resizeBarTypes.EAST} />
          <ResizeBar onSizeChange={onSizeChange} type={resizeBarTypes.WEST} />
          <ResizeBar
            onSizeChange={onSizeChange}
            type={resizeBarTypes.NORTH_EAST}
          />
          <ResizeBar
            onSizeChange={onSizeChange}
            type={resizeBarTypes.NORTH_WEST}
          />
          <ResizeBar
            onSizeChange={onSizeChange}
            type={resizeBarTypes.SOUTH_WEST}
          />
          <ResizeBar
            onSizeChange={onSizeChange}
            type={resizeBarTypes.SOUTH_EAST}
          />
        </>
      ) : null}
      <div className="rdl-float__content">{children}</div>
    </div>
  );
};

Float.defaultProps = {
  isOpen: false,
  closeLabel: 'Close',
  isFixedSize: false,
  initialTop: 0,
  initialLeft: 0,
};

Float.propTypes = {
  isFixedSize: PropTypes.bool,
  children: PropTypes.node.isRequired,
  closeLabel: PropTypes.string,
  isModal: PropTypes.bool,
  isOpen: PropTypes.bool,
  initialWidth: PropTypes.number.isRequired,
  initialHeight: PropTypes.number.isRequired,
  initialTop: PropTypes.number,
  initialLeft: PropTypes.number,
};

export default Float;
