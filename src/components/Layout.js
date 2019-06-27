// @ts-check
import React, { Children, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import Divider from './Divider';
import LayoutContext from '../contexts/LayoutContext';
import useDimensions from '../hooks/useDimensions';
import { layoutTypes } from '../utils/enums';
import useContextLayout from '../hooks/useContextLayout';
import useEventSystem from '../hooks/useEventSystem';

/**
 * @typedef {import('../hooks/useDimensions').Dimensions} Dimensions
 * @typedef {import('../contexts/LayoutContext').LayoutContextType} LayoutContextType
 * @typedef {import('../utils/size').SizeDescriptor} SizeDescriptor
 * @typedef {import('../utils/events').EventSystem} EventSystem
 * @typedef {import('../utils/events').OnEvent} OnEvent
 * @typedef {import('../utils/events').OffEvent} OffEvent
 * @typedef {import('../utils/events').FireEvent} FireEvent
 * @typedef {import('../store/containers').ContainersState} ContainersState
 * @typedef {import('../store/containers').Container} Container
 */

/**
 *
 * @typedef ResultChildrenReducer
 * @property {Container} containers
 * @property {number} totalSize
 * @property {number[]} autoSizes
 * @property {number[]} variableSizes
 */

/**
 *
 * @callback ChildrenReducer
 * @param {ResultChildrenReducer} result
 * @param {object} child
 * @param {number} index
 * @returns {ResultChildrenReducer}
 */

/**
 *
 * @param {object} params
 * @param {string} params.type
 * @param {Dimensions} params.dimensions
 * @param {object} params.variableContainersRef
 * @param {object} params.layoutEventsRef
 * @param {object} params.containersEventsRef
 * @returns {LayoutContextType}
 */
const createLayoutContext = ({
  type,
  dimensions,
  variableContainersRef,
  layoutEventsRef,
  containersEventsRef,
}) => {
  return {
    layoutEventsRef,
    containersEventsRef,
    variableContainersRef,
    isRoot: false,
    dimensions,
    type,
  };
};

const useParentLayoutEvents = ({ onCheckDimensions }, dimensions) => {
  const { layoutEventsRef } = useContextLayout();
  useEffect(() => {
    const isRoot = !layoutEventsRef;
    if (!isRoot) {
      const { current: layoutEvents } = layoutEventsRef;
      layoutEvents.on('resize', onCheckDimensions);

      return () => layoutEvents.off('resize', onCheckDimensions);
    }
  }, [onCheckDimensions, layoutEventsRef, dimensions]);
};

const useLayoutDimensions = (elementRef) => {
  const { layoutEventsRef } = useContextLayout();
  const isRoot = !layoutEventsRef;
  return useDimensions(elementRef, isRoot);
};

const Layout = (props) => {
  const variableContainersRef = useRef([]);
  const elementRef = useRef(null);
  const { dimensions, checkDimensions, setElement } = useLayoutDimensions(
    elementRef,
  );
  const { layoutEventsRef, containersEventsRef } = useEventSystem();
  const { children, type, floats } = props;
  const { current: layoutEvents } = layoutEventsRef;
  const { current: containersEvents } = containersEventsRef;
  const { current: variableContainers } = variableContainersRef;
  const style = { flexDirection: type };

  const childrenArr = Children.toArray(children);

  variableContainers.length = 0;
  const { content } = childrenArr.reduce(
    (result, child, index, list) => {
      const { isFixedSize, id } = child.props;
      const isLast = index === list.length - 1;
      const { content } = result;

      content.push(child);

      if (isFixedSize) {
        const index = variableContainers.indexOf(id);
        variableContainers.splice(index, 1);
      } else if (!variableContainers.includes(id)) {
        variableContainers.push(id);
      }

      if (isFixedSize || isLast) {
        return result;
      }

      const onSizeChange = (change) => {
        const { diff } = change;

        containersEvents.fire(`resize.${id}`, {
          diff,
        });
        containersEvents.fire(`resize.${after}`, {
          diff: -diff,
        });
      };

      const after = list[index + 1].props.id;
      content.push(
        <Divider
          before={id}
          after={after}
          key={`${id}-${after}`}
          onSizeChange={onSizeChange}
        />,
      );

      return result;
    },
    { content: [] },
  );

  const contextValue = createLayoutContext({
    layoutEventsRef,
    containersEventsRef,
    type,
    dimensions,
    variableContainersRef,
  });

  useEffect(() => {
    const { lastHeight, lastWidth, width, height } = dimensions;

    if (lastHeight === 0 && lastWidth === 0) {
      return;
    }

    const diff = {
      width: width - lastWidth,
      height: height - lastHeight,
    };

    const containersDiff = type === layoutTypes.ROW ? diff.width : diff.height;

    if (containersDiff !== 0) {
      containersEvents.fire('layout-resize', containersDiff);
    } else if (diff.width !== 0 || diff.height !== 0) {
      layoutEvents.fire('resize');
    }
  }, [dimensions, type, layoutEvents, containersEvents]);

  const onCheckDimensions = useCallback(() => {
    checkDimensions();
  }, [checkDimensions]);

  useParentLayoutEvents({ onCheckDimensions }, dimensions);

  return (
    <LayoutContext.Provider value={contextValue}>
      <div ref={setElement} className="rdl-layout" style={style}>
        {content}
        {floats}
      </div>
    </LayoutContext.Provider>
  );
};

Layout.defaultValues = {
  type: layoutTypes.ROW,
  floats: [],
};

Layout.propTypes = {
  floats: PropTypes.array,
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(Object.values(layoutTypes)),
};

Object.assign(Layout, layoutTypes);

export default Layout;
