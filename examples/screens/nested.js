import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import Layout from '../../src/components/Layout';
import Container from '../../src/components/Container';

import ShowDimensions from '../components/ShowDimensions';

const Part = (props) => {
  const { deep, type } = props;
  if (deep >= 4) {
    const { dimensions } = props;
    return (
      <ShowDimensions width={dimensions.width} height={dimensions.height} />
    );
  }

  const nextType = type === Layout.ROW ? Layout.COLUMN : Layout.ROW;

  return (
    <Layout type={type}>
      <Container>
        {({ dimensions }) => (
          <ShowDimensions width={dimensions.width} height={dimensions.height} />
        )}
      </Container>
      <Container>
        {({ dimensions }) => (
          <Part deep={deep + 1} type={nextType} dimensions={dimensions} />
        )}
      </Container>
    </Layout>
  );
};

Part.propTypes = {
  deep: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  dimensions: PropTypes.object,
};

const Nested = () => {
  return <Part deep={0} type={Layout.ROW} />;
};

ReactDOM.render(<Nested />, document.getElementById('root'));
